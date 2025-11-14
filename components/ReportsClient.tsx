'use client';

import React, { useState, useRef } from 'react';
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
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
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
import jsPDF from 'jspdf';


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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

 

  const generateProfessionalPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set document properties
      pdf.setProperties({
        title: `System Report - ${reportType}`,
        subject: 'CodeMaster Platform Analytics',
        author: 'CodeMaster Admin',
        keywords: 'analytics, report, users, performance',
        creator: 'CodeMaster System'
      });

      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text('CodeMaster System Report', 20, yPosition);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      yPosition += 10;
      pdf.text(`Report Type: ${reportType} | Date Range: ${dateRange}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPosition);
      
      yPosition += 20;

      // Executive Summary
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Executive Summary', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(80);
      const totalUsers = userGrowth[userGrowth.length - 1]?.users || 0;
      const activeUsers = userGrowth[userGrowth.length - 1]?.active || 0;
      const newSignups = userGrowth.reduce((sum, month) => sum + month.newSignups, 0);
      
      const summaryLines = [
        `• Total Users: ${totalUsers.toLocaleString()}`,
        `• Active Users: ${activeUsers.toLocaleString()}`,
        `• New Signups (Period): ${newSignups.toLocaleString()}`,
        `• User Levels Distribution: ${userDistribution.map(d => `${d.name}: ${d.value}`).join(', ')}`
      ];

      summaryLines.forEach(line => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 25, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // User Growth Data Table
      if (userGrowth.length > 0) {
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40);
        pdf.text('User Growth Data', 20, yPosition);
        yPosition += 10;

        // Table headers
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(59, 130, 246);
        pdf.rect(20, yPosition, 170, 8, 'F');
        pdf.text('Month', 22, yPosition + 5);
        pdf.text('Total Users', 60, yPosition + 5);
        pdf.text('Active Users', 100, yPosition + 5);
        pdf.text('New Signups', 140, yPosition + 5);
        yPosition += 8;

        // Table rows
        pdf.setTextColor(0);
        userGrowth.forEach(row => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
            // Add headers again on new page
            pdf.setFillColor(59, 130, 246);
            pdf.rect(20, yPosition, 170, 8, 'F');
            pdf.setTextColor(255);
            pdf.text('Month', 22, yPosition + 5);
            pdf.text('Total Users', 60, yPosition + 5);
            pdf.text('Active Users', 100, yPosition + 5);
            pdf.text('New Signups', 140, yPosition + 5);
            yPosition += 8;
            pdf.setTextColor(0);
          }

          pdf.text(row.month, 22, yPosition + 5);
          pdf.text(row.users.toString(), 60, yPosition + 5);
          pdf.text(row.active.toString(), 100, yPosition + 5);
          pdf.text(row.newSignups.toString(), 140, yPosition + 5);
          yPosition += 6;
        });

        yPosition += 15;
      }

      // Performance by Level
      if (performanceByLevel.length > 0) {
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Performance by User Level', 20, yPosition);
        yPosition += 10;

        // Table headers
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(16, 185, 129);
        pdf.rect(20, yPosition, 170, 8, 'F');
        pdf.text('Level', 22, yPosition + 5);
        pdf.text('Users', 60, yPosition + 5);
        pdf.text('Avg XP', 100, yPosition + 5);
        pdf.text('Completion Rate', 140, yPosition + 5);
        yPosition += 8;

        // Table rows
        pdf.setTextColor(0);
        performanceByLevel.forEach(row => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
            pdf.setFillColor(16, 185, 129);
            pdf.rect(20, yPosition, 170, 8, 'F');
            pdf.setTextColor(255);
            pdf.text('Level', 22, yPosition + 5);
            pdf.text('Users', 60, yPosition + 5);
            pdf.text('Avg XP', 100, yPosition + 5);
            pdf.text('Completion Rate', 140, yPosition + 5);
            yPosition += 8;
            pdf.setTextColor(0);
          }

          pdf.text(row.level, 22, yPosition + 5);
          pdf.text(row.users.toString(), 60, yPosition + 5);
          pdf.text(row.avgXP.toFixed(0), 100, yPosition + 5);
          pdf.text(`${row.completionRate.toFixed(1)}%`, 140, yPosition + 5);
          yPosition += 6;
        });
      }

      // Analytics and Insights
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Analytics & Insights', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(80);

      const insights = [
        'Key Findings:',
        `• User growth trend: ${calculateGrowthTrend(userGrowth)}`,
        `• Most active user level: ${findMostActiveLevel(performanceByLevel)}`,
        `• Dominant skill level: ${findDominantSkillLevel(userDistribution)}`,
        `• Overall platform health: ${calculatePlatformHealth(userGrowth, performanceByLevel)}`,
        '',
        'Recommendations:',
        '• Focus on user retention strategies',
        '• Develop targeted content for dominant user levels',
        '• Monitor growth metrics regularly',
        '• Consider feature enhancements based on user distribution'
      ];

      insights.forEach(insight => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(insight, 25, yPosition);
        yPosition += 6;
      });

      pdf.save(`professional-report-${dateRange}-${reportType}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating professional PDF:', error);
      alert('Failed to generate professional PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper functions for insights
  const calculateGrowthTrend = (growth: typeof userGrowth) => {
    if (growth.length < 2) return 'Insufficient data';
    const first = growth[0].users;
    const last = growth[growth.length - 1].users;
    const growthRate = ((last - first) / first) * 100;
    return growthRate >= 0 ? `Growing (+${growthRate.toFixed(1)}%)` : `Declining (${growthRate.toFixed(1)}%)`;
  };

  const findMostActiveLevel = (performance: typeof performanceByLevel) => {
    return performance.reduce((max, level) => level.users > max.users ? level : max, performance[0])?.level || 'N/A';
  };

  const findDominantSkillLevel = (distribution: typeof userDistribution) => {
    return distribution.reduce((max, level) => level.value > max.value ? level : max, distribution[0])?.name || 'N/A';
  };

  const calculatePlatformHealth = (growth: typeof userGrowth, performance: typeof performanceByLevel) => {
    const activeRate = (growth[growth.length - 1]?.active / growth[growth.length - 1]?.users) * 100 || 0;
    const avgCompletion = performance.reduce((sum, level) => sum + level.completionRate, 0) / performance.length || 0;
    
    if (activeRate > 50 && avgCompletion > 60) return 'Excellent';
    if (activeRate > 30 && avgCompletion > 40) return 'Good';
    return 'Needs Attention';
  };

  const handleDownloadReport = async (format: string) => {
    if (format === 'pdf') {
      await generateProfessionalPDF();
    } else if (format === 'json') {
      // Download as JSON
      const reportData = {
        dateRange,
        reportType,
        userGrowth,
        performanceByLevel,
        userDistribution,
        generatedAt: new Date().toISOString(),
        metadata: {
          totalUsers: userGrowth[userGrowth.length - 1]?.users || 0,
          activeUsers: userGrowth[userGrowth.length - 1]?.active || 0,
          insights: {
            growthTrend: calculateGrowthTrend(userGrowth),
            mostActiveLevel: findMostActiveLevel(performanceByLevel),
            platformHealth: calculatePlatformHealth(userGrowth, performanceByLevel)
          }
        }
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
              <Button 
                onClick={() => handleDownloadReport('pdf')}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
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

      {/* Report content (for PDF export) */}
      <div ref={reportRef}>
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
      </div>
    </>
  );
}