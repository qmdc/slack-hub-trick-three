import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Empty, message } from 'antd';
import { ClockCircleOutlined, TagOutlined, TrophyOutlined, DashOutlined, RestOutlined } from '@ant-design/icons';
import { getRecords, deleteRecord, type TypingTestRecord } from '../../../apis/modules/typingtest';

const columns: any = [
 {
 title: '日期',
 dataIndex: 'startTime',
 key: 'startTime',
 width: 150,
 render: (text: number) => {
 const date = new Date(text);
 return date.toLocaleString('zh-CN');
 },
 },
 {
 title: '文章',
 dataIndex: 'articleTitle',
 key: 'articleTitle',
 ellipsis: true,
 },
 {
 title: 'WPM',
 dataIndex: 'wpm',
 key: 'wpm',
 width: 80,
 align: 'center',
 render: (text: number) => (
 <Tag color={text >= 60 ? 'green' : text >= 40 ? 'yellow' : 'red'}>
 {text}
 </Tag>
 ),
 },
 {
 title: '准确率',
 dataIndex: 'accuracy',
 key: 'accuracy',
 width: 100,
 align: 'center',
 render: (text: number) => (
 <span className={text >= 95 ? 'text-green-500' : text >= 85 ? 'text-yellow-500' : 'text-red-500'}>
 {text.toFixed(1)}%
 </span>
 ),
 },
 {
 title: '用时',
 dataIndex: 'testDuration',
 key: 'testDuration',
 width: 80,
 align: 'center',
 render: (text: number) => `${text}秒`,
 },
 {
 title: '字符数',
 dataIndex: 'totalChars',
 key: 'totalChars',
 width: 100,
 align: 'center',
 render: (_: number, record: TypingTestRecord) => (
 <span>{record.correctChars}/{record.totalChars}</span>
 ),
 },
 {
 title: '操作',
 key: 'action',
 width: 80,
 align: 'center',
 render: (_: unknown, record: TypingTestRecord) => (
 <Button
 danger
 icon={<DashOutlined />}
 size="small"
 onClick={() => handleDelete(record.id)}
 >
 删除
 </Button>
 ),
 },
];

const handleDelete = async (id: number) => {
 await deleteRecord(id);
 message.success('删除成功');
 window.location.reload();
};

export default function HistoryPage() {
 const [records, setRecords] = useState<TypingTestRecord[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadRecords();
 }, []);

 const loadRecords = async () => {
 setLoading(true);
 const res = await getRecords();
 if (res.data) {
 setRecords(res.data);
 }
 setLoading(false);
 };

 const handleRefresh = () => {
 loadRecords();
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
 <Card className="max-w-6xl mx-auto shadow-xl">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-800">历史记录</h1>
 <p className="text-gray-500 text-sm mt-1">查看所有打字测试记录</p>
 </div>
 <Button icon={<RestOutlined />} onClick={handleRefresh} loading={loading}>
 刷新
 </Button>
 </div>

 {records.length === 0 ? (
 <Empty description="暂无测试记录" />
 ) : (
 <>
 <div className="grid grid-cols-4 gap-4 mb-6">
 <Card bordered={false} className="text-center">
 <TrophyOutlined className="text-yellow-500 text-3xl mb-2" />
 <div className="text-2xl font-bold text-gray-800">
 {records.length}
 </div>
 <div className="text-gray-500 text-sm">总测试次数</div>
 </Card>
 <Card bordered={false} className="text-center">
 <ClockCircleOutlined className="text-blue-500 text-3xl mb-2" />
 <div className="text-2xl font-bold text-gray-800">
 {Math.round(records.reduce((sum, r) => sum + r.wpm, 0) / records.length) || 0}
 </div>
 <div className="text-gray-500 text-sm">平均WPM</div>
 </Card>
 <Card bordered={false} className="text-center">
 <TagOutlined className="text-green-500 text-3xl mb-2" />
 <div className="text-2xl font-bold text-gray-800">
 {records.reduce((sum, r) => sum + r.accuracy, 0) / records.length > 0
 ? (records.reduce((sum, r) => sum + r.accuracy, 0) / records.length).toFixed(1)
 : 0}
 %
 </div>
 <div className="text-gray-500 text-sm">平均准确率</div>
 </Card>
 <Card bordered={false} className="text-center">
 <TrophyOutlined className="text-red-500 text-3xl mb-2" />
 <div className="text-2xl font-bold text-gray-800">
 {Math.max(...records.map((r) => r.wpm), 0)}
 </div>
 <div className="text-gray-500 text-sm">最高WPM</div>
 </Card>
 </div>

 <Table
 columns={columns}
 dataSource={records}
 rowKey="id"
 loading={loading}
 pagination={{ pageSize: 10 }}
 scroll={{ x: 800 }}
 />
 </>
 )}
 </Card>
 </div>
 );
}
