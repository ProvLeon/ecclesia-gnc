import { sql, and, or, ilike } from 'drizzle-orm'

/**
 * Creates a search condition for Drizzle ORM that allows multi-term searching across multiple fields.
 * 
 * Logic:
 * Splits the query string by spaces into terms.
 * For each term, creates a condition where that term must match at least one of the provided fields.
 * All term conditions are then combined with AND.
 * 
 * Example:
 * Query: "John Doe"
 * Fields: [firstName, lastName]
 * Result: (firstName ILIKE '%John%' OR lastName ILIKE '%John%') AND (firstName ILIKE '%Doe%' OR lastName ILIKE '%Doe%')
 * 
 * @param query The search string
 * @param fields The Drizzle columns to search against
 * @returns A SQL condition or undefined if query is empty
 */
export function getSearchConditions(query: string, fields: any[]) {
    if (!query || !query.trim()) return undefined

    const terms = query.trim().split(/\s+/).filter(term => term.length > 0)

    if (terms.length === 0) return undefined

    const termConditions = terms.map(term => {
        const pattern = `%${term}%`
        const fieldConditions = fields.map(field => {
            // Check if field is a SQL template or column
            // If it's a column, use ilike directly
            // If it's a SQL template (like concat), use sql with ILIKE
            if (field && typeof field === 'object' && 'name' in field) {
                return ilike(field, pattern)
            } else {
                // Assume it's a SQL object or expression that can be compared
                // For complex SQL expressions, we might need to wrap in sql``
                return sql`${field} ILIKE ${pattern}`
            }
        })

        return or(...fieldConditions)
    })

    return and(...termConditions)
}
