'use server'

import { db } from '@/lib/db'
import { members, tithes } from '@/lib/db/schema'
import {
    getSheetData,
    getAllSheetNames,
    SHEET_NAMES,
    parseMembershipRow,
    parseTitheRow,
} from '@/lib/google-sheets'
import { desc, ilike, or, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getAvailableSheets() {
    try {
        const sheets = await getAllSheetNames()
        return { success: true, sheets }
    } catch (error) {
        return { success: false, error: (error as Error).message, sheets: [] }
    }
}

export async function syncMembersFromSheet(sheetName: string = SHEET_NAMES.MEMBERSHIP) {
    try {
        const rows = await getSheetData(sheetName)

        if (rows.length < 2) {
            return { success: false, error: 'No data found in sheet', imported: 0 }
        }

        const headers = rows[0] as string[]
        const dataRows = rows.slice(1)

        // Get last member ID
        const [lastMember] = await db
            .select({ memberId: members.memberId })
            .from(members)
            .orderBy(desc(members.createdAt))
            .limit(1)

        let nextNumber = 1
        if (lastMember?.memberId) {
            const match = lastMember.memberId.match(/GNC-(\d+)/)
            if (match) nextNumber = parseInt(match[1], 10) + 1
        }

        let imported = 0
        let skipped = 0

        for (const row of dataRows) {
            try {
                const parsed = parseMembershipRow(headers, row as string[])

                if (!parsed.name || !parsed.telephone) {
                    skipped++
                    continue
                }

                // Split name into first/last
                const nameParts = parsed.name.trim().split(/\s+/)
                const firstName = nameParts[0] || 'Unknown'
                const lastName = nameParts.slice(1).join(' ') || ''

                // Parse gender
                let gender: 'male' | 'female' | undefined
                const sex = parsed.sex.toLowerCase()
                if (sex === 'm' || sex === 'male') gender = 'male'
                else if (sex === 'f' || sex === 'female') gender = 'female'

                // Clean phone
                const phone = parsed.telephone.replace(/\D/g, '').replace(/^233/, '0')
                if (phone.length < 9) {
                    skipped++
                    continue
                }

                const memberId = `GNC-${String(nextNumber).padStart(4, '0')}`

                await db.insert(members).values({
                    memberId,
                    firstName,
                    lastName,
                    phonePrimary: phone,
                    gender,
                    address: parsed.residence || undefined,
                    maritalStatus: parsed.maritalStatus?.toLowerCase() as any || undefined,
                    occupation: parsed.occupation || undefined,
                    memberStatus: 'active',
                    joinDate: new Date().toISOString().split('T')[0],
                    isBaptized: parsed.baptismStatus?.toLowerCase().includes('yes') ||
                        parsed.baptismStatus?.toLowerCase().includes('baptized'),
                })

                imported++
                nextNumber++
            } catch {
                skipped++
            }
        }

        revalidatePath('/members')
        return { success: true, imported, skipped, total: dataRows.length }
    } catch (error) {
        return { success: false, error: (error as Error).message, imported: 0 }
    }
}

export async function syncTithesFromSheet(year: number = new Date().getFullYear()) {
    try {
        const rows = await getSheetData(SHEET_NAMES.TITHES)

        if (rows.length < 2) {
            return { success: false, error: 'No data found', imported: 0 }
        }

        const headers = rows[0] as string[]
        const dataRows = rows.slice(1)

        let imported = 0
        let skipped = 0

        for (const row of dataRows) {
            const parsed = parseTitheRow(headers, row as string[])
            if (!parsed.name || parsed.total === 0) {
                skipped++
                continue
            }

            // Find member by name (first or last name match)
            const nameParts = parsed.name.trim().split(/\s+/)
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            const memberResults = await db
                .select({ id: members.id })
                .from(members)
                .where(
                    or(
                        ilike(members.firstName, `%${firstName}%`),
                        ilike(members.lastName, `%${lastName}%`)
                    )
                )
                .limit(1)

            if (memberResults.length === 0) {
                skipped++
                continue
            }

            // Import each month with a value
            for (const [month, amount] of Object.entries(parsed.months)) {
                if (amount > 0) {
                    const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december'].indexOf(month)

                    if (monthIndex >= 0) {
                        const monthStr = String(monthIndex + 1).padStart(2, '0')
                        const paymentDate = `${year}-${monthStr}-01`
                        const monthYear = `${year}-${monthStr}`

                        await db.insert(tithes).values({
                            memberId: memberResults[0].id,
                            amount: String(amount),
                            paymentDate,
                            monthYear,
                            paymentMethod: 'cash',
                        })
                        imported++
                    }
                }
            }
        }

        revalidatePath('/finance')
        return { success: true, imported, skipped, total: dataRows.length }
    } catch (error) {
        return { success: false, error: (error as Error).message, imported: 0 }
    }
}

export async function syncAttendanceFromSheet() {
    try {
        const { services, attendance } = await import('@/lib/db/schema')
        const rows = await getSheetData(SHEET_NAMES.ATTENDANCE)

        if (rows.length < 2) {
            return { success: false, error: 'No data found in sheet', imported: 0 }
        }

        const headers = rows[0] as string[]
        const dataRows = rows.slice(1)

        // Group by date to create services
        const dateGroups = new Map<string, string[][]>()

        for (const row of dataRows) {
            const data: Record<string, string> = {}
            headers.forEach((header, index) => {
                data[header.toLowerCase().trim()] = (row as string[])[index] || ''
            })

            const date = data['date'] || data['service date'] || ''
            if (!date) continue

            if (!dateGroups.has(date)) {
                dateGroups.set(date, [])
            }
            dateGroups.get(date)!.push(row as string[])
        }

        let servicesCreated = 0
        let attendanceImported = 0
        let skipped = 0

        for (const [date, attendeeRows] of dateGroups) {
            // Parse date - handle different formats
            let serviceDate: string
            try {
                const parsed = new Date(date)
                if (isNaN(parsed.getTime())) {
                    skipped += attendeeRows.length
                    continue
                }
                serviceDate = parsed.toISOString().split('T')[0]
            } catch {
                skipped += attendeeRows.length
                continue
            }

            // Create or find service for this date
            const existingService = await db
                .select({ id: services.id })
                .from(services)
                .where(eq(services.serviceDate, serviceDate))
                .limit(1)

            let serviceId: string

            if (existingService.length > 0) {
                serviceId = existingService[0].id
            } else {
                const dayName = new Date(serviceDate).toLocaleDateString('en-US', { weekday: 'long' })
                const [newService] = await db.insert(services).values({
                    name: `${dayName} Service`,
                    serviceType: dayName === 'Sunday' ? 'Sunday Service' : 'Midweek Service',
                    serviceDate,
                }).returning()
                serviceId = newService.id
                servicesCreated++
            }

            // Record attendance for each member
            for (const row of attendeeRows) {
                const data: Record<string, string> = {}
                headers.forEach((header, index) => {
                    data[header.toLowerCase().trim()] = row[index] || ''
                })

                const name = data['name'] || data['member name'] || data['member'] || ''
                if (!name) {
                    skipped++
                    continue
                }

                // Find member by name
                const nameParts = name.trim().split(/\s+/)
                const firstName = nameParts[0] || ''

                const memberResults = await db
                    .select({ id: members.id })
                    .from(members)
                    .where(ilike(members.firstName, `%${firstName}%`))
                    .limit(1)

                if (memberResults.length === 0) {
                    skipped++
                    continue
                }

                try {
                    await db.insert(attendance).values({
                        serviceId,
                        memberId: memberResults[0].id,
                        checkInMethod: 'imported',
                    }).onConflictDoNothing()
                    attendanceImported++
                } catch {
                    skipped++
                }
            }
        }

        revalidatePath('/attendance')
        return {
            success: true,
            imported: attendanceImported,
            servicesCreated,
            skipped,
            total: dataRows.length
        }
    } catch (error) {
        return { success: false, error: (error as Error).message, imported: 0 }
    }
}
