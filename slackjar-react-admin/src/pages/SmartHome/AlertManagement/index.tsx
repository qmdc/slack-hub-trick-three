import React, {useState, useEffect} from 'react';
import {Table, Button, Card, Row, Col, Tag, Space, Select, Input} from 'antd';
import {BellOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined} from '@ant-design/icons';
import {listAlerts, handleAlert, listDevices, type AlertRecord} from '../../../apis/modules/smarthome';

const {Option} = Select;

const alertTypeMap: Record<number, {label: string, color: string}> = {
    1: {label: '设备离线', color: 'red'},
    2: {label: '设备故障', color: 'red'},
    3: {label: '电量异常', color: 'orange'},
    4: {label: '温湿度异常', color: 'orange'},
    5: {label: '安全告警', color: 'red'}
};

const alertLevelMap: Record<number, {label: string, color: string}> = {
    1: {label: '紧急', color: 'red'},
    2: {label: '重要', color: 'orange'},
    3: {label: '普通', color: 'blue'}
};

const statusMap: Record<number, {label: string, color: string}> = {
    0: {label: '未处理', color: 'red'},
    1: {label: '已处理', color: 'green'},
    2: {label: '已忽略', color: 'gray'}
};

const AlertManagementPage: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertRecord[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<number | undefined>();
    const [filterLevel, setFilterLevel] = useState<number | undefined>();
    const [filterStatus, setFilterStatus] = useState<number | undefined>();
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        loadAlerts();
        loadDevices();
    }, [filterType, filterLevel, filterStatus, searchKeyword]);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const res = await listAlerts({
                alertType: filterType,
                status: filterStatus
            });
            if (res.code === 200) {
                let data = res.data?.list || [];
                if (filterLevel) {
                    data = data.filter((a: AlertRecord) => a.alertLevel === filterLevel);
                }
                if (searchKeyword) {
                    data = data.filter((a: AlertRecord) => a.alertMessage.includes(searchKeyword));
                }
                setAlerts(data);
            }
        } catch (error) {
            console.error('加载告警列表失败', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDevices = async () => {
        try {
            const res = await listDevices();
            if (res.code === 200) {
                setDevices(res.data || []);
            }
        } catch (error) {
            console.error('加载设备列表失败', error);
        }
    };

    const handleAlertStatus = async (id: number, status: number) => {
        try {
            await handleAlert(id, status);
            loadAlerts();
        } catch (error) {
            console.error('处理告警失败', error);
        }
    };

    const getDeviceName = (id: number) => devices.find(d => d.id === id)?.deviceName || '-';

    const columns = [
        {
            title: '告警类型',
            dataIndex: 'alertType',
            key: 'alertType',
            render: (type: number) => (
                <Tag color={alertTypeMap[type]?.color || 'gray'}>{alertTypeMap[type]?.label || '未知'}</Tag>
            )
        },
        {
            title: '告警级别',
            dataIndex: 'alertLevel',
            key: 'alertLevel',
            render: (level: number) => (
                <Tag color={alertLevelMap[level]?.color || 'gray'}>{alertLevelMap[level]?.label || '未知'}</Tag>
            )
        },
        {title: '关联设备', dataIndex: 'deviceId', key: 'deviceId', render: getDeviceName},
        {title: '告警消息', dataIndex: 'alertMessage', key: 'alertMessage'},
        {
            title: '告警时间',
            dataIndex: 'alertTime',
            key: 'alertTime',
            render: (time: number) => new Date(time).toLocaleString()
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={statusMap[status]?.color || 'gray'}>{statusMap[status]?.label || '未知'}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, alert: AlertRecord) => (
                <Space>
                    {alert.status === 0 && (
                        <>
                            <Button type="text" icon={<CheckCircleOutlined/>} onClick={() => handleAlertStatus(alert.id, 1)}>处理</Button>
                            <Button type="text" icon={<ClockCircleOutlined/>} onClick={() => handleAlertStatus(alert.id, 2)}>忽略</Button>
                        </>
                    )}
                    {alert.status === 1 && <span style={{color: '#52c41a'}}>已处理</span>}
                    {alert.status === 2 && <span style={{color: '#999'}}>已忽略</span>}
                </Space>
            )
        }
    ];

    const unhandledCount = alerts.filter(a => a.status === 0).length;
    const urgentCount = alerts.filter(a => a.alertLevel === 1 && a.status === 0).length;

    return (
        <Card title="告警管理" extra={
            <div style={{display: 'flex', gap: 16}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <WarningOutlined style={{color: 'red'}}/>
                    <span>紧急告警: {urgentCount}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <BellOutlined style={{color: 'orange'}}/>
                    <span>未处理: {unhandledCount}</span>
                </div>
            </div>
        }>
            <Row gutter={16} style={{marginBottom: 16}}>
                <Col span={6}>
                    <Select placeholder="告警类型" allowClear value={filterType} onChange={setFilterType} style={{width: '100%'}}>
                        {Object.entries(alertTypeMap).map(([key, value]) => (
                            <Option key={key} value={parseInt(key)}>{value.label}</Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <Select placeholder="告警级别" allowClear value={filterLevel} onChange={setFilterLevel} style={{width: '100%'}}>
                        {Object.entries(alertLevelMap).map(([key, value]) => (
                            <Option key={key} value={parseInt(key)}>{value.label}</Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <Select placeholder="处理状态" allowClear value={filterStatus} onChange={setFilterStatus} style={{width: '100%'}}>
                        {Object.entries(statusMap).map(([key, value]) => (
                            <Option key={key} value={parseInt(key)}>{value.label}</Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <Input.Search placeholder="搜索告警消息" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}/>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        loading={loading}
                        dataSource={alerts}
                        columns={columns}
                        rowKey="id"
                        pagination={{pageSize: 10}}
                    />
                </Col>
            </Row>
        </Card>
    );
};

export default AlertManagementPage;