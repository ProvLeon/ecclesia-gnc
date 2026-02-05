#!/usr/bin/env node

/**
 * Script to create the first super admin user
 * Run with: npx ts-node scripts/create-super-admin.ts
 * Or with node: node --loader tsx scripts/create-super-admin.ts
 */

import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import readline from 'readline'

const sql = postgres(process.env.DATABASE_URL!)

// Get Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('')
  console.error('Please add these to your .env.local file.')
  console.error('You can find the Service Role Key in Supabase Dashboard → Settings → API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePassword(password: string): boolean {
  // At least 8 characters
  return password.length >= 8
}

interface UserRecord {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

async function createSuperAdmin(): Promise<void> {
  console.log('\n🔐 GNC-AG Church Management System - Super Admin Setup')
  console.log('======================================================\n')

  try {
    // Check if any super admin exists
    const existingSuperAdmins = await sql<UserRecord[]>`
      SELECT * FROM users WHERE role = 'super_admin' LIMIT 1
    `

    if (existingSuperAdmins.length > 0) {
      console.log('⚠️  A super admin user already exists')
      console.log('   Email:', existingSuperAdmins[0].email)
      console.log('   Created:', existingSuperAdmins[0].created_at)
      console.log('')
      const proceed = await prompt('Create another super admin? (y/n): ')
      if (proceed.toLowerCase() !== 'y') {
        console.log('\n❌ Cancelled.')
        process.exit(0)
      }
    }

    // Get super admin details
    console.log('📧 Enter Super Admin Details:\n')
    const email = await prompt('Email address: ')

    if (!email || !validateEmail(email)) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    // Check if email already exists
    const existingUser = await sql<Array<{ id: string }>>`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `

    if (existingUser.length > 0) {
      console.error('❌ Email already exists in the system')
      process.exit(1)
    }

    const password = await prompt('Password (min 8 chars): ')

    if (!password) {
      console.error('❌ Password is required')
      process.exit(1)
    }

    if (!validatePassword(password)) {
      console.error('❌ Password must be at least 8 characters')
      process.exit(1)
    }

    // Confirm password
    const passwordConfirm = await prompt('Confirm password: ')
    if (password !== passwordConfirm) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    console.log('\n⏳ Creating super admin user...\n')

    // Create Supabase auth user
    console.log('  1️⃣  Creating Supabase auth account...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'super_admin',
        name: 'Super Administrator',
      },
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      process.exit(1)
    }

    if (!authData.user) {
      console.error('❌ Failed to create auth user')
      process.exit(1)
    }

    const userId = authData.user.id
    console.log('     ✓ Auth account created (ID: ' + userId.substring(0, 8) + '...)')

    // Create user record in our database
    console.log('  2️⃣  Syncing to database...')
    const result = await sql<UserRecord[]>`
      INSERT INTO users (id, email, role, is_active, created_at, updated_at)
      VALUES (${userId}, ${email}, 'super_admin', true, NOW(), NOW())
      RETURNING id, email, role, created_at, updated_at
    `

    if (!result.length) {
      console.error('❌ Failed to create database record')
      process.exit(1)
    }

    console.log('     ✓ Database record created')

    console.log('\n✅ Super Admin Created Successfully!')
    console.log('======================================================')
    console.log('Email:       ' + email)
    console.log('Role:        Super Admin')
    console.log('Auth ID:     ' + userId)
    console.log('Database ID: ' + result[0].id)
    console.log('Created:     ' + new Date(result[0].created_at).toLocaleString())
    console.log('\n📝 Next Steps:')
    console.log('  1. Log in at /login')
    console.log('  2. Use email: ' + email)
    console.log('  3. Use password: (the one you just entered)')
    console.log('  4. Create additional admin/pastor users from the dashboard')
    console.log('  5. Assign shepherds to members')
    console.log('\n📚 Documentation:')
    console.log('  - See docs/README_AUTH_ROLES.md for overview')
    console.log('  - See docs/ROLES_AND_PERMISSIONS.md for role details')
    console.log('  - See docs/SHEPHERD_PROMOTION_WORKFLOW.md for shepherd setup')
    console.log('')
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && 'detail' in error) {
      console.error('   Details:', error.detail)
    }
    process.exit(1)
  } finally {
    rl.close()
    await sql.end()
  }
}

// Run the script
createSuperAdmin()
