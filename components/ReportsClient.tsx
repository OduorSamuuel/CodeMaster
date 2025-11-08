'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download, 
  FileSpreadsheet,
  FileJson,
  Printer,
  RefreshCw
} from 'lucide-react';
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
  AreaChart,
  Area
} from 'recharts';
import { useRouter } from 'next/navigation';

interface SystemReportsClientProps {
  userGrowth: Array<{
    month: string;
    users: number;
    active: number;
    newSignups: number;
  }>;
  performanceByLevel: Array<{
    level: string;
    users: number;
    avgXP: number;
    completionRate: number;
  }>;
  userDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dateRange: string;
  reportType: string;
}

export default function SystemReportsClient({
  userGrowth,
  performanceByLevel,
  userDistribution,
  dateRange: initialDateRange,
  reportType: initialReportType
}: SystemReportsClientProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [reportType, setReportType] = useState(initialReportType);

  const handleDownloadReport = (format: string) => {
    // In real implementation, this would generate and download the actual report
    console.log(`Downloading ${reportType} report in ${format} format for ${dateRange}`);
    
    if (format === 'json') {
      // Download as JSON
      const reportData = {
        dateRange,
        reportType,
        userGrowth,
        performanceByLevel,
        userDistribution,
        generatedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-report-${dateRange}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Download user growth data as CSV
      const headers = 'Month,Total Users,Active Users,New Signups\n';
      const rows = userGrowth.map(row => 
        `${row.month},${row.users},${row.active},${row.newSignups}`
      ).join('\n');
      
      const csvContent = headers + rows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-report-${dateRange}-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`PDF export functionality coming soon!`);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleFilterChange = (key: 'dateRange' | 'reportType', value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    
    if (key === 'dateRange') {
      setDateRange(value);
    } else {
      setReportType(value);
    }
    
    router.push(`/admin/reports?${params.toString()}`);
  };

  return (
    <>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">System Reports</h2>
          <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={(value) => handleFilterChange('reportType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="user_analytics">User Analytics Only</SelectItem>
                  <SelectItem value="performance">Performance Metrics</SelectItem>
                  <SelectItem value="engagement">Engagement Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => handleDownloadReport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => handleDownloadReport('csv')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleDownloadReport('json')}>
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      {userGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>Total users, active users, and new signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                  name="Total Users" 
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6} 
                  name="Active Users" 
                />
                <Area 
                  type="monotone" 
                  dataKey="newSignups" 
                  stackId="3" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.6} 
                  name="New Signups" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance by Level & User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {performanceByLevel.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by User Level</CardTitle>
              <CardDescription>Average XP and completion rates across different levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByLevel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="Users" />
                  <Bar yAxisId="right" dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {userDistribution.length > 0 && userDistribution.some(d => d.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Skill Level</CardTitle>
              <CardDescription>Breakdown of users across experience levels</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}