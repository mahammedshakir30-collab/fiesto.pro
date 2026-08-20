"use client";

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, Ticket, Calendar } from 'lucide-react';

export function KPIDashboard() {
  const kpis = [
    { label: 'Total Revenue (MTD)', value: '$2.4M', change: '+14%', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Active Festivals', value: '142', change: '+12', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Tickets Sold (MTD)', value: '84,092', change: '+22%', icon: <Ticket className="w-5 h-5" /> },
    { label: 'Registered Users', value: '1.2M', change: '+5%', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      {kpis.map((kpi, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            {kpi.icon}
            <span className="text-sm uppercase tracking-wider">{kpi.label}</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl">{kpi.value}</span>
            <span className="text-color-success font-bold pb-1">{kpi.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const data = [
  { name: 'Week 1', revenue: 400000 },
  { name: 'Week 2', revenue: 300000 },
  { name: 'Week 3', revenue: 550000 },
  { name: 'Week 4', revenue: 450000 },
  { name: 'Week 5', revenue: 700000 },
];

export function RevenueChart() {
  return (
    <div className="h-[400px] w-full">
      <h3 className="font-heading text-xl font-bold mb-6">Revenue Trend (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#353247" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#A19FAF" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#A19FAF" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#201D2C', border: 'none', borderRadius: '12px', color: '#FDF8E2' }}
            itemStyle={{ color: '#F1642E', fontWeight: 'bold' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#F1642E" 
            strokeWidth={4} 
            dot={{ r: 6, fill: '#F1642E', strokeWidth: 0 }} 
            activeDot={{ r: 8, strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityFeed() {
  const activities = [
    { time: '10m ago', text: 'Organizer Neon Nights Productions verified.', type: 'org' },
    { time: '1h ago', text: 'Festival Summit Frequency published.', type: 'fest' },
    { time: '2h ago', text: 'Payout of $150,000 processed for Desert Oasis.', type: 'finance' },
    { time: '5h ago', text: 'New vendor application from Marina Seafood Shack.', type: 'vendor' },
    { time: '1d ago', text: 'System alert: High traffic on checkout for Aurora Borealis.', type: 'system' },
  ];

  return (
    <div>
      <h3 className="font-heading text-xl font-bold mb-6">Platform Activity</h3>
      <div className="space-y-0">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-4 py-4 border-b border-border last:border-0">
            <span className="w-16 shrink-0 text-xs text-muted-foreground font-mono mt-0.5">{item.time}</span>
            <span className="font-sans text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
