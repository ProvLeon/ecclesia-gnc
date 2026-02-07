'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users, members } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DEFAULT_ROLE } from '@/lib/constants/roles'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && user.id) {
    // Sync user to database and fetch member details
    await syncAuthUserToDatabase(user.id, user.email!)

    // Fetch member profile to get photo and names
    const member = await db.query.members.findFirst({
      where: eq(members.userId, user.id),
      columns: {
        firstName: true,
        lastName: true,
        photoUrl: true
      }
    })

    if (member) {
      // Attach member details to user metadata for identification in UI
      user.user_metadata = {
        ...user.user_metadata,
        avatar_url: member.photoUrl || '',
        full_name: `${member.firstName} ${member.lastName}`,
        first_name: member.firstName,
        last_name: member.lastName
      }
    }
  }

  return user
}

async function syncAuthUserToDatabase(userId: string, email: string) {
  try {
    // Check if user already exists in database
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    // If user doesn't exist, create them with default role
    if (!existingUser) {
      await db.insert(users).values({
        id: userId,
        email: email,
        role: DEFAULT_ROLE, // Default to member role
      })
    }
  } catch (error) {
    console.error('Error syncing user to database:', error)
    // Non-fatal: continue even if sync fails
  }
}
