'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Database } from '../../types/database.types'

type PayoutSummary = Database['public']['Views']['merchant_dashboard_payout_summary']['Row']

interface RevenueChartProps {
  summary: PayoutSummary
}

export function RevenueChart({ summary }: RevenueChartProps) {
  // Transform the single summary row into an array structure expected by recharts
  // In a real application, you might query a time-series view for the chart
  const data = [
    {
      name: 'Current Period',
      Revenue: summary.total_revenue,
      Pending: summary.pending_payouts,
    }
  ]

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 14 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`$${value.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`, undefined]}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={60} />
          <Bar dataKey="Pending" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
