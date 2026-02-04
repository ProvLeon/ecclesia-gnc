'use client'

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

// Color palette
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface ChartProps {
    data: any[]
    height?: number
}

// Financial trend line chart
export function FinanceTrendChart({ data, height = 300 }: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="text-slate-500"
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₵${(value / 1000).toFixed(0)}k`}
                    className="text-slate-500"
                />
                <Tooltip
                    formatter={(value) => `GH₵ ${Number(value).toLocaleString()}`}
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="tithes"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Tithes"
                />
                <Line
                    type="monotone"
                    dataKey="offerings"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Offerings"
                />
                <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Expenses"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

// Attendance bar chart
export function AttendanceChart({ data, height = 300 }: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                    }}
                />
                <Legend />
                <Bar dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} name="Attendance" />
                <Bar dataKey="average" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Avg" />
            </BarChart>
        </ResponsiveContainer>
    )
}

// Member distribution pie chart
export function MemberDistributionChart({ data, height = 300 }: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => Number(value).toLocaleString()}
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

// Department comparison bar chart
export function DepartmentComparisonChart({ data, height = 300 }: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={80}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                    }}
                />
                <Bar dataKey="members" fill="#6366f1" radius={[0, 4, 4, 0]} name="Members" />
            </BarChart>
        </ResponsiveContainer>
    )
}

// Simple stat card with trend
export function TrendIndicator({ value, trend }: { value: number; trend: 'up' | 'down' | 'neutral' }) {
    const color = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
    const icon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

    return (
        <span className={`text-sm font-medium ${color}`}>
            {icon} {value}%
        </span>
    )
}
