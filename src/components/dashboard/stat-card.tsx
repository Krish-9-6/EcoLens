'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
          {title}
        </CardTitle>
        <div className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
          {value}
        </div>
        <div className="mt-2 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  )
}
