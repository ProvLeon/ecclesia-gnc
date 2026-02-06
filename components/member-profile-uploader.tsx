'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateMember } from '@/app/actions/members'
import { toast } from 'sonner'

interface MemberProfileUploaderProps {
    memberId?: string
    firstName: string
    lastName: string
    currentPhotoUrl?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
    onUploadComplete?: (url: string) => void
}

export function MemberProfileUploader({
    memberId,
    firstName,
    lastName,
    currentPhotoUrl,
    size = 'xl',
    onUploadComplete
}: MemberProfileUploaderProps) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const sizeClasses = {
        sm: 'h-10 w-10',
        md: 'h-16 w-16',
        lg: 'h-24 w-24',
        xl: 'h-32 w-32'
    }

    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        setUploading(true)

        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const id = memberId || 'new'
            const fileName = `${id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload image
            const { error: uploadError } = await supabase.storage
                .from('member-photos')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('member-photos')
                .getPublicUrl(filePath)

            if (onUploadComplete) {
                onUploadComplete(publicUrl)
                if (!memberId) {
                    setUploading(false)
                    toast.success('Photo uploaded')
                    return
                }
            }

            // Update member profile if memberId exists
            if (memberId) {
                await updateMember(memberId, { photoUrl: publicUrl })
                router.refresh()
                toast.success('Profile photo updated')
            }

        } catch (error) {
            console.error('Error uploading photo:', error)
            toast.error('Failed to upload photo')
        } finally {
            setUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="relative group">
            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 ring-2 ring-slate-100 dark:ring-slate-700 transition-all hover:opacity-90 ${uploading ? 'opacity-70' : ''}`}
            >
                <Avatar className={`${sizeClasses[size]}`}>
                    <AvatarImage src={currentPhotoUrl || ''} className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xl font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white/80" />
                </div>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {!currentPhotoUrl && !uploading && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                    }}
                >
                    <Camera className="h-4 w-4 text-slate-500" />
                </Button>
            )}
        </div>
    )
}
