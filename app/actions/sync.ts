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

/**
 * Check if two names are similar (same parts in different order)
 * e.g., "John Doe" and "Doe John" would be considered similar
 */
function areNamesSimilar(name1: string, name2: string): boolean {
    const normalize = (name: string) =>
        name.toLowerCase().trim().split(/\s+/).sort().join(' ')
    return normalize(name1) === normalize(name2)
}

function cleanString(str: any): string | undefined {
    if (!str || typeof str !== 'string') return undefined
    const trimmed = str.trim()
    return trimmed === '' ? undefined : trimmed
}

interface SkippedEntry {
    row: number
    name: string
    phone: string
    reason: string
    existingMember?: string
    existingMemberId?: string
    rawData?: any // Store parsed data for resolution
}

export async function syncMembersFromSheet(sheetName: string = SHEET_NAMES.MEMBERSHIP) {
    try {
        const rows = await getSheetData(sheetName)

        if (rows.length < 2) {
            return { success: false, error: 'No data found in sheet', imported: 0, skippedEntries: [] }
        }

        const headers = rows[0] as string[]
        const dataRows = rows.slice(1)


        // Get last member ID - Sort by memberId to strictly get the highest number
        const [lastMember] = await db
            .select({ memberId: members.memberId })
            .from(members)
            .orderBy(desc(members.memberId))
            .limit(1)

        let nextNumber = 1
        if (lastMember?.memberId) {
            const match = lastMember.memberId.match(/GNC-(\d+)/)
            if (match) nextNumber = parseInt(match[1], 10) + 1
        }

        // Pre-fetch all existing phone numbers from database for duplicate checking
        const existingMembers = await db
            .select({
                id: members.id,
                firstName: members.firstName,
                lastName: members.lastName,
                phonePrimary: members.phonePrimary,
            })
            .from(members)

        // Create a map of existing phones -> member info for quick lookup
        const existingPhoneMap = new Map<string, { id: string; name: string }>()
        for (const m of existingMembers) {
            if (m.phonePrimary) {
                const cleanPhone = m.phonePrimary.replace(/\D/g, '').replace(/^233/, '0')
                existingPhoneMap.set(cleanPhone, {
                    id: m.id,
                    name: `${m.firstName} ${m.lastName}`.trim()
                })
            }
        }

        // Track phones within this import batch
        const importBatchPhones = new Map<string, { rowNum: number; name: string }>()

        let imported = 0
        let skipped = 0
        const skippedEntries: SkippedEntry[] = []

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i]
            const rowNum = i + 2 // +2 because row 1 is header, and array is 0-indexed
            let idAssigned = false

            try {
                const parsed = parseMembershipRow(headers, row as string[])

                if (!parsed.name) {
                    skipped++
                    skippedEntries.push({
                        row: rowNum,
                        name: 'Unknown',
                        phone: 'N/A',
                        reason: 'Missing name',
                        rawData: parsed
                    })
                    continue
                }

                // Split name into first/last
                const nameParts = parsed.name.trim().split(/\s+/)
                const firstName = nameParts[0] || 'Unknown'
                const lastName = nameParts.slice(1).join(' ') || ''
                const fullName = parsed.name.trim()

                // Parse gender
                let gender: 'male' | 'female' | undefined
                const sex = parsed.sex.toLowerCase()
                if (sex === 'm' || sex === 'male') gender = 'male'
                else if (sex === 'f' || sex === 'female') gender = 'female'

                // Clean phone if present
                let phone: string | undefined = undefined
                if (parsed.telephone) {
                    const cleaned = parsed.telephone.replace(/\D/g, '').replace(/^233/, '0')
                    // Only use phone if it looks valid-ish (at least 9 digits)
                    if (cleaned.length >= 9) {
                        phone = cleaned
                    } else if (parsed.telephone.trim().length > 0) {
                        // Phone was provided but invalid - log warning and skip
                        skipped++
                        skippedEntries.push({
                            row: rowNum,
                            name: fullName,
                            phone: parsed.telephone,
                            reason: 'Invalid phone number (too short)',
                            rawData: parsed
                        })
                        continue
                    }
                }

                // Check 1: Duplicate in existing database check (Only if phone exists)
                if (phone) {
                    const existingMember = existingPhoneMap.get(phone)
                    if (existingMember) {
                        skipped++
                        const isSimilarName = areNamesSimilar(fullName, existingMember.name)

                        // If exact match (same phone + similar name), skip silently as it's likely the same person
                        if (isSimilarName) {
                            continue
                        }

                        skippedEntries.push({
                            row: rowNum,
                            name: fullName,
                            phone,
                            reason: `Duplicate phone - different name (existing: "${existingMember.name}"). Please verify manually.`,
                            existingMember: existingMember.name,
                            existingMemberId: existingMember.id,
                            rawData: parsed
                        })
                        continue
                    }

                    // Check 2: Duplicate within this import batch
                    const batchDuplicate = importBatchPhones.get(phone)
                    if (batchDuplicate) {
                        skipped++
                        const isSimilarName = areNamesSimilar(fullName, batchDuplicate.name)

                        // If exact match in batch, skip silently
                        if (isSimilarName) {
                            continue
                        }

                        skippedEntries.push({
                            row: rowNum,
                            name: fullName,
                            phone,
                            reason: `Duplicate phone in import batch - different name from row ${batchDuplicate.rowNum} ("${batchDuplicate.name}"). Please verify manually.`,
                            existingMember: batchDuplicate.name,
                            rawData: parsed
                        })
                        continue
                    }

                    // Track this phone in the batch
                    importBatchPhones.set(phone, { rowNum, name: fullName })
                }

                idAssigned = true // We are about to use the ID
                const memberId = `GNC-${String(nextNumber).padStart(4, '0')}`

                const [newMember] = await db.insert(members).values({
                    memberId,
                    firstName,
                    lastName,
                    phonePrimary: phone || null,
                    gender,
                    address: cleanString(parsed.residence),
                    maritalStatus: cleanString(parsed.maritalStatus)?.toLowerCase() as any,
                    occupation: cleanString(parsed.occupation),
                    memberStatus: 'active',
                    joinDate: new Date().toISOString().split('T')[0],
                    isBaptized: !!(cleanString(parsed.baptismStatus)?.toLowerCase().includes('yes') ||
                        cleanString(parsed.baptismStatus)?.toLowerCase().includes('baptized')),
                }).returning()

                // Also add to existingPhoneMap so future rows in this batch don't create duplicates
                if (phone) {
                    existingPhoneMap.set(phone, { id: newMember.id, name: fullName })
                }

                // Auto-link to department if specified in sheet
                if (parsed.department && parsed.department.trim()) {
                    try {
                        const { findOrCreateDepartment } = await import('./departments')
                        const { memberDepartments } = await import('@/lib/db/schema')

                        const deptId = await findOrCreateDepartment(parsed.department)

                        await db.insert(memberDepartments).values({
                            memberId: newMember.id,
                            departmentId: deptId,
                            isActive: true,
                            joinDate: new Date().toISOString().split('T')[0],
                        }).onConflictDoNothing()
                    } catch (deptError) {
                        console.error('Failed to link department:', deptError)
                        // Continue even if department linking fails
                    }
                }

                imported++
                // Increment moved to finally block to ensure it happens if we used the ID
            } catch (err) {
                skipped++
                skippedEntries.push({
                    row: rowNum,
                    name: 'Unknown',
                    phone: 'Unknown',
                    reason: `Error processing row: ${err instanceof Error ? err.message : 'Unknown error'}`,
                    rawData: null
                })
            } finally {
                // If we attempted to assign an ID (meaning we passed validation checks), increment nextNumber
                // so the next row gets a fresh ID even if this one failed DB insert
                if (idAssigned) {
                    nextNumber++
                }
            }
        }

        revalidatePath('/members')
        revalidatePath('/departments')
        return {
            success: true,
            imported,
            skipped,
            total: dataRows.length,
            skippedEntries // Detailed log for admin review
        }
    } catch (error) {
        return { success: false, error: (error as Error).message, imported: 0, skippedEntries: [] }
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

/**
 * Resolve a skipped entry from the import process
 */
export async function resolveSkippedEntry(
    data: {
        action: 'overwrite' | 'create'
        existingMemberId?: string
        rawData: any // The original parsed row data
    }
) {
    try {
        const { action, existingMemberId, rawData } = data
        const parsed = rawData

        // Re-construct member data from raw parsed data
        // Split name into first/last
        const nameParts = parsed.name.trim().split(/\s+/)
        const firstName = nameParts[0] || 'Unknown'
        const lastName = nameParts.slice(1).join(' ') || ''

        // Parse gender
        let gender: 'male' | 'female' | undefined
        const sex = parsed.sex?.toLowerCase()
        if (sex === 'm' || sex === 'male') gender = 'male'
        else if (sex === 'f' || sex === 'female') gender = 'female'

        // Clean phone
        const phone = parsed.telephone ? parsed.telephone.replace(/\D/g, '').replace(/^233/, '0') : null

        const memberData = {
            firstName,
            lastName,
            phonePrimary: phone,
            gender,
            address: cleanString(parsed.residence),
            maritalStatus: cleanString(parsed.maritalStatus)?.toLowerCase() as any,
            occupation: cleanString(parsed.occupation),
            isBaptized: !!(cleanString(parsed.baptismStatus)?.toLowerCase().includes('yes') ||
                cleanString(parsed.baptismStatus)?.toLowerCase().includes('baptized')),
        }

        if (action === 'overwrite' && existingMemberId) {
            // Update existing member
            await db.update(members)
                .set({ ...memberData, updatedAt: new Date() })
                .where(eq(members.id, existingMemberId))

            revalidatePath('/members')
            return { success: true, message: 'Member updated successfully' }
        }
        else if (action === 'create') {
            // Generate ID
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
            const memberId = `GNC-${String(nextNumber).padStart(4, '0')}`

            // Create new member
            const [newMember] = await db.insert(members).values({
                ...memberData,
                memberId,
                memberStatus: 'active',
                joinDate: new Date().toISOString().split('T')[0],
            }).returning()

            // Link department if provided
            if (parsed.department && parsed.department.trim()) {
                try {
                    const { findOrCreateDepartment } = await import('./departments')
                    const { memberDepartments } = await import('@/lib/db/schema')
                    const deptId = await findOrCreateDepartment(parsed.department)
                    await db.insert(memberDepartments).values({
                        memberId: newMember.id,
                        departmentId: deptId,
                        isActive: true,
                        joinDate: new Date().toISOString().split('T')[0],
                    }).onConflictDoNothing()
                } catch (e) {
                    console.error('Failed to link department during resolution', e)
                }
            }

            revalidatePath('/members')
            return { success: true, message: 'New member created successfully' }
        }

        return { success: false, error: 'Invalid action or missing ID' }
    } catch (error) {
        console.error('Error resolving skipped entry:', error)
        return { success: false, error: 'Failed to resolve entry' }
    }
}

/**
 * Resolve multiple skipped entries at once
 */
export async function resolveSkippedEntries(
    data: {
        action: 'overwrite' | 'create' | 'dismiss'
        entries: Array<{
            existingMemberId?: string
            rawData: any
        }>
    }
) {
    try {
        const { action, entries } = data
        let successCount = 0
        let failCount = 0

        for (const entry of entries) {
            try {
                if (action === 'dismiss') {
                    // Just count as success, UI removes them
                    successCount++
                    continue
                }

                await resolveSkippedEntry({
                    action: action as 'overwrite' | 'create',
                    existingMemberId: entry.existingMemberId,
                    rawData: entry.rawData
                })
                successCount++
            } catch (e) {
                console.error(e)
                failCount++
            }
        }

        revalidatePath('/members')
        return { success: true, processed: successCount, failed: failCount }
    } catch (e) {
        return { success: false, error: 'Batch processing failed' }
    }
}
