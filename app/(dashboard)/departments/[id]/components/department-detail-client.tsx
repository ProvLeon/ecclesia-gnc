'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Building2,
    Users,
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Edit,
    UserPlus,
    MoreVertical,
    Trash2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DepartmentFormSheet } from '@/components/modals/department-form-sheet'
import { MemberDetailsSheet } from '@/components/modals/member-details-sheet'
import { MemberFormSheet } from '@/components/modals/member-form-sheet'
import { AddDepartmentMemberSheet } from '@/components/modals/add-department-member-sheet'
import { RegisterNewMemberSheet } from '@/components/modals/register-new-member-sheet'
import { removeMemberFromDepartment } from '@/app/actions/department-members'
import { toast } from 'sonner' // Assuming toast is available, if not we'll use a simple alert or just router.refresh

const roleColors: Record<string, string> = {
    member: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    leader: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    co_leader: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

const roleLabels: Record<string, string> = {
    member: 'Member',
    leader: 'Leader',
    co_leader: 'Co-Leader',
    default: 'Member'
}

interface Member {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    joinedAt: string | null
    joinDate: string | null
    role: string
}

interface Department {
    id: string
    name: string
    description: string | null
    isActive: boolean | null
    createdAt: Date | null
}

interface DepartmentDetailClientProps {
    department: Department
    members: Member[]
}

export function DepartmentDetailClient({ department, members }: DepartmentDetailClientProps) {
    const router = useRouter()
    const [editSheetOpen, setEditSheetOpen] = useState(false)
    const [addMemberSheetOpen, setAddMemberSheetOpen] = useState(false)
    const [_, setLoadingId] = useState<string | null>(null)
    // Member editing state
    const [memberEditOpen, setMemberEditOpen] = useState(false)
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [selectedMemberData, setSelectedMemberData] = useState<any>(null)

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member from the department?')) return

        setLoadingId(memberId)
        try {
            const res = await removeMemberFromDepartment(department.id, memberId)
            if (res.success) {
                toast.success("Member removed")
                router.refresh()
            } else {
                toast.error('Failed to remove member')
            }
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        } finally {
            setLoadingId(null)
        }
    }

    const handleEdit = (member: any) => {
        setSelectedMemberId(member.id || member)
        setSelectedMemberData(typeof member === 'object' ? member : null)
        // Small delay to ensure clean transition
        setTimeout(() => setMemberEditOpen(true), 50)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/departments">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                            <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{department.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{department.description || 'No description'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <RegisterNewMemberSheet
                        departmentId={department.id}
                        departmentName={department.name}
                    />
                    <Button variant="outline" onClick={() => setAddMemberSheetOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />Add Existing Member
                    </Button>
                    <Button variant="outline" onClick={() => setEditSheetOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />Edit
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Members</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{members.length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                                <Badge className="mt-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                                    {department.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Building2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Created</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white mt-2">
                                    {department.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">Department Members</CardTitle>
                            <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {members.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No members yet</p>
                            <p className="text-sm mt-1">Add members to this department</p>
                            <Button className="mt-4" size="sm" onClick={() => setAddMemberSheetOpen(true)}>
                                <UserPlus className="h-4 w-4 mr-2" />Add First Member
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Member</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Join Date</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {members.map((m) => (
                                            <tr
                                                key={m.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                                onClick={() => setSelectedMemberId(m.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 dark:from-primary/40 dark:to-accent/40 flex items-center justify-center font-semibold text-sm text-primary dark:text-accent shrink-0">
                                                            <Avatar className="h-full w-full">
                                                                <AvatarFallback className="bg-transparent text-primary dark:text-accent">
                                                                    {m.firstName?.[0]}{m.lastName?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                                {m.firstName} {m.lastName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {m.phone && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                                <Phone className="h-4 w-4 shrink-0" />
                                                                {m.phone}
                                                            </p>
                                                        )}
                                                        {m.email && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate">
                                                                <Mail className="h-4 w-4 shrink-0" />
                                                                {m.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 font-normal border ${roleColors[m.role] || roleColors['default']}`}>
                                                        {roleLabels[m.role] || roleLabels['default']}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 shrink-0" />
                                                        {m.joinDate ? new Date(m.joinDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-500 hover:text-slate-700"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setSelectedMemberId(m.id)}>
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRemoveMember(m.id)
                                                            }}>
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove from Department
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/20">
                                {members.map((m) => (
                                    <div
                                        key={m.id}
                                        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm active:scale-[0.99] transition-transform"
                                        onClick={() => setSelectedMemberId(m.id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {m.firstName?.[0]}{m.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                                        {m.firstName} {m.lastName}
                                                    </h3>
                                                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 font-normal mt-1 ${roleColors[m.role] || roleColors['default']}`}>
                                                        {roleLabels[m.role] || roleLabels['default']}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -mr-2 text-slate-400"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="text-red-600" onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveMember(m.id)
                                                        }}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                            {m.phone && (
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span className="truncate">{m.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Joined {m.joinDate ? new Date(m.joinDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <DepartmentFormSheet
                departmentId={department.id}
                initialData={{ name: department.name, description: department.description }}
                open={editSheetOpen}
                onOpenChange={setEditSheetOpen}
            />

            <AddDepartmentMemberSheet
                departmentId={department.id}
                open={addMemberSheetOpen}
                onOpenChange={setAddMemberSheetOpen}
            />

            <MemberDetailsSheet
                memberId={selectedMemberId}
                open={!!selectedMemberId}
                onOpenChange={(open) => !open && setSelectedMemberId(null)}
                onEdit={handleEdit}
            />

            <MemberFormSheet
                memberId={selectedMemberId}
                initialData={selectedMemberData}
                open={memberEditOpen}
                onOpenChange={setMemberEditOpen}
            />
        </div>
    )
}
