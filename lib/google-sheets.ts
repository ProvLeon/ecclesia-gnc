import { google } from 'googleapis'

const SPREADSHEET_ID = '1rNjrRqI5TTSaeEw-uYUbquhuOCiDR_95AjVoLIblT8I'

// Known sheet names from the Church Database
export const SHEET_NAMES = {
    MEMBERSHIP: 'Membership',
    NEW_MEMBERS: 'New Members (2024)',
    TITHES: 'Tithes',
    ATTENDANCE: 'Attendance',
    OFFERING: 'Offering',
    BIRTHDAYS: 'Dobs',
    MEMBERS_RAW: 'members',
    EVANG_CONVERTS: 'Evang Converts',
    ALLOCATION: 'Allocation',
    CALLERS: 'callers',
} as const

function getAuth() {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
}

export async function getSheets() {
    const auth = getAuth()
    return google.sheets({ version: 'v4', auth })
}

export async function getSheetData(sheetName: string, range: string = 'A:Z') {
    const sheets = await getSheets()

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetName}'!${range}`,
    })

    return response.data.values || []
}

export async function getAllSheetNames() {
    const sheets = await getSheets()

    const response = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
    })

    return response.data.sheets?.map(sheet => ({
        title: sheet.properties?.title || '',
        sheetId: sheet.properties?.sheetId,
        rowCount: sheet.properties?.gridProperties?.rowCount,
    })) || []
}

// Parse Membership sheet row
export interface MembershipRow {
    name: string
    sex: string
    dateOfBirth: string
    telephone: string
    residence: string
    maritalStatus: string
    spouseContact: string
    tithePayer: boolean
    department: string
    position: string
    wing: string
    baptismStatus: string
    employmentStatus: string
    occupation: string
}

export function parseMembershipRow(headers: string[], row: string[]): MembershipRow {
    const data: Record<string, string> = {}
    headers.forEach((header, index) => {
        data[header.toLowerCase().trim()] = row[index] || ''
    })

    return {
        name: data['name'] || '',
        sex: data['sex'] || '',
        dateOfBirth: data['date of birth'] || data['dob'] || '',
        telephone: data['telephone number'] || data['telephone'] || data['contact'] || '',
        residence: data['residence'] || data['where do you stay?'] || data['location'] || '',
        maritalStatus: data['marital status'] || '',
        spouseContact: data['spouse contact'] || '',
        tithePayer: (data['tithe payer'] || '').toLowerCase() === 'yes',
        department: data['department'] || '',
        position: data['position'] || '',
        wing: data['wing'] || '',
        baptismStatus: data['baptism status'] || data['baptism'] || '',
        employmentStatus: data['employment status'] || '',
        occupation: data['nature of work'] || data['occupation'] || '',
    }
}

// Parse Tithes sheet row (monthly format: Name, Jan-Dec, Total, Months Paid)
export interface TitheRow {
    name: string
    months: Record<string, number>
    total: number
    monthsPaid: number
}

export function parseTitheRow(headers: string[], row: string[]): TitheRow {
    const data: Record<string, string> = {}
    headers.forEach((header, index) => {
        data[header.toLowerCase().trim()] = row[index] || ''
    })

    const months: Record<string, number> = {}
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december']

    monthNames.forEach(month => {
        const value = parseFloat(data[month] || data[month.slice(0, 3)] || '0')
        months[month] = isNaN(value) ? 0 : value
    })

    return {
        name: data['name'] || '',
        months,
        total: parseFloat(data['total'] || '0') || 0,
        monthsPaid: parseInt(data['months paid'] || '0', 10) || 0,
    }
}

// Parse Allocation sheet row (follow-up assignments)
export interface AllocationRow {
    caller: string
    name: string
    contact: string
    location: string
    remarks: string
}

export function parseAllocationRow(headers: string[], row: string[]): AllocationRow {
    const data: Record<string, string> = {}
    headers.forEach((header, index) => {
        data[header.toLowerCase().trim()] = row[index] || ''
    })

    return {
        caller: data['caller'] || '',
        name: data['name'] || '',
        contact: data['contact'] || '',
        location: data['location'] || '',
        remarks: data['remarks'] || '',
    }
}

// Parse Attendance sheet row
export interface AttendanceRow {
    date: string
    name: string
    present: boolean
    service: string
}

export function parseAttendanceRow(headers: string[], row: string[]): AttendanceRow {
    const data: Record<string, string> = {}
    headers.forEach((header, index) => {
        data[header.toLowerCase().trim()] = row[index] || ''
    })

    return {
        date: data['date'] || '',
        name: data['name'] || '',
        present: (data['present'] || data['status'] || '').toLowerCase() === 'yes' ||
            (data['present'] || data['status'] || '').toLowerCase() === 'p',
        service: data['service'] || data['service type'] || 'Sunday Service',
    }
}

// Parse Birthdays (Dobs) sheet row
export interface BirthdayRow {
    name: string
    dateOfBirth: string
    contact: string
}

export function parseBirthdayRow(headers: string[], row: string[]): BirthdayRow {
    const data: Record<string, string> = {}
    headers.forEach((header, index) => {
        data[header.toLowerCase().trim()] = row[index] || ''
    })

    return {
        name: data['name'] || '',
        dateOfBirth: data['date of birth'] || data['dob'] || data['birthday'] || '',
        contact: data['contact'] || data['telephone'] || data['phone'] || '',
    }
}
