'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'

const ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'shepherd', label: 'Shepherd' },
  { value: 'dept_leader', label: 'Department Leader' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'pastor', label: 'Pastor' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

const PERMISSIONS = [
  { id: 'view_members', label: 'View Members' },
  { id: 'manage_members', label: 'Manage Members' },
  { id: 'view_finance', label: 'View Finance' },
  { id: 'manage_finance', label: 'Manage Finance' },
  { id: 'view_attendance', label: 'View Attendance' },
  { id: 'manage_attendance', label: 'Manage Attendance' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_reports', label: 'Manage Reports' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'manage_settings', label: 'Manage Settings' },
]

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'member',
    permissions: [] as string[],
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/settings/users'
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <Link href="/settings/users">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Add New User
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create a new user account and assign roles and permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700 dark:text-green-300">
                User created successfully! Redirecting...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+233 XXX XXX XXXX"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role & Access */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base">Role & Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">User Role *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Roles determine default permissions and access levels
              </p>
            </div>

            <div className="space-y-3">
              <Label>Additional Permissions</Label>
              <div className="space-y-2">
                {PERMISSIONS.map(permission => (
                  <div key={permission.id} className="flex items-center gap-2">
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={permission.id}
                      className="font-normal cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Grant additional permissions beyond role defaults
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={() =>
                  setFormData(prev => ({ ...prev, isActive: !prev.isActive }))
                }
                disabled={loading}
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                User account is active
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Link href="/settings/users">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              User Creation Tips
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex gap-2">
                <span className="text-primary dark:text-accent font-bold">•</span>
                <span>Email should be unique and valid for login purposes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary dark:text-accent font-bold">•</span>
                <span>User will receive a welcome email with login instructions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary dark:text-accent font-bold">•</span>
                <span>Permissions can be modified later from user details page</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary dark:text-accent font-bold">•</span>
                <span>Admin roles have full system access by default</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
