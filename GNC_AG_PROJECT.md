# GNC-AG Church Management System
## Complete Project Plan & Implementation Guide

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Requirements Analysis](#system-requirements-analysis)
4. [Technical Architecture](#technical-architecture)
5. [Database Schema Design](#database-schema-design)
6. [Module Specifications](#module-specifications)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Development Timeline](#development-timeline)
9. [Technology Stack Recommendation](#technology-stack-recommendation)
10. [Implementation Phases](#implementation-phases)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)
13. [Maintenance & Support](#maintenance--support)
14. [Budget Estimation](#budget-estimation)

---

## 1. Executive Summary

### Project Name
**Good News Centre Assemblies of God (GNC-AG) Church Management System**

### Purpose
A comprehensive web-based platform to digitize and streamline church operations, membership management, financial tracking, and communication for GNC-AG Church in Ejisu, Ghana.

### Key Objectives
- Centralize member data and track growth metrics
- Automate financial management (tithes, offerings, donations)
- Monitor attendance across all services and departments
- Facilitate shepherd-member relationships and follow-ups
- Enable automated SMS communication for reminders
- Generate comprehensive reports and analytics

---

## 2. Project Overview

### 2.1 Current State Analysis
Based on the existing Google Sheets database:
- **Data Structure**: Caller-member relationship tracking
- **Contact Information**: Names, phone numbers, locations
- **Status Tracking**: Basic remarks (Off, Not Available, Travelled, etc.)
- **Limitations**: No automated workflows, limited analytics, manual processes

### 2.2 Desired State
- Fully integrated web-based church management system
- Real-time data synchronization
- Automated SMS notifications
- Role-based access control
- Mobile-responsive design
- Advanced reporting and analytics
- Integration capabilities (SMS gateway, payment systems)

### 2.3 Success Criteria
- 100% member data migration from Google Sheets
- System adoption by all departments (7 ministries)
- 80% reduction in manual administrative tasks
- Real-time attendance and financial tracking
- 95% SMS delivery success rate
- User satisfaction rating above 4/5

---

## 3. System Requirements Analysis

### 3.1 Functional Requirements

#### 3.1.1 Membership Management
- **Member Registration**
  - Personal information (name, DOB, gender, marital status)
  - Contact details (phone, email, address)
  - Photo upload capability
  - Family relationships linking
  - Ministry/department affiliations
  - Member status (Active, Inactive, Visitor, New Convert)
  
- **Member Profiles**
  - Complete member history
  - Attendance records
  - Contribution history
  - Shepherd assignment
  - Follow-up notes
  - Document attachments

- **Member Search & Filtering**
  - Advanced search by multiple criteria
  - Export functionality (Excel, PDF)
  - Bulk operations support

#### 3.1.2 Financial Management

- **Tithe Tracking**
  - Record tithe payments (cash, mobile money, bank transfer)
  - Individual member tithe history
  - Monthly/yearly tithe summaries
  - Tithe analytics and trends

- **Offering Management**
  - Sunday service offerings
  - Special service offerings
  - Thanksgiving offerings
  - Department-specific offerings
  - Anonymous vs. named offerings

- **General Finance**
  - Income tracking (all sources)
  - Expense management
  - Budget planning and monitoring
  - Financial reports (P&L, balance sheet)
  - Audit trails
  - Receipt generation (PDF/print)

#### 3.1.3 Attendance Tracking

- **Service Attendance**
  - Sunday services (multiple services if applicable)
  - Midweek services
  - Special events
  - Department meetings

- **Recording Methods**
  - Manual check-in
  - QR code scanning
  - Member ID card scanning
  - Mobile app check-in

- **Attendance Analytics**
  - Individual attendance history
  - Department attendance rates
  - Trend analysis
  - Absence tracking and alerts

#### 3.1.4 Shepherd Management

- **Shepherd Assignment**
  - Assign members to shepherds
  - Department-level assignments
  - Church-wide assignments
  - Load balancing (members per shepherd)

- **Follow-up Tracking**
  - Schedule follow-up visits/calls
  - Record follow-up notes
  - Track completion status
  - Set reminders for upcoming follow-ups
  - Generate follow-up reports

- **Shepherd Dashboard**
  - List of assigned members
  - Pending follow-ups
  - Member attendance status
  - Quick communication tools

#### 3.1.5 Communication Module

- **SMS Notifications**
  - Weekly service reminders
  - Event announcements
  - Birthday/anniversary wishes
  - Custom messages
  - Department-specific broadcasts
  - Church-wide broadcasts
  - Scheduled messages

- **Message Management**
  - SMS templates
  - Message history
  - Delivery status tracking
  - Failed delivery alerts
  - Contact group management

- **SMS Credits Management**
  - Credit balance tracking
  - Usage reports
  - Top-up notifications

#### 3.1.6 Department Management

- **Department Structure**
  - Men's Ministry
  - Women's Ministry
  - Youth Ministry
  - Children's Ministry
  - Pathfinders (Young Men)
  - Y/S (Young Single Ladies)
  - JOY (Young Women/Married Ladies)

- **Department Features**
  - Department-specific dashboards
  - Member lists
  - Department leaders
  - Events and activities
  - Department finances
  - Department attendance

#### 3.1.7 Reporting & Analytics

- **Membership Reports**
  - Total members by status
  - Growth trends
  - Age demographics
  - Gender distribution
  - New converts tracking
  - Department distribution

- **Financial Reports**
  - Income vs. expenses
  - Tithe analysis
  - Offering trends
  - Top contributors
  - Budget variance reports

- **Attendance Reports**
  - Average attendance
  - Attendance by service type
  - Member attendance rate
  - Department attendance comparison

- **Custom Reports**
  - Report builder tool
  - Scheduled report generation
  - Export to PDF/Excel
  - Email distribution

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
- Page load time: < 2 seconds
- Support for 1000+ concurrent users
- Database queries: < 500ms response time
- SMS delivery: < 30 seconds

#### 3.2.2 Security
- HTTPS encryption for all communications
- Password hashing (bcrypt/Argon2)
- Role-based access control (RBAC)
- Session management with timeouts
- Data backup (daily automated)
- Audit logging for sensitive operations
- GDPR/data protection compliance

#### 3.2.3 Usability
- Intuitive user interface
- Mobile-responsive design
- Support for low-bandwidth environments
- Offline capability for critical functions
- Multi-language support (English, Twi)
- Accessibility compliance (WCAG 2.1)

#### 3.2.4 Scalability
- Horizontal scaling capability
- Database optimization for growth
- CDN for static assets
- Caching strategy (Redis/Memcached)

#### 3.2.5 Reliability
- 99.5% uptime SLA
- Automated error monitoring
- Graceful error handling
- Data redundancy
- Disaster recovery plan

---

## 4. Technical Architecture

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Web Application (React/Next.js)                            │
│  - Admin Dashboard                                           │
│  - Member Portal                                             │
│  - Mobile Responsive UI                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  API Server (Node.js/Express or tRPC)                       │
│  - RESTful/GraphQL/tRPC API Endpoints                       │
│  - Business Logic                                            │
│  - Authentication & Authorization                            │
│  - Input Validation                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Microservices/Services:                                     │
│  - Member Service                                            │
│  - Finance Service                                           │
│  - Attendance Service                                        │
│  - Communication Service (SMS Gateway)                       │
│  - Notification Service                                      │
│  - Reporting Service                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Database:                                                   │
│  - PostgreSQL (Primary Database)                             │
│  - Redis (Caching & Session Storage)                         │
│  - File Storage (AWS S3/Cloudinary for images)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                      │
├─────────────────────────────────────────────────────────────┤
│  - SMS Gateway (Hubtel, Arkesel, or Twilio)                 │
│  - Payment Gateway (MTN MoMo, Vodafone Cash, Bank)          │
│  - Email Service (SendGrid, AWS SES)                        │
│  - Cloud Storage (AWS S3, Cloudinary)                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Load Balancer                       │
│              (Nginx/CloudFlare/AWS ALB)              │
└──────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Web Server  │ │ Web Server  │ │ Web Server  │
│  Instance 1 │ │  Instance 2 │ │  Instance N │
└─────────────┘ └─────────────┘ └─────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                ┌──────────────┐
                │   Database   │
                │  PostgreSQL  │
                │ (Primary +   │
                │  Replica)    │
                └──────────────┘
```

---

## 5. Database Schema Design

### 5.1 Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, pastor, leader, member, shepherd
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Members Table
```sql
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    member_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated: GNC-001, GNC-002
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10), -- Male, Female
    marital_status VARCHAR(20), -- Single, Married, Divorced, Widowed
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    occupation VARCHAR(100),
    photo_url TEXT,
    member_status VARCHAR(20) DEFAULT 'Active', -- Active, Inactive, Visitor, New Convert
    join_date DATE NOT NULL,
    baptism_date DATE,
    is_baptized BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Departments Table
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- Men's Ministry, Women's Ministry, etc.
    description TEXT,
    leader_id UUID REFERENCES members(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Member_Departments Table (Many-to-Many)
```sql
CREATE TABLE member_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    join_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, department_id)
);
```

#### Tithes Table
```sql
CREATE TABLE tithes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- Cash, Mobile Money, Bank Transfer
    payment_reference VARCHAR(100),
    payment_date DATE NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- Format: 2024-01
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Offerings Table
```sql
CREATE TABLE offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL, -- NULL for anonymous
    amount DECIMAL(12, 2) NOT NULL,
    offering_type VARCHAR(50) NOT NULL, -- Sunday Service, Thanksgiving, Special, etc.
    service_date DATE NOT NULL,
    department_id UUID REFERENCES departments(id), -- NULL for church-wide
    payment_method VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT FALSE,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Expenses Table
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- Utilities, Salaries, Maintenance, etc.
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    department_id UUID REFERENCES departments(id),
    receipt_url TEXT,
    approved_by UUID REFERENCES users(id),
    recorded_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Services Table
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- Sunday Service, Midweek Service, etc.
    service_type VARCHAR(50) NOT NULL, -- Regular, Special, Event
    service_date DATE NOT NULL,
    service_time TIME,
    department_id UUID REFERENCES departments(id), -- NULL for church-wide
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Attendance Table
```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_method VARCHAR(50), -- Manual, QR Code, ID Card, Mobile App
    recorded_by UUID REFERENCES users(id),
    UNIQUE(member_id, service_id)
);
```

#### Shepherds Table
```sql
CREATE TABLE shepherds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT TRUE,
    assigned_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Shepherd_Assignments Table
```sql
CREATE TABLE shepherd_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shepherd_id UUID REFERENCES shepherds(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shepherd_id, member_id)
);
```

#### Follow_Ups Table
```sql
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shepherd_id UUID REFERENCES shepherds(id) ON DELETE SET NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    follow_up_type VARCHAR(50), -- Phone Call, Visit, Prayer, Counseling
    scheduled_date DATE,
    completed_date DATE,
    status VARCHAR(20) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### SMS_Messages Table
```sql
CREATE TABLE sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_text TEXT NOT NULL,
    recipient_type VARCHAR(50), -- Individual, Department, All Members
    department_id UUID REFERENCES departments(id),
    scheduled_time TIMESTAMP,
    sent_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Sent, Failed
    total_recipients INTEGER,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    credits_used INTEGER,
    sent_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### SMS_Recipients Table
```sql
CREATE TABLE sms_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES sms_messages(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Sent, Failed
    delivery_status VARCHAR(50), -- Delivered, Undelivered, Unknown
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- Conference, Retreat, Outreach, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    department_id UUID REFERENCES departments(id),
    registration_required BOOLEAN DEFAULT FALSE,
    max_attendees INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Audit_Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Database Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_members_status ON members(member_status);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_members_phone ON members(phone_primary);
CREATE INDEX idx_tithes_member_date ON tithes(member_id, payment_date);
CREATE INDEX idx_tithes_month_year ON tithes(month_year);
CREATE INDEX idx_offerings_service_date ON offerings(service_date);
CREATE INDEX idx_attendance_service ON attendance(service_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_sms_messages_scheduled ON sms_messages(scheduled_time);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_follow_ups_scheduled ON follow_ups(scheduled_date);
```

---

## 6. Module Specifications

### 6.1 Membership Management Module

#### Features:
1. **Member Registration**
   - Multi-step registration form
   - Photo upload with crop functionality
   - Email/SMS verification
   - Duplicate detection

2. **Member Dashboard**
   - Personal information overview
   - Recent activities
   - Upcoming events
   - Contribution summary

3. **Member Directory**
   - Searchable member list
   - Filtering by department, status, etc.
   - Export to Excel/PDF
   - Birthday/anniversary calendar

4. **Member Analytics**
   - Growth charts
   - Demographic breakdowns
   - Retention metrics
   - New converts tracking

#### User Stories:
- As an admin, I want to add new members with complete information
- As a member, I want to update my profile information
- As a pastor, I want to view all members in a specific department
- As an admin, I want to generate a birthday list for the current month

### 6.2 Financial Management Module

#### Features:
1. **Income Recording**
   - Tithe entry (individual/bulk)
   - Offering entry (by service/department)
   - Other income sources
   - Receipt generation

2. **Expense Tracking**
   - Expense entry with categories
   - Receipt upload
   - Approval workflow
   - Budget comparison

3. **Financial Reports**
   - Income statement
   - Cash flow report
   - Tithe analysis
   - Top contributors report
   - Budget vs. actual

4. **Payment Integration**
   - Mobile Money API integration
   - Bank transfer reconciliation
   - Payment confirmation

#### User Stories:
- As a treasurer, I want to record tithe payments for multiple members quickly
- As a financial secretary, I want to generate monthly financial reports
- As a pastor, I want to see the total offerings for each Sunday service
- As an admin, I want to track which members are consistent with their tithes

### 6.3 Attendance Tracking Module

#### Features:
1. **Service Management**
   - Create/schedule services
   - Define service types
   - Department-specific services

2. **Attendance Recording**
   - Manual check-in
   - QR code generation/scanning
   - Bulk attendance entry
   - Visitor tracking

3. **Attendance Reports**
   - Service attendance summary
   - Individual attendance history
   - Absence alerts
   - Attendance trends

4. **Integration**
   - Mobile app for self-check-in
   - SMS confirmation for attendance

#### User Stories:
- As an usher, I want to quickly mark attendance for a service
- As a department leader, I want to see who attended our last meeting
- As a shepherd, I want to be notified when my members miss services
- As an admin, I want to track overall church attendance trends

### 6.4 Shepherd Management Module

#### Features:
1. **Shepherd Administration**
   - Assign/remove shepherds
   - Define shepherd capacity
   - Department-level shepherds
   - Church-wide shepherds

2. **Member Assignment**
   - Assign members to shepherds
   - Auto-assignment based on criteria
   - Load balancing
   - Assignment history

3. **Follow-up Management**
   - Schedule follow-ups
   - Follow-up templates
   - Completion tracking
   - Reminder notifications

4. **Shepherd Dashboard**
   - My members list
   - Pending follow-ups
   - Member attendance status
   - Quick contact options

#### User Stories:
- As an admin, I want to assign new members to available shepherds
- As a shepherd, I want to schedule a follow-up call with a member
- As a shepherd, I want to see which of my members missed the last service
- As a pastor, I want to see follow-up completion rates by shepherd

### 6.5 Communication Module

#### Features:
1. **SMS Campaigns**
   - Compose messages
   - Select recipients (individual, department, all)
   - Schedule messages
   - Message templates

2. **Automated Reminders**
   - Service reminders (configurable timing)
   - Event reminders
   - Birthday/anniversary wishes
   - Follow-up reminders

3. **Message Management**
   - Message history
   - Delivery reports
   - Failed delivery handling
   - Resend capability

4. **SMS Credits**
   - Credit balance tracking
   - Purchase integration
   - Usage analytics
   - Low balance alerts

#### User Stories:
- As an admin, I want to send a service reminder to all active members
- As a department leader, I want to notify my department about an upcoming meeting
- As a system, I want to automatically send birthday wishes to members
- As an admin, I want to see delivery reports for sent messages

### 6.6 Reporting & Analytics Module

#### Features:
1. **Pre-built Reports**
   - Membership reports
   - Financial reports
   - Attendance reports
   - Shepherd reports

2. **Custom Report Builder**
   - Drag-and-drop interface
   - Multiple data sources
   - Custom filters
   - Calculated fields

3. **Dashboard**
   - Executive dashboard (pastor/admin)
   - Department dashboards
   - Shepherd dashboards
   - Member dashboards

4. **Export & Scheduling**
   - Export to PDF/Excel
   - Schedule automated reports
   - Email distribution
   - Report sharing

#### User Stories:
- As a pastor, I want to see a dashboard with key church metrics
- As a treasurer, I want to generate a year-end financial report
- As an admin, I want to schedule monthly membership reports to be emailed
- As a department leader, I want to see my department's growth trend

---

## 7. User Roles & Permissions

### 7.1 Role Definitions

#### Super Admin
- Full system access
- User management
- System configuration
- All module access

**Permissions:**
- Create/Edit/Delete: All entities
- View: All data
- Configure: System settings, integrations
- Manage: Users, roles, permissions

#### Pastor/Church Leader
- Strategic oversight access
- View-only financial data
- Full reporting access
- Communication access

**Permissions:**
- View: All members, finances, attendance
- Create/Edit: Events, services
- Send: SMS to all members
- Access: All reports

#### Admin/Office Manager
- Day-to-day operations
- Member management
- Financial recording
- Attendance tracking

**Permissions:**
- Create/Edit/Delete: Members, services, attendance
- Create/Edit: Tithes, offerings
- View/Edit: Expenses (with approval workflow)
- Send: SMS to all members
- Access: Most reports

#### Department Leader
- Department-specific access
- Member management within department
- Department finances
- Department events

**Permissions:**
- View: Department members
- Create/Edit: Department events, services
- View: Department finances
- Send: SMS to department members
- Access: Department reports

#### Shepherd
- Assigned member access
- Follow-up management
- Limited reporting

**Permissions:**
- View: Assigned members' details
- Create/Edit: Follow-up records
- Send: SMS to assigned members
- Access: Shepherd dashboard and reports

#### Member
- Personal data access
- Self-service portal
- Contribution viewing

**Permissions:**
- View/Edit: Own profile
- View: Own contribution history, attendance
- Register: For events
- Access: Member portal

#### Treasurer/Finance Secretary
- Full financial access
- Expense management
- Financial reporting

**Permissions:**
- Create/Edit/Delete: Tithes, offerings, expenses
- Approve: Expense requests
- View: All financial data
- Access: Financial reports
- Export: Financial data

### 7.2 Permission Matrix

| Feature                  | Super Admin | Pastor | Admin | Dept Leader | Shepherd | Member | Treasurer |
|--------------------------|-------------|--------|-------|-------------|----------|--------|-----------|
| Manage Users             | ✓           | ✗      | ✗     | ✗           | ✗        | ✗      | ✗         |
| Add/Edit Members         | ✓           | ✗      | ✓     | ✓ (dept)    | ✗        | ✗      | ✗         |
| View All Members         | ✓           | ✓      | ✓     | ✓ (dept)    | ✓ (assigned) | ✗  | ✗         |
| Record Tithes            | ✓           | ✗      | ✓     | ✗           | ✗        | ✗      | ✓         |
| Record Offerings         | ✓           | ✗      | ✓     | ✗           | ✗        | ✗      | ✓         |
| Record Expenses          | ✓           | ✗      | ✓     | ✗           | ✗        | ✗      | ✓         |
| Approve Expenses         | ✓           | ✓      | ✗     | ✗           | ✗        | ✗      | ✓         |
| View Finances            | ✓           | ✓      | ✓     | ✓ (dept)    | ✗        | ✓ (own)| ✓         |
| Mark Attendance          | ✓           | ✓      | ✓     | ✓ (dept)    | ✗        | ✗      | ✗         |
| View Attendance          | ✓           | ✓      | ✓     | ✓ (dept)    | ✓ (assigned) | ✓ (own) | ✗    |
| Assign Shepherds         | ✓           | ✓      | ✓     | ✗           | ✗        | ✗      | ✗         |
| Manage Follow-ups        | ✓           | ✓      | ✓     | ✗           | ✓        | ✗      | ✗         |
| Send SMS (All)           | ✓           | ✓      | ✓     | ✗           | ✗        | ✗      | ✗         |
| Send SMS (Department)    | ✓           | ✓      | ✓     | ✓           | ✗        | ✗      | ✗         |
| Send SMS (Assigned)      | ✓           | ✓      | ✓     | ✓           | ✓        | ✗      | ✗         |
| Generate Reports         | ✓           | ✓      | ✓     | ✓ (dept)    | ✓ (limited) | ✗   | ✓ (financial) |
| Configure System         | ✓           | ✗      | ✗     | ✗           | ✗        | ✗      | ✗         |

---

## 8. Development Timeline

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Project Setup & Design**
- Finalize requirements
- Database schema design
- UI/UX wireframes
- Technology stack setup
- Development environment configuration
- Version control setup (Git/GitHub)

**Week 3-4: Core Infrastructure**
- Database setup and migrations
- Authentication system
- Authorization/RBAC implementation
- API structure setup
- Basic admin dashboard layout

### Phase 2: Core Modules (Weeks 5-10)

**Week 5-6: Membership Module**
- Member CRUD operations
- Member profile pages
- Search and filtering
- Export functionality
- Photo upload integration

**Week 7-8: Financial Module**
- Tithe recording
- Offering recording
- Basic financial reports
- Receipt generation
- Expense tracking

**Week 9-10: Attendance Module**
- Service management
- Attendance recording (manual)
- Attendance reports
- Member attendance history

### Phase 3: Advanced Features (Weeks 11-14)

**Week 11-12: Shepherd Module**
- Shepherd management
- Member assignment
- Follow-up tracking
- Shepherd dashboard

**Week 13-14: Communication Module**
- SMS integration
- Message composer
- Recipient selection
- SMS templates
- Delivery tracking

### Phase 4: Reporting & Analytics (Weeks 15-16)

**Week 15: Reporting Infrastructure**
- Report engine setup
- Pre-built reports
- Dashboard design
- Export functionality

**Week 16: Analytics & Visualization**
- Charts and graphs
- Trend analysis
- Custom report builder

### Phase 5: Testing & Refinement (Weeks 17-18)

**Week 17: Testing**
- Unit testing
- Integration testing
- User acceptance testing (UAT)
- Performance testing
- Security testing

**Week 18: Bug Fixes & Optimization**
- Address test findings
- Performance optimization
- UI/UX refinements
- Documentation completion

### Phase 6: Deployment & Training (Weeks 19-20)

**Week 19: Deployment**
- Production environment setup
- Data migration from Google Sheets
- SSL certificate setup
- Domain configuration
- Monitoring setup

**Week 20: Training & Handover**
- Admin training sessions
- User documentation
- Video tutorials
- Go-live support
- Post-launch monitoring

---

## 9. Technology Stack Recommendation

### Next.js vs TanStack Start

After careful analysis, here's my recommendation:

#### **Recommended: Next.js 14+ (App Router)**

**Reasons:**

1. **Maturity & Ecosystem**
   - Battle-tested in production
   - Massive community and resources
   - Extensive third-party libraries
   - Well-documented edge cases

2. **Full-Stack Capabilities**
   - Server Components for better performance
   - API routes for backend logic
   - Server Actions for mutations
   - Middleware for auth/security

3. **Performance**
   - Automatic code splitting
   - Image optimization out of the box
   - Built-in caching strategies
   - Edge runtime support

4. **Developer Experience**
   - TypeScript support
   - File-based routing
   - Hot module replacement
   - Extensive tooling

5. **Production Ready**
   - Vercel hosting optimization (optional)
   - Easy deployment options
   - Great monitoring/analytics integration
   - SEO friendly

6. **Local Ghana Context**
   - More local developers familiar with Next.js
   - Easier to find support/maintenance
   - Better long-term sustainability

#### TanStack Start Considerations

**Pros:**
- Modern, innovative architecture
- Excellent type safety
- Great DX for certain use cases

**Cons:**
- Relatively new (less battle-tested)
- Smaller ecosystem
- Limited production case studies
- Harder to find local developers
- Documentation still maturing

### Recommended Full Stack

```javascript
// Frontend
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- State Management: Zustand or React Context
- Forms: React Hook Form + Zod validation
- UI Components: shadcn/ui + Tailwind CSS
- Charts: Recharts or Chart.js
- Date Handling: date-fns
- HTTP Client: Native fetch / Axios

// Backend
- Runtime: Node.js 20+
- API: Next.js API Routes or tRPC (for type safety)
- ORM: Prisma (excellent TypeScript support)
- Validation: Zod
- Authentication: NextAuth.js or Lucia
- File Upload: UploadThing or Cloudinary

// Database
- Primary: PostgreSQL 15+ (Supabase or Railway)
- Caching: Redis (Upstash)
- File Storage: AWS S3 or Cloudinary

// External Services
- SMS: Hubtel API (Ghana-focused) or Arkesel
- Email: Resend or SendGrid
- Payment: MTN MoMo API, Vodafone Cash

// DevOps
- Hosting: Vercel, Railway, or AWS
- CI/CD: GitHub Actions
- Monitoring: Sentry (errors), Vercel Analytics
- Database Hosting: Supabase, Railway, or AWS RDS

// Development Tools
- Version Control: Git + GitHub
- Package Manager: pnpm or npm
- Code Quality: ESLint + Prettier
- Testing: Jest + React Testing Library + Playwright
```

### Alternative Stack (Lower Cost)

```javascript
// For budget-conscious deployment
- Hosting: Railway or Render (free tier initially)
- Database: Supabase (generous free tier)
- Storage: Cloudinary (free tier)
- SMS: Hubtel (pay-as-you-go)
- Email: Resend (free tier)
```

---

## 10. Implementation Phases

### Phase 1: MVP (Minimum Viable Product) - 8 Weeks

**Goals:**
- Launch basic functional system
- Enable core workflows
- Replace Google Sheets

**Features:**
- ✅ User authentication (admin, member)
- ✅ Member registration and management
- ✅ Basic tithe recording
- ✅ Simple attendance marking
- ✅ Basic reports (members list, tithe summary)

**Success Metrics:**
- All members migrated from Google Sheets
- Admins can perform daily tasks
- Basic reporting available

### Phase 2: Enhanced Features - 6 Weeks

**Goals:**
- Add advanced financial tracking
- Implement shepherd system
- Enable basic communication

**Features:**
- ✅ Full financial module (offerings, expenses)
- ✅ Shepherd assignment and management
- ✅ Follow-up tracking
- ✅ SMS integration (basic)
- ✅ Department management

**Success Metrics:**
- All finances tracked digitally
- Shepherds actively using follow-up system
- Department leaders can manage their ministries

### Phase 3: Automation & Analytics - 4 Weeks

**Goals:**
- Automate routine tasks
- Advanced reporting
- Enhanced user experience

**Features:**
- ✅ Automated SMS reminders
- ✅ Advanced analytics dashboards
- ✅ Custom report builder
- ✅ Mobile responsiveness optimization
- ✅ QR code attendance

**Success Metrics:**
- 80% reduction in manual SMS sending
- Leaders using dashboards weekly
- Mobile usage above 40%

### Phase 4: Optimization & Expansion - 4 Weeks

**Goals:**
- Performance optimization
- Additional integrations
- User feedback incorporation

**Features:**
- ✅ Performance tuning
- ✅ Payment gateway integration
- ✅ Advanced member portal
- ✅ Event registration system
- ✅ Mobile app (optional)

**Success Metrics:**
- Page load < 2 seconds
- 95% user satisfaction
- All requested features implemented

---

## 11. Testing Strategy

### 11.1 Testing Types

#### Unit Testing
- Test individual functions
- Database queries
- Business logic
- Validation rules
- Target: 80% code coverage

#### Integration Testing
- API endpoint testing
- Database operations
- External service integration
- SMS gateway testing
- Payment gateway testing

#### End-to-End Testing
- Complete user workflows
- Critical paths:
  - Member registration → Attendance → SMS
  - Tithe payment → Receipt → Report
  - Shepherd assignment → Follow-up → Completion

#### Performance Testing
- Load testing (100+ concurrent users)
- Stress testing
- Database query optimization
- API response time testing

#### Security Testing
- Penetration testing
- SQL injection testing
- XSS vulnerability testing
- Authentication/authorization testing
- Data encryption verification

#### User Acceptance Testing (UAT)
- Involve actual church leaders
- Test real-world scenarios
- Gather feedback
- Identify usability issues

### 11.2 Testing Tools

```javascript
// Unit & Integration Testing
- Framework: Jest
- Component Testing: React Testing Library
- API Testing: Supertest

// E2E Testing
- Framework: Playwright or Cypress

// Performance Testing
- Tool: Apache JMeter or k6

// Security Testing
- Tool: OWASP ZAP
- Dependency Scanning: Snyk

// Code Quality
- Linting: ESLint
- Formatting: Prettier
- Type Checking: TypeScript
```

### 11.3 Test Data

- Create seed data for development/testing
- Mock member data (100+ records)
- Mock financial transactions
- Mock attendance records
- Test with real phone numbers (limited) for SMS testing

---

## 12. Deployment Plan

### 12.1 Pre-Deployment Checklist

**Infrastructure:**
- [ ] Production server provisioned
- [ ] Database setup and secured
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] CDN setup (if applicable)
- [ ] Backup system configured
- [ ] Monitoring tools installed

**Application:**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Error logging configured
- [ ] Analytics setup

**Data Migration:**
- [ ] Migration scripts tested
- [ ] Data validation rules defined
- [ ] Backup of Google Sheets data
- [ ] Migration dry-run completed

**Documentation:**
- [ ] User manual completed
- [ ] Admin guide completed
- [ ] API documentation
- [ ] Deployment documentation
- [ ] Troubleshooting guide

### 12.2 Deployment Steps

**Week 1: Infrastructure Setup**
1. Provision production servers
2. Configure database
3. Setup SSL certificates
4. Configure DNS
5. Setup monitoring

**Week 2: Application Deployment**
1. Deploy application to production
2. Configure environment variables
3. Setup automated backups
4. Configure error monitoring
5. Run smoke tests

**Week 3: Data Migration**
1. Perform data migration
2. Validate migrated data
3. Run data integrity checks
4. Setup data sync (if needed)
5. Verify all relationships

**Week 4: Training & Go-Live**
1. Conduct admin training
2. Conduct user training
3. Soft launch (limited users)
4. Monitor for issues
5. Full launch
6. Post-launch support

### 12.3 Rollback Plan

- Keep Google Sheets as backup for 3 months
- Database snapshots before migration
- Application version tagging
- Quick rollback procedures documented
- Fallback communication plan

---

## 13. Maintenance & Support

### 13.1 Maintenance Plan

**Daily:**
- Monitor system health
- Check error logs
- Verify SMS delivery
- Review backup status

**Weekly:**
- Performance review
- Security scan
- Database optimization
- User feedback review

**Monthly:**
- Feature updates
- Security patches
- Database backups verification
- Usage analytics review

**Quarterly:**
- Full system audit
- Performance optimization
- Feature roadmap review
- User satisfaction survey

### 13.2 Support Structure

**Tier 1: User Support**
- Email support: support@gnc-ag.org
- Phone hotline: [To be assigned]
- Response time: 24 hours
- Handles: Password resets, basic queries

**Tier 2: Technical Support**
- For admins and leaders
- Email: tech@gnc-ag.org
- Response time: 12 hours
- Handles: Technical issues, bugs

**Tier 3: Development Team**
- Critical issues only
- Response time: 4 hours
- Handles: System failures, data issues

### 13.3 SLA (Service Level Agreement)

- **Uptime**: 99.5% (excluding planned maintenance)
- **Planned Maintenance**: Weekly, Sundays 11 PM - 1 AM
- **Response Times**:
  - Critical (system down): 1 hour
  - High (major feature broken): 4 hours
  - Medium (minor issues): 24 hours
  - Low (feature requests): 1 week

---

## 14. Budget Estimation

### 14.1 Development Costs (20 Weeks)

| Item | Cost (USD) | Notes |
|------|------------|-------|
| Lead Developer (Senior) | $8,000 | $400/week × 20 weeks |
| Frontend Developer | $6,000 | $300/week × 20 weeks |
| Backend Developer | $6,000 | $300/week × 20 weeks |
| UI/UX Designer | $2,000 | $200/week × 10 weeks |
| QA Tester | $2,000 | $200/week × 10 weeks |
| Project Manager | $3,000 | $150/week × 20 weeks |
| **Total Development** | **$27,000** | |

### 14.2 Infrastructure Costs (Annual)

| Item | Monthly | Annual | Notes |
|------|---------|--------|-------|
| Hosting (Railway/Vercel) | $50 | $600 | Pro plan |
| Database (Supabase Pro) | $25 | $300 | Includes backups |
| Redis Cache (Upstash) | $10 | $120 | Basic plan |
| SMS Credits (Hubtel) | $100 | $1,200 | ~1000 members |
| Email Service (Resend) | $10 | $120 | Pro plan |
| Domain & SSL | $5 | $60 | .org domain |
| Monitoring (Sentry) | $10 | $120 | Error tracking |
| Backup Storage (AWS S3) | $10 | $120 | Image storage |
| CDN (CloudFlare) | $0 | $0 | Free tier |
| **Total Infrastructure** | **$220/mo** | **$2,640/yr** | |

### 14.3 One-Time Costs

| Item | Cost (USD) | Notes |
|------|------------|-------|
| Logo & Branding | $500 | Church branding |
| Stock Photos/Icons | $200 | Premium assets |
| SMS Gateway Setup | $100 | Hubtel setup fee |
| Payment Gateway Setup | $100 | MoMo integration |
| Security Audit | $1,000 | Third-party audit |
| Training Materials | $500 | Videos, guides |
| **Total One-Time** | **$2,400** | |

### 14.4 Total Project Cost Summary

| Category | Cost (USD) |
|----------|------------|
| Development | $27,000 |
| Infrastructure (Year 1) | $2,640 |
| One-Time Costs | $2,400 |
| **Total Year 1** | **$32,040** |
| **Ongoing (Annual)** | **$2,640** |

### 14.5 Budget-Optimized Alternative

**Lower-Cost Development:**
- Hire junior developers: $15,000
- Use template-based UI: -$2,000
- Extended timeline (30 weeks): Same cost
- **Total Development**: $15,000

**Lower-Cost Infrastructure:**
- Railway free tier initially: $0-20/mo
- Supabase free tier: $0
- Upstash free tier: $0
- **Total Infrastructure**: $100-150/mo

**Minimum Year 1 Budget**: ~$17,000

---

## 15. Risk Management

### 15.1 Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data migration issues | Medium | High | Thorough testing, backup plan |
| SMS delivery failures | Medium | Medium | Multiple provider fallback |
| User adoption resistance | Medium | High | Training, change management |
| Budget overrun | Low | Medium | Agile approach, phased delivery |
| Security breach | Low | Critical | Security audit, best practices |
| Developer turnover | Low | High | Documentation, code reviews |
| Internet connectivity issues | High | Medium | Offline capability for critical features |
| Mobile Money API changes | Medium | Medium | Abstract payment layer |

### 15.2 Contingency Plans

1. **Data Loss**: Daily automated backups, 30-day retention
2. **System Downtime**: 24/7 monitoring, rapid response team
3. **SMS Provider Issues**: Backup provider (Arkesel + Hubtel)
4. **Payment Issues**: Multiple payment gateways
5. **Budget Constraints**: Phased approach, MVP first

---

## 16. Success Metrics & KPIs

### 16.1 Technical Metrics

- **System Uptime**: > 99.5%
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Error Rate**: < 0.1%
- **Database Query Time**: < 100ms

### 16.2 Business Metrics

- **User Adoption**: > 80% of members registered in 3 months
- **Active Users**: > 60% monthly active users
- **Data Accuracy**: > 95% data accuracy
- **SMS Delivery**: > 95% delivery rate
- **Time Savings**: > 80% reduction in admin time

### 16.3 User Satisfaction

- **Overall Satisfaction**: > 4/5 rating
- **Feature Satisfaction**: > 80% satisfied
- **Support Response**: > 85% satisfied with support
- **Training Effectiveness**: > 90% feel adequately trained

---

## 17. Future Enhancements (Post-Launch)

### Phase 5: Mobile App (Optional)
- Native mobile app (React Native)
- Offline capability
- Push notifications
- Mobile giving

### Phase 6: Advanced Features
- Small group management
- Church calendar integration
- Resource library (sermons, notes)
- Prayer request system
- Volunteer management
- Digital giving platform

### Phase 7: Integrations
- Accounting software integration (QuickBooks)
- Email marketing (Mailchimp)
- Video streaming platform
- Social media auto-posting
- Google Calendar sync

---

## 18. Conclusion

This GNC-AG Church Management System represents a comprehensive digital transformation initiative designed to modernize church operations, improve member engagement, and provide data-driven insights for strategic decision-making.

### Key Recommendations:

1. **Adopt Next.js** as the primary framework for its maturity, ecosystem, and local developer availability

2. **Start with MVP** (Phase 1) to validate the approach and gain early user feedback

3. **Prioritize Training** to ensure high adoption rates

4. **Implement in Phases** to manage risk and budget

5. **Plan for Growth** with a scalable architecture

6. **Focus on User Experience** to drive adoption and satisfaction

### Next Steps:

1. Review and approve this project plan
2. Allocate budget and resources
3. Assemble development team
4. Begin Phase 1 development
5. Schedule stakeholder meetings

---

## Appendix A: Glossary

- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **MVP**: Minimum Viable Product
- **RBAC**: Role-Based Access Control
- **SLA**: Service Level Agreement
- **SMS**: Short Message Service
- **UAT**: User Acceptance Testing
- **UUID**: Universally Unique Identifier

## Appendix B: Contact Information

**Project Stakeholders:**
- Church: Good News Centre Assemblies of God (GNC-AG)
- Location: Ejisu, Ghana
- Primary Contact: [To be assigned]
- Email: [To be assigned]

**Development Team:**
- Project Manager: [To be assigned]
- Lead Developer: [To be assigned]
- Email: dev@gnc-ag.org

---

**Document Version**: 1.0
**Last Updated**: February 3, 2026
**Status**: Draft for Approval