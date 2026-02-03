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
import { desc, ilike, or } from 'drizzle-orm'
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
