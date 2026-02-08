
import 'dotenv/config'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { searchUnassignedMembers } from '@/app/actions/shepherding'
import { getMembersForAttendance } from '@/app/actions/attendance'
import { ilike, or, and, sql } from 'drizzle-orm'

// Helper to simulate the OLD vs NEW logic
async function testSearch(label: string, query: string, action: (q: string) => Promise<any[]>) {
    console.log(`\nTesting ${label} with query: "${query}"`)
    try {
        const results = await action(query)
        console.log(`Found: ${results.length}`)
        if (results.length > 0) {
            console.log(`First match: ${JSON.stringify(results[0])}`)
        }
    } catch (e) {
        console.error(`Failed:`, e)
    }
}

async function verifyImprovedSearch() {
    console.log('--- Verifying Improved Search Logic ---')

    // 1. Find a member with at least 2 names to test with
    const [testMember] = await db.select().from(members).limit(1)
    if (!testMember) {
        console.log('No members found to test.')
        process.exit(0)
    }

    const firstName = testMember.firstName || ''
    const lastName = testMember.lastName || ''
    const fullName = `${firstName} ${lastName}`
    const reversedName = `${lastName} ${firstName}`

    console.log(`Test Member: ${fullName} (ID: ${testMember.memberId})`)

    // 2. Test Attendance Search
    // We expect "LastName FirstName" to FAIL with old logic, PASS with new logic
    await testSearch('Attendance (Reversed Name)', reversedName, async (q) => getMembersForAttendance(null, q))

    // We expect "FirstName PartOfID" to FAIL with old logic, PASS with new logic
    // if memberId is present
    if (testMember.memberId) {
        const partialId = testMember.memberId.substring(0, 3)
        const hybridQuery = `${firstName} ${partialId}`
        await testSearch('Attendance (Name + Partial ID)', hybridQuery, async (q) => getMembersForAttendance(null, q))
    }

    process.exit(0)
}

verifyImprovedSearch()
