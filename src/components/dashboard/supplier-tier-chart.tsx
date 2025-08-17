'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

interface TierData {
  tier: number
  count: number
}

interface SupplierTierChartProps {
  data: TierData[]
}

export function SupplierTierChart({ data }: SupplierTierChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Suppliers by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-center py-12">
            No supplier data available.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    ...item,
    tierLabel: `Tier ${item.tier}`
  }))

  return (
    <Card className="border-0 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Suppliers by Tier</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis 
              dataKey="tierLabel" 
              tick={{ fontSize: 12, fill: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#cbd5e1' }}
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Suppliers']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                color: '#f1f5f9'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#00FF85"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
