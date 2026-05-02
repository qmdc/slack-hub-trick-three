import React, {useState, useEffect} from 'react';
import {Card, Row, Col, Statistic, Progress, Tag, List, Button, Select} from 'antd';
import {WarningOutlined, DingdingOutlined, MinusOutlined, BulbOutlined, ApiOutlined} from '@ant-design/icons';
import {getEnergyAnalysis, getEnergySuggestions, getDailyEnergy, getWeeklyEnergy, getMonthlyEnergy, listDevices} from '../../../apis/modules/smarthome';
import type {EnergyAnalysisItem, EnergySuggestion} from '../../../apis/modules/smarthome';

const {Option} = Select;

const suggestionTypeMap: Record<string, {color: string, label: string}> = {
    high: {color: 'red', label: '高优先级'},
    medium: {color: 'orange', label: '中优先级'},
    low: {color: 'blue', label: '低优先级'}
};

const EnergyAnalysisPage: React.FC = () => {
    const [analysis, setAnalysis] = useState<EnergyAnalysisItem[]>([]);
    const [suggestions, setSuggestions] = useState<EnergySuggestion[]>([]);
    const [dailyData, setDailyData] = useState<Record<string, number>>({});
    const [weeklyData, setWeeklyData] = useState<Record<string, number>>({});
    const [selectedDevice, setSelectedDevice] = useState(1);
    const [devices, setDevices] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [selectedDevice]);

    const loadData = async () => {
        try {
            const [analysisRes, suggestionsRes, dailyRes, weeklyRes, devicesRes] = await Promise.all([
                getEnergyAnalysis(),
                getEnergySuggestions(),
                getDailyEnergy(selectedDevice),
                getWeeklyEnergy(selectedDevice),
                listDevices()
            ]);
            if (analysisRes.code === 200) setAnalysis(analysisRes.data || []);
            if (suggestionsRes.code === 200) setSuggestions(suggestionsRes.data || []);
            if (dailyRes.code === 200) setDailyData(dailyRes.data || {});
            if (weeklyRes.code === 200) setWeeklyData(weeklyRes.data || {});
            if (devicesRes.code === 200) setDevices(devicesRes.data || []);
        } catch (error) {
            console.error('加载能耗数据失败', error);
        }
    };

    const totalEnergy = analysis.reduce((sum, item) => sum + item.totalEnergy, 0);
    const avgDaily = analysis.reduce((sum, item) => sum + item.avgDaily, 0) / analysis.length || 0;

    const maxDailyValue = Math.max(...Object.values(dailyData), 1);
    const maxWeeklyValue = Math.max(...Object.values(weeklyData), 1);

    return (
        <div>
            <Card title="能耗统计分析" extra={
                <Select value={selectedDevice} onChange={setSelectedDevice} style={{width: 200}}>
                    {devices.map(d => (
                        <Option key={d.id} value={d.id}>{d.deviceName}</Option>
                    ))}
                </Select>
            }>
                <Row gutter={16} style={{marginBottom: 24}}>
                    <Col span={8}>
                        <Card>
                            <Statistic title="本月总能耗" value={totalEnergy.toFixed(1)} suffix="度"/>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic title="日均能耗" value={avgDaily.toFixed(2)} suffix="度/天"/>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic title="设备数量" value={analysis.length} suffix="台"/>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} style={{marginBottom: 24}}>
                    <Col span={12}>
                        <Card title="今日能耗趋势">
                            <div style={{display: 'flex', alignItems: 'end', height: 200, gap: 4}}>
                                {Object.entries(dailyData).map(([hour, value]) => (
                                    <div key={hour} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <div style={{width: '100%', backgroundColor: '#1890ff', transition: 'height 0.3s', height: `${(value / maxDailyValue) * 150}px`}}/>
                                        <span style={{fontSize: 10, marginTop: 4}}>{hour}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="本周能耗趋势">
                            <div style={{display: 'flex', alignItems: 'end', height: 200, gap: 8}}>
                                {Object.entries(weeklyData).map(([day, value]) => (
                                    <div key={day} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <div style={{width: '80%', backgroundColor: '#52c41a', transition: 'height 0.3s', height: `${(value / maxWeeklyValue) * 150}px`}}/>
                                        <span style={{fontSize: 12, marginTop: 4}}>{day}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} style={{marginBottom: 24}}>
                    <Col span={12}>
                        <Card title="设备能耗排行">
                            <List
                                dataSource={analysis}
                                renderItem={(item, index) => (
                                    <List.Item style={{display: 'flex', alignItems: 'center'}}>
                                        <span style={{width: 24, textAlign: 'center', fontWeight: 'bold'}}>{index + 1}</span>
                                        <span style={{flex: 1, marginLeft: 12}}>{item.deviceName}</span>
                                        <span style={{width: 80, textAlign: 'right'}}>{item.totalEnergy.toFixed(1)}度</span>
                                        <Progress percent={(item.totalEnergy / totalEnergy * 100).toFixed(0) as unknown as number} size="small" style={{width: 80}}/>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="设备能耗趋势">
                            <List
                                dataSource={analysis}
                                renderItem={(item) => (
                                    <List.Item style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <span>{item.deviceName}</span>
                                        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                            {item.trend === 'up' && <WarningOutlined style={{color: 'red'}}/>}
                                            {item.trend === 'down' && <DingdingOutlined style={{color: 'green'}}/>}
                                            {item.trend === 'stable' && <MinusOutlined style={{color: 'gray'}}/>}
                                            <span>{item.trend === 'up' ? '上升' : item.trend === 'down' ? '下降' : '稳定'}</span>
                                        </span>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="节能建议" extra={<Button type="primary" icon={<BulbOutlined/>}>应用所有建议</Button>}>
                    <List
                        dataSource={suggestions}
                        renderItem={(item) => (
                            <List.Item style={{padding: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 8}}>
                                <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
                                    <div style={{width: 40, height: 40, borderRadius: 8, backgroundColor: '#fffbe6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <ApiOutlined style={{fontSize: 20, color: '#faad14'}}/>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
                                            <span style={{fontWeight: 'bold'}}>{item.title}</span>
                                            <Tag color={suggestionTypeMap[item.type].color}>{suggestionTypeMap[item.type].label}</Tag>
                                        </div>
                                        <p style={{color: '#666', fontSize: 14}}>{item.description}</p>
                                        <div style={{marginTop: 8}}>
                                            <Tag color="green">预计节省 {item.estimatedSavings}</Tag>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </Card>
        </div>
    );
};

export default EnergyAnalysisPage;