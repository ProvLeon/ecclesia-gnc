import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  decimal,
  integer,
  boolean,
  pgEnum,
  unique,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// ENUMS
// ============================================================================

export const departmentRoleEnum = pgEnum('department_role', [
  'member',
  'co_leader',
  'leader',
])

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'pastor',
  'admin',
  'treasurer',
  'dept_leader',
  'shepherd',
  'member',
])

export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'inactive',
  'visitor',
  'new_convert',
])

export const genderEnum = pgEnum('gender', ['male', 'female'])

export const maritalStatusEnum = pgEnum('marital_status', [
  'single',
  'married',
  'divorced',
  'widowed',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'mobile_money',
  'bank_transfer',
])

export const followUpTypeEnum = pgEnum('follow_up_type', [
  'phone_call',
  'visit',
  'prayer',
  'counseling',
])

export const followUpStatusEnum = pgEnum('follow_up_status', [
  'scheduled',
  'completed',
  'cancelled',
])

export const smsStatusEnum = pgEnum('sms_status', ['pending', 'sent', 'failed'])

export const expenseStatusEnum = pgEnum('expense_status', [
  'pending',
  'approved',
  'rejected',
])

// ============================================================================
// USERS TABLE - System users for authentication
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: userRoleEnum('role').notNull().default('member'),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// MEMBERS TABLE - Church members
// ============================================================================

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  memberId: varchar('member_id', { length: 20 }).notNull().unique(), // GNC-0001
  firstName: varchar('first_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  maritalStatus: maritalStatusEnum('marital_status'),
  phonePrimary: varchar('phone_primary', { length: 20 }).notNull(),
  phoneSecondary: varchar('phone_secondary', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  region: varchar('region', { length: 100 }),
  occupation: varchar('occupation', { length: 100 }),
  photoUrl: text('photo_url'),
  memberStatus: memberStatusEnum('member_status').notNull().default('active'),
  joinDate: date('join_date').notNull(),
  baptismDate: date('baptism_date'),
  isBaptized: boolean('is_baptized').notNull().default(false),
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// DEPARTMENTS TABLE - Church ministries/departments
// ============================================================================

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  leaderId: uuid('leader_id').references(() => members.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// MEMBER_DEPARTMENTS TABLE - Junction table for members and departments
// ============================================================================

export const memberDepartments = pgTable(
  'member_departments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    departmentId: uuid('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'cascade' }),
    role: departmentRoleEnum('role').notNull().default('member'),
    joinDate: date('join_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.memberId, table.departmentId)]
)

// ============================================================================
// SERVICES TABLE - Church services/events
// ============================================================================

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  serviceType: varchar('service_type', { length: 50 }).notNull(), // Regular, Special, Event
  serviceDate: date('service_date').notNull(),
  serviceTime: varchar('service_time', { length: 10 }), // HH:MM format
  departmentId: uuid('department_id').references(() => departments.id),
  location: varchar('location', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// ATTENDANCE TABLE - Service attendance records
// ============================================================================

export const attendance = pgTable(
  'attendance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    checkedInAt: timestamp('checked_in_at').notNull().defaultNow(),
    checkInMethod: varchar('check_in_method', { length: 50 }), // Manual, QR Code, etc.
    recordedBy: uuid('recorded_by').references(() => users.id),
  },
  (table) => [unique().on(table.memberId, table.serviceId)]
)

// ============================================================================
// TITHES TABLE - Member tithe records
// ============================================================================

export const tithes = pgTable('tithes', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id, {
    onDelete: 'set null',
  }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  paymentReference: varchar('payment_reference', { length: 100 }),
  paymentDate: date('payment_date').notNull(),
  monthYear: varchar('month_year', { length: 7 }).notNull(), // 2024-01
  notes: text('notes'),
  recordedBy: uuid('recorded_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// OFFERINGS TABLE - Church offerings
// ============================================================================

export const offerings = pgTable('offerings', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id, {
    onDelete: 'set null',
  }), // NULL for anonymous
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  offeringType: varchar('offering_type', { length: 50 }).notNull(), // Sunday Service, Thanksgiving, etc.
  serviceDate: date('service_date').notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  paymentMethod: paymentMethodEnum('payment_method'),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  notes: text('notes'),
  recordedBy: uuid('recorded_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// EXPENSES TABLE - Church expenses
// ============================================================================

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 100 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  expenseDate: date('expense_date').notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  receiptUrl: text('receipt_url'),
  approvedBy: uuid('approved_by').references(() => users.id),
  recordedBy: uuid('recorded_by').references(() => users.id),
  status: expenseStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// SHEPHERDS TABLE - Shepherd designations
// ============================================================================

export const shepherds = pgTable('shepherds', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  departmentId: uuid('department_id').references(() => departments.id),
  isActive: boolean('is_active').notNull().default(true),
  assignedDate: date('assigned_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// SHEPHERD_ASSIGNMENTS TABLE - Shepherd to member assignments
// ============================================================================

export const shepherdAssignments = pgTable(
  'shepherd_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shepherdId: uuid('shepherd_id')
      .notNull()
      .references(() => shepherds.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    assignedDate: date('assigned_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.shepherdId, table.memberId)]
)

// ============================================================================
// FOLLOW_UPS TABLE - Member follow-up records
// ============================================================================

export const followUps = pgTable('follow_ups', {
  id: uuid('id').primaryKey().defaultRandom(),
  shepherdId: uuid('shepherd_id').references(() => shepherds.id, {
    onDelete: 'set null',
  }),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  followUpType: followUpTypeEnum('follow_up_type'),
  scheduledDate: date('scheduled_date'),
  completedDate: date('completed_date'),
  status: followUpStatusEnum('status').notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// SMS_MESSAGES TABLE - Bulk SMS messages
// ============================================================================

export const smsMessages = pgTable('sms_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageText: text('message_text').notNull(),
  recipientType: varchar('recipient_type', { length: 50 }), // Individual, Department, All Members
  departmentId: uuid('department_id').references(() => departments.id),
  scheduledTime: timestamp('scheduled_time'),
  sentTime: timestamp('sent_time'),
  status: smsStatusEnum('status').notNull().default('pending'),
  totalRecipients: integer('total_recipients'),
  successfulSends: integer('successful_sends').default(0),
  failedSends: integer('failed_sends').default(0),
  creditsUsed: integer('credits_used'),
  sentBy: uuid('sent_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// SMS_RECIPIENTS TABLE - Individual SMS recipients
// ============================================================================

export const smsRecipients = pgTable('sms_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => smsMessages.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id, {
    onDelete: 'cascade',
  }),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  status: smsStatusEnum('status').notNull().default('pending'),
  deliveryStatus: varchar('delivery_status', { length: 50 }),
  sentAt: timestamp('sent_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// AUDIT_LOGS TABLE - System audit trail
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  tableName: varchar('table_name', { length: 100 }),
  recordId: uuid('record_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// SMS_CREDITS TABLE - SMS credit balance tracking
// ============================================================================

export const smsCredits = pgTable('sms_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  balance: integer('balance').notNull().default(0),
  totalPurchased: integer('total_purchased').notNull().default(0),
  totalUsed: integer('total_used').notNull().default(0),
  lastTopupAmount: integer('last_topup_amount'),
  lastTopupDate: timestamp('last_topup_date'),
  lowBalanceThreshold: integer('low_balance_threshold').default(1000),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// SMS_TEMPLATES TABLE - Reusable message templates
// ============================================================================

export const smsTemplates = pgTable('sms_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // reminder, birthday, event, general
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// EVENTS TABLE - Church events
// ============================================================================

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 50 }), // Conference, Retreat, Outreach, etc.
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  startTime: varchar('start_time', { length: 10 }),
  endTime: varchar('end_time', { length: 10 }),
  location: varchar('location', { length: 255 }),
  departmentId: uuid('department_id').references(() => departments.id),
  registrationRequired: boolean('registration_required').notNull().default(false),
  maxAttendees: integer('max_attendees'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  member: one(members, {
    fields: [users.id],
    references: [members.userId],
  }),
}))

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  departments: many(memberDepartments),
  tithes: many(tithes),
  attendance: many(attendance),
  shepherdAssignments: many(shepherdAssignments),
  followUps: many(followUps),
}))

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  leader: one(members, {
    fields: [departments.leaderId],
    references: [members.id],
  }),
  members: many(memberDepartments),
  services: many(services),
}))

export const memberDepartmentsRelations = relations(
  memberDepartments,
  ({ one }) => ({
    member: one(members, {
      fields: [memberDepartments.memberId],
      references: [members.id],
    }),
    department: one(departments, {
      fields: [memberDepartments.departmentId],
      references: [departments.id],
    }),
  })
)

export const servicesRelations = relations(services, ({ one, many }) => ({
  department: one(departments, {
    fields: [services.departmentId],
    references: [departments.id],
  }),
  attendance: many(attendance),
}))

export const attendanceRelations = relations(attendance, ({ one }) => ({
  member: one(members, {
    fields: [attendance.memberId],
    references: [members.id],
  }),
  service: one(services, {
    fields: [attendance.serviceId],
    references: [services.id],
  }),
  recordedByUser: one(users, {
    fields: [attendance.recordedBy],
    references: [users.id],
  }),
}))

export const tithesRelations = relations(tithes, ({ one }) => ({
  member: one(members, {
    fields: [tithes.memberId],
    references: [members.id],
  }),
  recordedByUser: one(users, {
    fields: [tithes.recordedBy],
    references: [users.id],
  }),
}))

export const shepherdsRelations = relations(shepherds, ({ one, many }) => ({
  member: one(members, {
    fields: [shepherds.memberId],
    references: [members.id],
  }),
  department: one(departments, {
    fields: [shepherds.departmentId],
    references: [departments.id],
  }),
  assignments: many(shepherdAssignments),
}))

export const shepherdAssignmentsRelations = relations(
  shepherdAssignments,
  ({ one }) => ({
    shepherd: one(shepherds, {
      fields: [shepherdAssignments.shepherdId],
      references: [shepherds.id],
    }),
    member: one(members, {
      fields: [shepherdAssignments.memberId],
      references: [members.id],
    }),
  })
)

export const followUpsRelations = relations(followUps, ({ one }) => ({
  shepherd: one(shepherds, {
    fields: [followUps.shepherdId],
    references: [shepherds.id],
  }),
  member: one(members, {
    fields: [followUps.memberId],
    references: [members.id],
  }),
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert

export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert

export type Attendance = typeof attendance.$inferSelect
export type NewAttendance = typeof attendance.$inferInsert

export type Tithe = typeof tithes.$inferSelect
export type NewTithe = typeof tithes.$inferInsert

export type Offering = typeof offerings.$inferSelect
export type NewOffering = typeof offerings.$inferInsert

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert

export type Shepherd = typeof shepherds.$inferSelect
export type NewShepherd = typeof shepherds.$inferInsert

export type FollowUp = typeof followUps.$inferSelect
export type NewFollowUp = typeof followUps.$inferInsert

export type SmsMessage = typeof smsMessages.$inferSelect
export type NewSmsMessage = typeof smsMessages.$inferInsert

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert

// Role type export
export type UserRole = (typeof userRoleEnum.enumValues)[number]
