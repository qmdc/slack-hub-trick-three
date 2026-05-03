import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, Empty, Button, message } from 'antd';
import { TrophyOutlined, TagOutlined, WarningOutlined, CalendarOutlined, RestOutlined } from '@ant-design/icons';
import { getRecords, getStatistics, type TypingTestRecord, type TypingStatisticsResponse } from '../../../apis/modules/typingtest';

interface ChartData {
 labels: string[];
 wpmData: number[];
 accuracyData: number[];
}

function LineChart({ data }: { data: ChartData }) {
 const maxWpm = Math.max(...data.wpmData, 1);
 const maxAccuracy = 100;
 const padding = { top: 20, right: 20, bottom: 40, left: 50 };
 const width = 700;
 const height = 300;
 const chartWidth = width - padding.left - padding.right;
 const chartHeight = height - padding.top - padding.bottom;

 const wpmPoints = data.wpmData.map((value, index) => ({
 x: padding.left + (index / (data.wpmData.length - 1)) * chartWidth,
 y: padding.top + chartHeight - (value / maxWpm) * chartHeight,
 }));

 const accuracyPoints = data.accuracyData.map((value, index) => ({
 x: padding.left + (index / (data.accuracyData.length - 1)) * chartWidth,
 y: padding.top + chartHeight - (value / maxAccuracy) * chartHeight,
 }));

 const pathD = (points: { x: number; y: number }[]) => {
 if (points.length === 0) return '';
 return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
 };

 const wpmPath = pathD(wpmPoints);
 const accuracyPath = pathD(accuracyPoints);

 const gridLines = Array.from({ length: 5 }, (_, i) => ({
 y: padding.top + (chartHeight / 4) * i,
 label: Math.round(maxWpm - (maxWpm / 4) * i),
 }));

 const xLabels = data.labels.map((label, index) => ({
 x: padding.left + (index / (data.labels.length - 1)) * chartWidth,
 label,
 }));

 return (
 <div className="w-full">
 <svg width={width} height={height} className="mx-auto">
 <defs>
 <linearGradient id="wpmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
 <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
 </linearGradient>
 <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
 <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
 </linearGradient>
 </defs>

 {gridLines.map((line, i) => (
 <line
 key={i}
 x1={padding.left}
 y1={line.y}
 x2={width - padding.right}
 y2={line.y}
 stroke="#E5E7EB"
 strokeDasharray="4"
 />
 ))}

 <text x={padding.left - 10} y={padding.top + chartHeight / 2} textAnchor="middle" transform={`rotate(-90, ${padding.left - 10}, ${padding.top + chartHeight / 2})`} className="text-xs fill-gray-500">
 WPM
 </text>

 {gridLines.map((line, i) => (
 <text key={i} x={padding.left - 8} y={line.y + 4} textAnchor="end" className="text-xs fill-gray-500">
 {line.label}
 </text>
 ))}

 {xLabels.map((label, i) => (
 <text key={i} x={label.x} y={height - 10} textAnchor="middle" className="text-xs fill-gray-500">
 {label.label}
 </text>
 ))}

 <path
 d={`${wpmPath} L ${wpmPoints[wpmPoints.length - 1]?.x || 0} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
 fill="url(#wpmGradient)"
 />
 <path d={wpmPath} fill="none" stroke="#3B82F6" strokeWidth={2} />

 {wpmPoints.map((point, i) => (
 <circle key={i} cx={point.x} cy={point.y} r={4} fill="#3B82F6" />
 ))}

 <path
 d={`${accuracyPath} L ${accuracyPoints[accuracyPoints.length - 1]?.x || 0} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
 fill="url(#accuracyGradient)"
 />
 <path d={accuracyPath} fill="none" stroke="#22C55E" strokeWidth={2} strokeDasharray="6" />

 {accuracyPoints.map((point, i) => (
 <circle key={i} cx={point.x} cy={point.y} r={4} fill="#22C55E" />
 ))}

 <g transform={`translate(${width - 100}, ${padding.top})`}>
 <circle cx={15} cy={15} r={6} fill="#3B82F6" />
 <text x={25} y={20} className="text-xs fill-gray-600">WPM</text>
 <circle cx={15} cy={40} r={6} fill="#22C55E" />
 <text x={25} y={45} className="text-xs fill-gray-600">准确率%</text>
 </g>
 </svg>
 </div>
 );
}

function BarChart({ data }: { data: ChartData }) {
 const maxValue = Math.max(...data.wpmData, ...data.accuracyData, 1);
 const padding = { top: 20, right: 20, bottom: 40, left: 60 };
 const width = 700;
 const height = 250;
 const chartWidth = width - padding.left - padding.right;
 const chartHeight = height - padding.top - padding.bottom;
 const barWidth = chartWidth / (data.labels.length * 3);

 return (
 <div className="w-full">
 <svg width={width} height={height} className="mx-auto">
 <text x={padding.left - 10} y={padding.top + chartHeight / 2} textAnchor="middle" transform={`rotate(-90, ${padding.left - 10}, ${padding.top + chartHeight / 2})`} className="text-xs fill-gray-500">
 数值
 </text>

 {Array.from({ length: 5 }, (_, i) => {
 const y = padding.top + (chartHeight / 4) * i;
 const label = Math.round(maxValue - (maxValue / 4) * i);
 return (
 <g key={i}>
 <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E5E7EB" strokeDasharray="4" />
 <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
 {label}
 </text>
 </g>
 );
 })}

 {data.labels.map((label, index) => {
 const x = padding.left + barWidth * (index * 3 + 1.5);
 return (
 <text key={index} x={x} y={height - 10} textAnchor="middle" className="text-xs fill-gray-500">
 {label}
 </text>
 );
 })}

 {data.labels.map((_, index) => {
 const baseX = padding.left + barWidth * index * 3;
 const wpmHeight = (data.wpmData[index] / maxValue) * chartHeight;
 const accuracyHeight = (data.accuracyData[index] / maxValue) * chartHeight;

 return (
 <g key={index}>
 <rect
 x={baseX}
 y={padding.top + chartHeight - wpmHeight}
 width={barWidth - 4}
 height={wpmHeight}
 fill="#3B82F6"
 rx={4}
 />
 <rect
 x={baseX + barWidth + 4}
 y={padding.top + chartHeight - accuracyHeight}
 width={barWidth - 4}
 height={accuracyHeight}
 fill="#22C55E"
 rx={4}
 />
 </g>
 );
 })}

 <g transform={`translate(${width - 100}, ${padding.top})`}>
 <rect x={0} y={0} width={12} height={12} fill="#3B82F6" rx={2} />
 <text x={18} y={10} className="text-xs fill-gray-600">WPM</text>
 <rect x={0} y={20} width={12} height={12} fill="#22C55E" rx={2} />
 <text x={18} y={30} className="text-xs fill-gray-600">准确率%</text>
 </g>
 </svg>
 </div>
 );
}

export default function AnalyticsPage() {
 const [records, setRecords] = useState<TypingTestRecord[]>([]);
 const [statistics, setStatistics] = useState<TypingStatisticsResponse | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 setLoading(true);
 const [recordsRes, statsRes] = await Promise.all([getRecords(), getStatistics()]);
 if (recordsRes.data) {
 setRecords(recordsRes.data);
 }
 if (statsRes.data) {
 setStatistics(statsRes.data);
 }
 setLoading(false);
 };

 const handleRefresh = () => {
 loadData();
 message.success('数据已刷新');
 };

 const chartData = useMemo((): ChartData => {
 const groupedRecords = records.reduce((acc, record) => {
 const date = new Date(record.startTime);
 const key = `${date.getMonth() + 1}/${date.getDate()}`;
 if (!acc[key]) {
 acc[key] = { wpm: [], accuracy: [] };
 }
 acc[key].wpm.push(record.wpm);
 acc[key].accuracy.push(record.accuracy);
 return acc;
 }, {} as Record<string, { wpm: number[]; accuracy: number[] }>);

 const sortedKeys = Object.keys(groupedRecords).sort((a, b) => {
 const [m1, d1] = a.split('/').map(Number);
 const [m2, d2] = b.split('/').map(Number);
 if (m1 !== m2) return m1 - m2;
 return d1 - d2;
 });

 return {
 labels: sortedKeys.slice(-7),
 wpmData: sortedKeys.slice(-7).map(key => {
 const values = groupedRecords[key].wpm;
 return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
 }),
 accuracyData: sortedKeys.slice(-7).map(key => {
 const values = groupedRecords[key].accuracy;
 return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
 }),
 };
 }, [records]);

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
 <Card className="max-w-6xl mx-auto shadow-xl">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-800">数据分析</h1>
 <p className="text-gray-500 text-sm mt-1">查看打字水平变化趋势</p>
 </div>
 <Button icon={<RestOutlined />} onClick={handleRefresh} loading={loading}>
 刷新
 </Button>
 </div>

 {loading ? (
 <div className="text-center py-10">加载中...</div>
 ) : records.length === 0 ? (
 <Empty description="暂无测试数据，开始测试以生成分析图表" />
 ) : (
 <>
 <Row gutter={16} className="mb-6">
 <Col span={6}>
 <Card bordered={false}>
 <Statistic
 title="最高WPM"
 value={statistics?.maxWpm || 0}
 prefix={<TrophyOutlined className="text-yellow-500" />}
 />
 </Card>
 </Col>
 <Col span={6}>
 <Card bordered={false}>
 <Statistic
 title="平均WPM"
 value={statistics?.avgWpm ? Math.round(statistics.avgWpm) : 0}
 prefix={<WarningOutlined className="text-blue-500" />}
 />
 </Card>
 </Col>
 <Col span={6}>
 <Card bordered={false}>
 <Statistic
 title="平均准确率"
 value={statistics?.avgAccuracy ? statistics.avgAccuracy.toFixed(1) : '0.0'}
 suffix="%"
 prefix={<TagOutlined className="text-green-500" />}
 />
 </Card>
 </Col>
 <Col span={6}>
 <Card bordered={false}>
 <Statistic
 title="测试次数"
 value={statistics?.totalCount || 0}
 prefix={<CalendarOutlined className="text-purple-500" />}
 />
 </Card>
 </Col>
 </Row>

 <Card title="近7天趋势（折线图）" bordered={false} className="mb-6">
 <LineChart data={chartData} />
 </Card>

 <Card title="近7天对比（柱状图）" bordered={false}>
 <BarChart data={chartData} />
 </Card>

 <Card title="数据统计" bordered={false} className="mt-6">
 <Row gutter={16}>
 <Col span={12}>
 <div className="bg-blue-50 rounded-lg p-4">
 <h3 className="text-gray-700 font-medium mb-2">WPM 分布</h3>
 <div className="space-y-2">
 {[
 { range: '0-30', label: '初学者', count: records.filter(r => r.wpm <= 30).length },
 { range: '31-50', label: '入门', count: records.filter(r => r.wpm > 30 && r.wpm <= 50).length },
 { range: '51-70', label: '熟练', count: records.filter(r => r.wpm > 50 && r.wpm <= 70).length },
 { range: '71+', label: '高手', count: records.filter(r => r.wpm > 70).length },
 ].map(item => (
 <div key={item.range} className="flex items-center justify-between">
 <span className="text-sm text-gray-600">{item.label} ({item.range})</span>
 <div className="flex items-center gap-2">
 <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-blue-500 rounded-full transition-all"
 style={{ width: `${(item.count / records.length) * 100}%` }}
 />
 </div>
 <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Col>
 <Col span={12}>
 <div className="bg-green-50 rounded-lg p-4">
 <h3 className="text-gray-700 font-medium mb-2">准确率分布</h3>
 <div className="space-y-2">
 {[
 { range: '95-100', label: '优秀', count: records.filter(r => r.accuracy >= 95).length },
 { range: '85-94', label: '良好', count: records.filter(r => r.accuracy >= 85 && r.accuracy < 95).length },
 { range: '70-84', label: '一般', count: records.filter(r => r.accuracy >= 70 && r.accuracy < 85).length },
 { range: '0-69', label: '需改进', count: records.filter(r => r.accuracy < 70).length },
 ].map(item => (
 <div key={item.range} className="flex items-center justify-between">
 <span className="text-sm text-gray-600">{item.label} ({item.range}%)</span>
 <div className="flex items-center gap-2">
 <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-green-500 rounded-full transition-all"
 style={{ width: `${(item.count / records.length) * 100}%` }}
 />
 </div>
 <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Col>
 </Row>
 </Card>
 </>
 )}
 </Card>
 </div>
 );
}
