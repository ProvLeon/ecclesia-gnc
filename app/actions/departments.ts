'use server'

import { db } from '@/lib/db'
import { departments } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createDepartment(data: {
    name: string
    description?: string
}) {
    const [dept] = await db.insert(departments).values({
        name: data.name,
        description: data.description,
        isActive: true,
    }).returning()

    revalidatePath('/departments')
    return { success: true, department: dept }
}

export async function getDepartments() {
    return db
        .select({
            id: departments.id,
            name: departments.name,
        })
        .from(departments)
        .where(eq(departments.isActive, true))
        .orderBy(asc(departments.name))
}

export async function getDepartment(id: string) {
    const [dept] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, id))
        .limit(1)
    return dept
}

export async function updateDepartment(id: string, data: {
    name?: string
    description?: string
    isActive?: boolean
}) {
    await db.update(departments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(departments.id, id))

    revalidatePath('/departments')
    return { success: true }
}
