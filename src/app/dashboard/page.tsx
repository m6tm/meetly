
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, Pie, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp, Users, Clock, CheckSquare, Hourglass, AlertCircle, CalendarDays, Zap, PieChartIcon as LucidePieChartIcon, BarChart2, LineChartIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScheduleMeetingModal from '@/components/meetly/schedule-modal';
import { useRouter } from 'next/navigation';
import { AnalyticsResponse, getAnalytics } from '@/actions/analytics.action';
import { formatToHumanReadable } from '@/lib/meetly-tools';

// Sample data for charts
const meetingsPerMonthData = [
  { month: 'Jan', meetings: 65, duration: 2400 },
  { month: 'Feb', meetings: 59, duration: 2210 },
  { month: 'Mar', meetings: 80, duration: 2290 },
  { month: 'Apr', meetings: 81, duration: 2000 },
  { month: 'May', meetings: 56, duration: 2181 },
  { month: 'Jun', meetings: 55, duration: 2500 },
  { month: 'Jul', meetings: 40, duration: 2100 },
];

const userActivityData = [
  { name: 'Alice W.', meetingsHosted: 25, meetingsAttended: 40 },
  { name: 'Bob B.', meetingsHosted: 18, meetingsAttended: 35 },
  { name: 'Charlie B.', meetingsHosted: 12, meetingsAttended: 22 },
  { name: 'Diana P.', meetingsHosted: 30, meetingsAttended: 50 },
  { name: 'Edward S.', meetingsHosted: 15, meetingsAttended: 28 },
];

const transcriptionStatusData = [
  { name: 'Completed', value: 400, fill: 'var(--color-completed)' },
  { name: 'Pending', value: 300, fill: 'var(--color-pending)' },
  { name: 'Failed', value: 50, fill: 'var(--color-failed)' },
  { name: 'Processing', value: 100, fill: 'var(--color-processing)' },
];

const chartConfigMeetings: ChartConfig = {
  meetings: {
    label: "Meetings",
    color: "hsl(var(--chart-1))",
  },
  duration: {
    label: "Duration (min)",
    color: "hsl(var(--chart-2))",
  }
};

const chartConfigUsers: ChartConfig = {
  meetingsHosted: {
    label: "Hosted",
    color: "hsl(var(--chart-1))",
  },
  meetingsAttended: {
    label: "Attended",
    color: "hsl(var(--chart-2))",
  }
};

const chartConfigTranscription: ChartConfig = {
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  pending: { label: "Pending", color: "hsl(var(--chart-2))" },
  failed: { label: "Failed", color: "hsl(var(--chart-3))" },
  processing: { label: "Processing", color: "hsl(var(--chart-4))" },
};


export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    totalMeetings: {
      total: 0,
      lastMonth: 0,
    },
    avgRecordingDuration: {
      total: 0,
      lastMonth: 0,
    },
    transcriptionSuccessRate: {
      total: 0,
      lastMonth: 0,
    },
    activeUsers: {
      total: 0,
      lastWeek: 0,
    }
  })

  useEffect(() => {
    getAnalytics().then((response) => {
      if (response.success && response.data) {
        setAnalytics(response.data)
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Meeting Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights into your team&apos;s meeting activities and performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => router.push('/meet')}>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Meeting
          </Button>
          <ScheduleMeetingModal />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMeetings.total}</div>
            <p className="text-xs text-muted-foreground">+{analytics.totalMeetings.lastMonth} from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Meeting Recording Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatToHumanReadable(Number(analytics.avgRecordingDuration.total))}</div>
            <p className="text-xs text-muted-foreground">+{formatToHumanReadable(analytics.avgRecordingDuration.lastMonth - analytics.avgRecordingDuration.total)} from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers.total}</div>
            <p className="text-xs text-muted-foreground">+{analytics.activeUsers.lastWeek} since last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcription Success</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.transcriptionSuccessRate.total}%</div>
            <p className="text-xs text-muted-foreground">Accuracy rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Meetings per Month Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
              Meeting Trends
            </CardTitle>
            <CardDescription>Number of meetings over the past months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigMeetings} className="min-h-[250px] h-[40vh] sm:h-[300px] w-full">
              <LineChart data={meetingsPerMonthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent hideIndicator />} />
                <Line type="monotone" dataKey="meetings" stroke="var(--color-meetings)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Transcription Status Pie Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucidePieChartIcon className="mr-2 h-5 w-5 text-primary" />
              Transcription Status
            </CardTitle>
            <CardDescription>Distribution of transcription statuses.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfigTranscription} className="min-h-[250px] h-[40vh] sm:h-[300px] w-full max-w-xs">
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                <Pie data={transcriptionStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {transcriptionStatusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="name"
                    className="fill-background text-sm font-medium"
                    stroke="none"
                    formatter={(value: string) =>
                      chartConfigTranscription[value.toLowerCase() as keyof typeof chartConfigTranscription]?.label ?? value
                    }
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-primary" />
            User Activity
          </CardTitle>
          <CardDescription>Meetings hosted and attended by top users.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigUsers} className="min-h-[250px] h-[40vh] sm:h-[350px] w-full">
            <BarChart data={userActivityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="meetingsHosted" fill="var(--color-meetingsHosted)" radius={4} />
              <Bar dataKey="meetingsAttended" fill="var(--color-meetingsAttended)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
