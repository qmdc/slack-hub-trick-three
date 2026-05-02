import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Card, Row, Col, Tag, Space, Select, Slider} from 'antd';
import {PlusOutlined, EditOutlined, DashOutlined, CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';
import {listRules, saveRule, deleteRule, enableRule, disableRule, listDevices, type LinkageRule} from '../../../apis/modules/smarthome';

const {Option} = Select;

const conditionTypeMap: Record<string, string> = {
    power_status: '电源状态',
    temperature: '温度',
    humidity: '湿度'
};

const operatorMap: Record<string, string> = {
    '>': '大于',
    '<': '小于',
    '>=': '大于等于',
    '<=': '小于等于',
    '==': '等于'
};

const LinkageRulePage: React.FC = () => {
    const [rules, setRules] = useState<LinkageRule[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [editingRule, setEditingRule] = useState<LinkageRule | null>(null);
    const [form] = Form.useForm();
    const [triggerDeviceId, setTriggerDeviceId] = useState(0);
    const [actionDeviceId, setActionDeviceId] = useState(0);
    const [conditionType, setConditionType] = useState('power_status');
    const [operator, setOperator] = useState('==');
    const [conditionValue, setConditionValue] = useState(0);
    const [actionPowerStatus, setActionPowerStatus] = useState(1);
    const [actionBrightness, setActionBrightness] = useState(100);
    const [actionTemperature, setActionTemperature] = useState(25);

    useEffect(() => {
        loadRules();
        loadDevices();
    }, []);

    const loadRules = async () => {
        setLoading(true);
        try {
            const res = await listRules({});
            if (res.code === 200) {
                setRules(res.data?.list || []);
            }
        } catch (error) {
            console.error('加载规则列表失败', error);
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

    const handleAdd = () => {
        setEditingRule(null);
        form.resetFields();
        setTriggerDeviceId(0);
        setActionDeviceId(0);
        setConditionType('power_status');
        setOperator('==');
        setConditionValue(1);
        setActionPowerStatus(1);
        setActionBrightness(100);
        setActionTemperature(25);
        setVisible(true);
    };

    const handleEdit = (rule: LinkageRule) => {
        setEditingRule(rule);
        setTriggerDeviceId(rule.triggerDeviceId);
        setActionDeviceId(rule.actionDeviceId);
        
        const condition = rule.triggerCondition ? JSON.parse(rule.triggerCondition) : {};
        setConditionType(condition.type || 'power_status');
        setOperator(condition.operator || '==');
        setConditionValue(condition.value || 1);
        
        const actionParams = rule.actionParams ? JSON.parse(rule.actionParams) : {};
        setActionPowerStatus(actionParams.powerStatus || 1);
        setActionBrightness(actionParams.brightness || 100);
        setActionTemperature(actionParams.temperature || 25);
        
        form.setFieldsValue({
            ruleName: rule.ruleName,
            ruleDescription: rule.ruleDescription,
            priority: rule.priority,
            status: rule.status
        });
        setVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const rule: LinkageRule = {
                id: editingRule?.id || 0,
                ruleName: values.ruleName,
                ruleDescription: values.ruleDescription,
                triggerDeviceId: triggerDeviceId,
                triggerCondition: JSON.stringify({type: conditionType, operator, value: conditionValue}),
                actionDeviceId: actionDeviceId,
                actionParams: JSON.stringify({powerStatus: actionPowerStatus, brightness: actionBrightness, temperature: actionTemperature}),
                status: editingRule?.status || 1,
                priority: values.priority || 5,
                createTime: editingRule?.createTime || Date.now(),
                updateTime: Date.now()
            };
            await saveRule(rule);
            setVisible(false);
            loadRules();
        } catch (error) {
            console.error('保存规则失败', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteRule(id);
            loadRules();
        } catch (error) {
            console.error('删除规则失败', error);
        }
    };

    const handleEnable = async (id: number) => {
        try {
            await enableRule(id);
            loadRules();
        } catch (error) {
            console.error('启用规则失败', error);
        }
    };

    const handleDisable = async (id: number) => {
        try {
            await disableRule(id);
            loadRules();
        } catch (error) {
            console.error('禁用规则失败', error);
        }
    };

    const getDeviceName = (id: number) => devices.find(d => d.id === id)?.deviceName || '-';

    const columns = [
        {title: '规则名称', dataIndex: 'ruleName', key: 'ruleName'},
        {title: '触发设备', dataIndex: 'triggerDeviceId', key: 'triggerDeviceId', render: getDeviceName},
        {title: '触发条件', dataIndex: 'triggerCondition', key: 'triggerCondition', render: (c: string) => {
            const cond = JSON.parse(c || '{}');
            return `${conditionTypeMap[cond.type]} ${operatorMap[cond.operator] || cond.operator} ${cond.value}`;
        }},
        {title: '动作设备', dataIndex: 'actionDeviceId', key: 'actionDeviceId', render: getDeviceName},
        {title: '动作参数', dataIndex: 'actionParams', key: 'actionParams', render: (p: string) => {
            const params = JSON.parse(p || '{}');
            return `电源:${params.powerStatus === 1 ? '开' : '关'}, 亮度:${params.brightness}%, 温度:${params.temperature}°C`;
        }},
        {title: '优先级', dataIndex: 'priority', key: 'priority'},
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '启用' : '禁用'}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, rule: LinkageRule) => (
                <Space>
                    {rule.status === 0 ? (
                        <Button type="text" icon={<CheckCircleOutlined/>} onClick={() => handleEnable(rule.id)}>启用</Button>
                    ) : (
                        <Button type="text" icon={<CloseCircleOutlined/>} onClick={() => handleDisable(rule.id)}>禁用</Button>
                    )}
                    <Button type="text" icon={<EditOutlined/>} onClick={() => handleEdit(rule)}>编辑</Button>
                    <Button type="text" danger icon={<DashOutlined/>} onClick={() => handleDelete(rule.id)}>删除</Button>
                </Space>
            )
        }
    ];

    return (
        <Card title="联动规则" extra={<Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>添加规则</Button>}>
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        loading={loading}
                        dataSource={rules}
                        columns={columns}
                        rowKey="id"
                        pagination={{pageSize: 10}}
                    />
                </Col>
            </Row>

            <Modal
                title={editingRule ? '编辑规则' : '添加规则'}
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={handleSave}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="规则名称" name="ruleName" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="规则描述" name="ruleDescription">
                        <Input.TextArea rows={2}/>
                    </Form.Item>
                    <Form.Item label="优先级" name="priority">
                        <Slider min={1} max={10} defaultValue={5}/>
                    </Form.Item>

                    <div style={{marginBottom: 16, padding: 12, border: '1px solid #e8e8e8', borderRadius: 4}}>
                        <h4 style={{marginBottom: 12}}>触发条件</h4>
                        <Row gutter={12}>
                            <Col span={12}>
                                <label>触发设备</label>
                                <Select value={triggerDeviceId} onChange={setTriggerDeviceId} style={{width: '100%'}}>
                                    <Option value={0}>选择设备</Option>
                                    {devices.map(d => (
                                        <Option key={d.id} value={d.id}>{d.deviceName}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={12}>
                                <label>条件类型</label>
                                <Select value={conditionType} onChange={setConditionType} style={{width: '100%'}}>
                                    {Object.entries(conditionTypeMap).map(([key, value]) => (
                                        <Option key={key} value={key}>{value}</Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                        {conditionType !== 'power_status' && (
                            <Row gutter={12} style={{marginTop: 12}}>
                                <Col span={12}>
                                    <label>运算符</label>
                                    <Select value={operator} onChange={setOperator} style={{width: '100%'}}>
                                        {Object.entries(operatorMap).map(([key, value]) => (
                                            <Option key={key} value={key}>{value}</Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <label>目标值</label>
                                    <Input type="number" value={conditionValue} onChange={(e) => setConditionValue(Number(e.target.value))}/>
                                </Col>
                            </Row>
                        )}
                        {conditionType === 'power_status' && (
                            <Row gutter={12} style={{marginTop: 12}}>
                                <Col span={12}>
                                    <label>目标状态</label>
                                    <Select value={conditionValue} onChange={setConditionValue} style={{width: '100%'}}>
                                        <Option value={1}>开启</Option>
                                        <Option value={0}>关闭</Option>
                                    </Select>
                                </Col>
                            </Row>
                        )}
                    </div>

                    <div style={{padding: 12, border: '1px solid #e8e8e8', borderRadius: 4}}>
                        <h4 style={{marginBottom: 12}}>执行动作</h4>
                        <Row gutter={12}>
                            <Col span={12}>
                                <label>动作设备</label>
                                <Select value={actionDeviceId} onChange={setActionDeviceId} style={{width: '100%'}}>
                                    <Option value={0}>选择设备</Option>
                                    {devices.map(d => (
                                        <Option key={d.id} value={d.id}>{d.deviceName}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={12}>
                                <label>电源状态</label>
                                <Select value={actionPowerStatus} onChange={setActionPowerStatus} style={{width: '100%'}}>
                                    <Option value={1}>开启</Option>
                                    <Option value={0}>关闭</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row gutter={12} style={{marginTop: 12}}>
                            <Col span={12}>
                                <label>亮度: {actionBrightness}%</label>
                                <Slider min={0} max={100} value={actionBrightness} onChange={setActionBrightness}/>
                            </Col>
                            <Col span={12}>
                                <label>温度: {actionTemperature}°C</label>
                                <Slider min={16} max={32} value={actionTemperature} onChange={setActionTemperature}/>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Modal>
        </Card>
    );
};

export default LinkageRulePage;