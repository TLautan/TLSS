// frontend/app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Package, Percent, Activity as ActivityIcon, Settings, Clock, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { getDashboardData, getDashboardPreferences, updateDashboardPreferences } from '@/lib/api';
import { DashboardData, DashboardComponentProps, DashboardPreferences } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DashboardSettingsModal } from '@/features/dashboard/components/dashboard-settings-modal';

const COLORS = ['#16a34a', '#dc2626'];
const componentMap: { [key: string]: React.FC<DashboardComponentProps> } = {
	kpi_cards: KpiCards,
	monthly_sales: MonthlySalesChart,
	deal_outcomes: DealOutcomesChart,
	recent_deals: RecentDealsTable,
};

export default function DashboardPage() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [analyticsData, prefsData] = await Promise.all([
				getDashboardData(),
				getDashboardPreferences(),
			]);
			setDashboardData(analyticsData);
			setPreferences(prefsData);
		} catch (err) {
			console.error(err);
			setError('Failed to fetch dashboard data. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleSavePreferences = async (newPreferences: DashboardPreferences) => {
		try {
			const updatedPrefs = await updateDashboardPreferences(newPreferences);
			setPreferences(updatedPrefs);
		} catch (err) {
			console.error(err);
			setError("Failed to save preferences.");
		}
	};

	if (loading || !dashboardData || !preferences) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg font-semibold animate-pulse">ロード中</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
				<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							<Settings className="h-4 w-4 mr-2" />
							Customize
						</Button>
					</DialogTrigger>
					<DashboardSettingsModal
						currentPreferences={preferences}
						onSave={handleSavePreferences}
						onClose={() => setIsSettingsOpen(false)}
					/>
				</Dialog>
			</div>
			
			<div className="space-y-4">
				{preferences.layout.map(componentKey => {
					const ComponentToRender = componentMap[componentKey as keyof typeof componentMap]; 
					if (!ComponentToRender) return null;

					const propsForComponent: DashboardComponentProps = { data: dashboardData };
					if (componentKey === 'kpi_cards') {
						propsForComponent.visibleKpis = preferences.visible_kpis;
					}
					
					return <ComponentToRender key={componentKey} {...propsForComponent} />;
				})}
			</div>
		</div>
	);
}

// --- Dashboard Component Sections ---
function KpiCards({ data, visibleKpis }: { data: DashboardData, visibleKpis?: string[] }) {
    const allKpis: { [key: string]: React.ReactNode } = {
        total_revenue: (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">総収益</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">¥{data.kpis.total_value.toLocaleString()}</div>
                </CardContent>
            </Card>
        ),
        win_rate: (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">成約率</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.kpis.win_rate}%</div>
                </CardContent>
            </Card>
        ),
        total_deals: (
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">合計取引数</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.kpis.total_deals}</div>
                </CardContent>
            </Card>
        ),
        average_deal_size: (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">平均取引規模</CardTitle>
                    <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">¥{data.kpis.average_deal_size.toLocaleString()}</div>
                </CardContent>
            </Card>
        ),
        average_time_to_close: (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">平均成約時間</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.kpis.average_time_to_close} 日</div>
                </CardContent>
            </Card>
        ),
        arpu: (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">¥{data.kpis.arpu.toLocaleString()}</div>
                </CardContent>
            </Card>
        ),
    };
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(visibleKpis || []).map(key => <div key={key}>{allKpis[key]}</div>)}
        </div>
    );
}

function MonthlySalesChart({ data }: { data: DashboardData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Monthly Sales Overview</CardTitle>
			</CardHeader>
			<CardContent className="pl-2">
				<ResponsiveContainer width="100%" height={350}>
					<BarChart data={data.monthly_sales_chart_data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
						<YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `¥${(value / 10000).toLocaleString()}万`} />
						<Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
						<Legend />
						<Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} /> 
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

function DealOutcomesChart({ data }: { data: DashboardData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>取引結果</CardTitle>
				<CardDescription>完了したすべての取引の内訳。</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={350}>
					<PieChart>
						<Pie
							data={data.deal_outcomes_chart_data}
							labelLine={false}
							label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
						>
							{data.deal_outcomes_chart_data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip formatter={(value: number) => `${value.toLocaleString()} deals`} />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

function RecentDealsTable({ data }: { data: DashboardData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>最近の取引</CardTitle>
				<CardDescription>最近作成された 5 件の取引。</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>会社</TableHead>
							<TableHead>営業担当者</TableHead>
							<TableHead>ステータス</TableHead>
							<TableHead className="text-right">価値</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.recent_deals.map((deal) => (
							<TableRow key={deal.id}>
								<TableCell>
									<div className="font-medium">{deal.company?.company_name || 'N/A'}</div>
									<div className="hidden text-sm text-muted-foreground md:inline">{deal.title}</div>
								</TableCell>
								<TableCell>{deal.user?.name || 'N/A'}</TableCell>
								<TableCell><Badge variant="outline">{deal.status}</Badge></TableCell>
								<TableCell className="text-right">¥{Number(deal.value).toLocaleString()}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
