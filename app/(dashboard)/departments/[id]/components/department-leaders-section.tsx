'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Crown,
    UserPlus,
    MoreVertical,
    Trash2,
    Phone,
    Mail,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addDepartmentLeader, removeDepartmentLeader, type DepartmentLeaderRole } from '@/app/actions/departments'
import { toast } from 'sonner'

const roleColors: Record<string, string> = {
    president: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
    vice_president: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
    secretary: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
    treasurer: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    coordinator: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
}

const roleLabels: Record<string, string> = {
    president: 'President',
    vice_president: 'Vice President',
    secretary: 'Secretary',
    treasurer: 'Treasurer',
    coordinator: 'Coordinator',
}

interface Leader {
    id: string
    role: string
    isActive: boolean
    assignedDate: string | null
    memberId: string
    memberName: string
    memberPhone: string | null
    memberEmail: string | null
}

interface AvailableMember {
    id: string
    name: string
    phone: string | null
}

interface DepartmentLeadersSectionProps {
    departmentId: string
    leaders: Leader[]
    availableMembers: AvailableMember[]
    canManage?: boolean
}

export function DepartmentLeadersSection({
    departmentId,
    leaders,
    availableMembers,
    canManage = false,
}: DepartmentLeadersSectionProps) {
    const router = useRouter()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedMemberId, setSelectedMemberId] = useState('')
    const [selectedRole, setSelectedRole] = useState<DepartmentLeaderRole>('coordinator')
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredMembers = availableMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddLeader = async () => {
        if (!selectedMemberId || !selectedRole) {
            toast.error('Please select a member and role')
            return
        }

        setLoading(true)
        try {
            const res = await addDepartmentLeader(departmentId, selectedMemberId, selectedRole)
            if (res.success) {
                toast.success('Leader added successfully')
                setSheetOpen(false)
                setSelectedMemberId('')
                setSelectedRole('coordinator')
                router.refresh()
            } else {
                toast.error(res.error || 'Failed to add leader')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveLeader = async (leaderId: string) => {
        if (!confirm('Remove this leader from the department?')) return

        try {
            const res = await removeDepartmentLeader(leaderId)
            if (res.success) {
                toast.success('Leader removed')
                router.refresh()
            } else {
                toast.error('Failed to remove leader')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <CardTitle className="text-lg">Leadership</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                            {leaders.length}
                        </Badge>
                    </div>
                    {canManage && (
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Leader
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Add Department Leader</SheetTitle>
                                    <SheetDescription>
                                        Assign a member to a leadership position in this department.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-6 mt-6 p-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select
                                            value={selectedRole}
                                            onValueChange={(v) => setSelectedRole(v as DepartmentLeaderRole)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="president">President</SelectItem>
                                                <SelectItem value="vice_president">Vice President</SelectItem>
                                                <SelectItem value="secretary">Secretary</SelectItem>
                                                <SelectItem value="treasurer">Treasurer</SelectItem>
                                                <SelectItem value="coordinator">Coordinator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Search Member</Label>
                                        <Input
                                            placeholder="Search by name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Select Member</Label>
                                        <div className="border rounded-md max-h-64 overflow-y-auto">
                                            {filteredMembers.length === 0 ? (
                                                <p className="p-4 text-center text-slate-500 text-sm">
                                                    No members found
                                                </p>
                                            ) : (
                                                filteredMembers.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => setSelectedMemberId(member.id)}
                                                        className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedMemberId === member.id
                                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                                            : ''
                                                            }`}
                                                    >
                                                        <p className="font-medium text-sm">{member.name}</p>
                                                        {member.phone && (
                                                            <p className="text-xs text-slate-500">{member.phone}</p>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAddLeader}
                                        disabled={!selectedMemberId || loading}
                                        className="w-full"
                                    >
                                        {loading ? 'Adding...' : 'Add Leader'}
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {leaders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Crown className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No leaders assigned yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leaders.map((leader) => (
                            <div
                                key={leader.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                            {leader.memberName
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {leader.memberName}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge
                                                variant="outline"
                                                className={roleColors[leader.role] || roleColors.coordinator}
                                            >
                                                {roleLabels[leader.role] || leader.role}
                                            </Badge>
                                            {leader.memberPhone && (
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {leader.memberPhone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {canManage && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => handleRemoveLeader(leader.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove Leader
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
