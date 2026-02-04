'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, X, Upload } from 'lucide-react'
import { uploadMemberPhoto, deleteMemberPhoto } from '@/app/actions/storage'

interface PhotoUploadProps {
    memberId: string
    currentPhotoUrl?: string | null
    firstName?: string
    lastName?: string
    onUpload?: (url: string) => void
}

export function PhotoUpload({ memberId, currentPhotoUrl, firstName, lastName, onUpload }: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadMemberPhoto(memberId, formData)

        if (result.success && result.url) {
            setPhotoUrl(result.url)
            onUpload?.(result.url)
        } else {
            setError(result.error || 'Upload failed')
        }

        setUploading(false)
    }

    async function handleRemove() {
        if (!photoUrl) return

        setUploading(true)
        const result = await deleteMemberPhoto(memberId, photoUrl)

        if (result.success) {
            setPhotoUrl(null)
        }

        setUploading(false)
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-slate-200 dark:border-slate-700">
                    {photoUrl ? (
                        <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />
                    ) : null}
                    <AvatarFallback className="text-3xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}

                {photoUrl && !uploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : photoUrl ? (
                    <Camera className="h-4 w-4 mr-2" />
                ) : (
                    <Upload className="h-4 w-4 mr-2" />
                )}
                {photoUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <p className="text-xs text-slate-400">JPEG, PNG, or WebP. Max 5MB.</p>
        </div>
    )
}
