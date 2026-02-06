'use server'

import { db } from '@/lib/db'
import {
  members,
  shepherds,
  shepherdAssignments,
  followUps,
  departments,
  services,
  attendance,
  tithes,
  offerings,
  expenses,
  events,
  followUpAuditLog,
  users,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/app/actions/auth'

// Helper function to check permissions
async function checkDeletePermission(requiredRole: string[]): Promise<boolean> {
  const user = await getUser()
  if (!user) return false

  const [userRecord] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userRecord) return false
  return requiredRole.includes(userRecord.role)
}

// Delete Member
export async function deleteMember(memberId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - only admins can delete members' }
    }

    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Check if member is a shepherd
    const [shepherd] = await db
      .select()
      .from(shepherds)
      .where(eq(shepherds.memberId, memberId))
      .limit(1)

    if (shepherd) {
      return { success: false, error: 'Cannot delete member who is a shepherd. Demote first.' }
    }

    // Delete member and related records (cascade)
    await db.delete(members).where(eq(members.id, memberId))

    revalidatePath('/members')
    return { success: true, message: `Member ${member.firstName} ${member.lastName} deleted` }
  } catch (error) {
    console.error('Error deleting member:', error)
    return { success: false, error: 'Failed to delete member' }
  }
}

// Delete Shepherd Assignment
export async function deleteShepherdAssignment(assignmentId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'pastor'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [assignment] = await db
      .select()
      .from(shepherdAssignments)
      .where(eq(shepherdAssignments.id, assignmentId))
      .limit(1)

    if (!assignment) {
      return { success: false, error: 'Assignment not found' }
    }

    await db.delete(shepherdAssignments).where(eq(shepherdAssignments.id, assignmentId))

    revalidatePath('/shepherding')
    revalidatePath('/shepherding/assignments')
    return { success: true, message: 'Assignment removed' }
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return { success: false, error: 'Failed to delete assignment' }
  }
}

// Delete Follow-Up
export async function deleteFollowUp(followUpId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'pastor', 'shepherd'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [followUp] = await db
      .select()
      .from(followUps)
      .where(eq(followUps.id, followUpId))
      .limit(1)

    if (!followUp) {
      return { success: false, error: 'Follow-up not found' }
    }

    // Check if shepherd can only delete their own
    const user = await getUser()
    const [userRecord] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user?.id || ''))
      .limit(1)

    if (userRecord?.role === 'shepherd' && followUp.createdBy !== user?.id) {
      return { success: false, error: 'Shepherds can only delete their own follow-ups' }
    }

    // Delete follow-up and its audit logs
    await db.delete(followUps).where(eq(followUps.id, followUpId))
    await db.delete(followUpAuditLog).where(eq(followUpAuditLog.followUpId, followUpId))

    revalidatePath('/shepherding')
    revalidatePath('/shepherding/follow-ups')
    return { success: true, message: 'Follow-up deleted' }
  } catch (error) {
    console.error('Error deleting follow-up:', error)
    return { success: false, error: 'Failed to delete follow-up' }
  }
}

// Delete Department
export async function deleteDepartment(departmentId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - only admins can delete departments' }
    }

    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1)

    if (!department) {
      return { success: false, error: 'Department not found' }
    }

    // Check if department has members
    const [deptMembers] = await db
      .select()
      .from(members)
      .where(eq(members.id, departmentId)) // This might need adjustment based on schema
      .limit(1)

    if (deptMembers) {
      return { success: false, error: 'Cannot delete department with members. Reassign members first.' }
    }

    await db.delete(departments).where(eq(departments.id, departmentId))

    revalidatePath('/departments')
    return { success: true, message: `Department ${department.name} deleted` }
  } catch (error) {
    console.error('Error deleting department:', error)
    return { success: false, error: 'Failed to delete department' }
  }
}

// Delete Service
export async function deleteService(serviceId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'pastor'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1)

    if (!service) {
      return { success: false, error: 'Service not found' }
    }

    // Delete service and related attendance records
    await db.delete(attendance).where(eq(attendance.serviceId, serviceId))
    await db.delete(services).where(eq(services.id, serviceId))

    revalidatePath('/attendance')
    return { success: true, message: 'Service and related records deleted' }
  } catch (error) {
    console.error('Error deleting service:', error)
    return { success: false, error: 'Failed to delete service' }
  }
}

// Delete Attendance Record
export async function deleteAttendanceRecord(attendanceId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'pastor'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [record] = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, attendanceId))
      .limit(1)

    if (!record) {
      return { success: false, error: 'Attendance record not found' }
    }

    await db.delete(attendance).where(eq(attendance.id, attendanceId))

    revalidatePath('/attendance')
    return { success: true, message: 'Attendance record deleted' }
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return { success: false, error: 'Failed to delete attendance record' }
  }
}

// Delete Tithe Record
export async function deleteThithe(titheId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'treasurer'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [record] = await db
      .select()
      .from(tithes)
      .where(eq(tithes.id, titheId))
      .limit(1)

    if (!record) {
      return { success: false, error: 'Tithe record not found' }
    }

    await db.delete(tithes).where(eq(tithes.id, titheId))

    revalidatePath('/finance')
    return { success: true, message: 'Tithe record deleted' }
  } catch (error) {
    console.error('Error deleting tithe:', error)
    return { success: false, error: 'Failed to delete tithe record' }
  }
}

// Delete Offering Record
export async function deleteOffering(offeringId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'treasurer'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [record] = await db
      .select()
      .from(offerings)
      .where(eq(offerings.id, offeringId))
      .limit(1)

    if (!record) {
      return { success: false, error: 'Offering record not found' }
    }

    await db.delete(offerings).where(eq(offerings.id, offeringId))

    revalidatePath('/finance')
    return { success: true, message: 'Offering record deleted' }
  } catch (error) {
    console.error('Error deleting offering:', error)
    return { success: false, error: 'Failed to delete offering record' }
  }
}

// Delete Expense Record
export async function deleteExpense(expenseId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'treasurer'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [record] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1)

    if (!record) {
      return { success: false, error: 'Expense record not found' }
    }

    await db.delete(expenses).where(eq(expenses.id, expenseId))

    revalidatePath('/finance')
    return { success: true, message: 'Expense record deleted' }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return { success: false, error: 'Failed to delete expense record' }
  }
}

// Delete Event
export async function deleteEvent(eventId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin', 'admin', 'pastor', 'dept_leader'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - insufficient permissions' }
    }

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    await db.delete(events).where(eq(events.id, eventId))

    revalidatePath('/events')
    return { success: true, message: `Event ${event.title} deleted` }
  } catch (error) {
    console.error('Error deleting event:', error)
    return { success: false, error: 'Failed to delete event' }
  }
}

// Delete User
export async function deleteUser(userId: string) {
  try {
    const hasPermission = await checkDeletePermission(['super_admin'])
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized - only super admins can delete users' }
    }

    const authUser = await getUser()
    if (authUser?.id === userId) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Prevent deleting super admin unless necessary
    if (user.role === 'super_admin') {
      return { success: false, error: 'Cannot delete super admin accounts. Contact support.' }
    }

    await db.delete(users).where(eq(users.id, userId))

    revalidatePath('/settings')
    return { success: true, message: `User ${user.email} deleted` }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}
