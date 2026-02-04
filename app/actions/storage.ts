'use server'

import { createClient } from '@/lib/supabase/server'
import { updateMember } from './members'
import { revalidatePath } from 'next/cache'

const BUCKET_NAME = 'member-photos'

export async function uploadMemberPhoto(memberId: string, formData: FormData) {
    const file = formData.get('file') as File

    if (!file) {
        return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Invalid file type. Use JPEG, PNG, or WebP.' }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File too large. Max 5MB.' }
    }

    const supabase = await createClient()

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const fileName = `${memberId}-${Date.now()}.${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (error) {
        console.error('Storage upload error:', error)
        return { success: false, error: 'Upload failed. Please try again.' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path)

    // Update member record with photo URL
    await updateMember(memberId, { photoUrl: urlData.publicUrl })

    revalidatePath(`/members/${memberId}`)

    return { success: true, url: urlData.publicUrl }
}

export async function deleteMemberPhoto(memberId: string, photoUrl: string) {
    const supabase = await createClient()

    // Extract file path from URL
    const urlParts = photoUrl.split(`${BUCKET_NAME}/`)
    const filePath = urlParts[1]

    if (filePath) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath])
    }

    // Clear photo URL from member record
    await updateMember(memberId, { photoUrl: '' })

    revalidatePath(`/members/${memberId}`)

    return { success: true }
}
