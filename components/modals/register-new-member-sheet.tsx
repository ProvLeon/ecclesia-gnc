'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2 } from 'lucide-react'
import { registerNewMemberToDepartment } from '@/app/actions/departments'
import { toast } from 'sonner'

interface RegisterNewMemberSheetProps {
    departmentId: string
    departmentName: string
    trigger?: React.ReactNode
}

export function RegisterNewMemberSheet({ departmentId, departmentName, trigger }: RegisterNewMemberSheetProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phonePrimary: '',
        email: '',
        gender: '' as 'male' | 'female' | '',
        address: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.firstName || !formData.lastName || !formData.phonePrimary) {
            toast.error('Please fill in required fields')
            return
        }

        setLoading(true)

        const result = await registerNewMemberToDepartment(departmentId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phonePrimary: formData.phonePrimary,
            email: formData.email || undefined,
            gender: formData.gender || undefined,
            address: formData.address || undefined,
        })

        if (result.success) {
            toast.success(`${formData.firstName} ${formData.lastName} has been registered and added to ${departmentName}`)
            setFormData({ firstName: '', lastName: '', phonePrimary: '', email: '', gender: '', address: '' })
            setOpen(false)
            router.refresh()
        } else {
            toast.error(result.error || 'Failed to register member')
        }

        setLoading(false)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register New Member
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-purple-600" />
                        Register New Member
                    </SheetTitle>
                    <SheetDescription>
                        Add a new church member directly to <strong>{departmentName}</strong>.
                        They will be registered in the church database and linked to this department.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phonePrimary}
                            onChange={(e) => setFormData({ ...formData, phonePrimary: e.target.value })}
                            placeholder="0244123456"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val as 'male' | 'female' })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Accra, Ghana"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Register
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
