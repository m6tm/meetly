"use client";

import {
	CalendarDays,
	Clock,
	LineChartIcon,
	PieChartIcon as LucidePieChartIcon,
	PlusCircle,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	CartesianGrid,
	Cell,
	LabelList,
	Line,
	LineChart,
	Pie,
	PieChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import ScheduleMeetingModal from "@/components/meetly/schedule-modal";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	formatSecondToHumanReadable,
	formatToHumanReadable,
} from "@/lib/meetly-tools";
import { useGetMeetingAnalytics } from "@/modules/meeting/interface/hooks/use-get-meeting-analytics";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfigMeetings = {
	meetings: {
		label: "Meetings",
		color: "hsl(var(--primary))",
	},
} satisfies ChartConfig;

const chartConfigTranscription = {
	transcription_completed: {
		label: "Completed",
		color: "hsl(var(--chart-1))",
	},
	transcription_pending: {
		label: "Pending",
		color: "hsl(var(--chart-2))",
	},
	transcription_failed: {
		label: "Failed",
		color: "hsl(var(--chart-3))",
	},
	transcription_processing: {
		label: "Processing",
		color: "hsl(var(--chart-4))",
	},
} satisfies ChartConfig;

/** 
 * Composant de chargement pour le dashboard utilisant des Skeletons.
 * @returns JSX.Element
 */
function DashboardSkeleton() {
	return (
		<div className="space-y-6 animate-pulse">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="space-y-2">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<div className="flex items-center space-x-3">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-44" />
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i} className="shadow-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4 rounded-full" />
						</CardHeader>
						<CardContent className="space-y-2">
							<Skeleton className="h-8 w-16" />
							<Skeleton className="h-3 w-32" />
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{[1, 2].map((i) => (
					<Card key={i} className="shadow-md">
						<CardHeader className="space-y-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-full" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-[300px] w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export default function AnalyticsPage() {
	const router = useRouter();
	const { data: analytics, isLoading } = useGetMeetingAnalytics();

	if (isLoading || !analytics) {
		return <DashboardSkeleton />;
	}

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
					<Button onClick={() => router.push("/meet")}>
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
						<CardTitle className="text-sm font-medium">
							Total Meetings
						</CardTitle>
						<CalendarDays className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.totalMeetings.total}
						</div>
						<p className="text-xs text-muted-foreground">
							+{analytics.totalMeetings.lastMonth} from last month
						</p>
					</CardContent>
				</Card>
				<Card className="shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg. Meeting Recording Duration
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatToHumanReadable(
								Number(analytics.avgRecordingDuration.total),
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							+
							{formatToHumanReadable(
								analytics.avgRecordingDuration.lastMonth -
									analytics.avgRecordingDuration.total,
							)}{" "}
							from last month
						</p>
					</CardContent>
				</Card>
				<Card className="shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg. Meeting Duration
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatSecondToHumanReadable(analytics.avgMeetingDuration.total)}
						</div>
						<p className="text-xs text-muted-foreground">
							+
							{formatSecondToHumanReadable(
								analytics.avgMeetingDuration.lastMonth -
									analytics.avgMeetingDuration.total,
							)}{" "}
							from last month
						</p>
					</CardContent>
				</Card>
				<Card className="shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Transcription Success
						</CardTitle>
						<Zap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.transcriptionSuccessRate.total}%
						</div>
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
						<CardDescription>
							Number of meetings over the past months.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={chartConfigMeetings}
							className="min-h-[250px] h-[40vh] sm:h-[300px] w-full"
						>
							<LineChart
								data={analytics.meetingTrends}
								margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<YAxis tickLine={false} axisLine={false} tickMargin={8} />
								<Tooltip content={<ChartTooltipContent hideIndicator />} />
								<Line
									type="monotone"
									dataKey="meetings"
									stroke="var(--color-meetings)"
									strokeWidth={2}
									dot={false}
								/>
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
						<CardDescription>
							Distribution of transcription statuses.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						<ChartContainer
							config={chartConfigTranscription}
							className="min-h-[250px] h-[40vh] sm:h-[300px] w-full max-w-xs"
						>
							<PieChart>
								<Tooltip
									content={<ChartTooltipContent hideLabel nameKey="name" />}
								/>
								<Pie
									data={analytics.transcriptionStatusDistribution}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={100}
									label
								>
									{analytics.transcriptionStatusDistribution.map((entry) => (
										<Cell key={`cell-${entry.name}`} fill={entry.fill} />
									))}
									<LabelList
										dataKey="name"
										className="fill-background text-sm font-medium"
										stroke="none"
										formatter={(value: string) =>
											chartConfigTranscription[
												value.toLowerCase() as keyof typeof chartConfigTranscription
											]?.label ?? value
										}
									/>
								</Pie>
								<ChartLegend content={<ChartLegendContent nameKey="name" />} />
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
