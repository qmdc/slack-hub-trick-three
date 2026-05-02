import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Card, Row, Col, Tag, Space, Select, Switch} from 'antd';
import {PlusOutlined, EditOutlined, DashOutlined, PlayCircleOutlined} from '@ant-design/icons';
import {listScenes, saveScene, deleteScene, executeScene, listDevices, type Scene, type SceneSaveRequest} from '../../../apis/modules/smarthome';

const {Option} = Select;

const triggerTypeMap: Record<number, string> = {
    1: '定时触发',
    2: '设备状态变化',
    3: '传感器触发',
    4: '手动触发'
};

const actionTypeMap: Record<number, string> = {
    1: '设备控制',
    2: '发送通知',
    3: '执行脚本'
};

const SceneEditor: React.FC = () => {
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [editingScene, setEditingScene] = useState<Scene | null>(null);
    const [form] = Form.useForm();
    const [triggers, setTriggers] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);

    useEffect(() => {
        loadScenes();
        loadDevices();
    }, []);

    const loadScenes = async () => {
        setLoading(true);
        try {
            const res = await listScenes({});
            if (res.code === 200) {
                setScenes(res.data?.list || []);
            }
        } catch (error) {
            console.error('加载场景列表失败', error);
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
        setEditingScene(null);
        form.resetFields();
        setTriggers([]);
        setActions([]);
        setVisible(true);
    };

    const handleEdit = (scene: Scene) => {
        setEditingScene(scene);
        form.setFieldsValue({
            sceneName: scene.sceneName,
            description: scene.description,
            icon: scene.icon,
            status: scene.status,
            isDefault: scene.isDefault
        });
        setTriggers([]);
        setActions([]);
        setVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const request: SceneSaveRequest = {
                id: editingScene?.id,
                sceneName: values.sceneName,
                description: values.description,
                icon: values.icon,
                status: values.status,
                isDefault: values.isDefault,
                triggers: triggers.map(t => ({
                    triggerType: t.triggerType,
                    triggerCondition: JSON.stringify(t.condition)
                })),
                actions: actions.map(a => ({
                    actionType: a.actionType,
                    targetDeviceId: a.deviceId,
                    actionParams: JSON.stringify(a.params),
                    actionDelay: a.delay
                }))
            };
            await saveScene(request);
            setVisible(false);
            loadScenes();
        } catch (error) {
            console.error('保存场景失败', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteScene(id);
            loadScenes();
        } catch (error) {
            console.error('删除场景失败', error);
        }
    };

    const handleExecute = async (id: number) => {
        try {
            await executeScene(id);
        } catch (error) {
            console.error('执行场景失败', error);
        }
    };

    const addTrigger = () => {
        setTriggers([...triggers, {triggerType: 1, condition: {}}]);
    };

    const removeTrigger = (index: number) => {
        setTriggers(triggers.filter((_, i) => i !== index));
    };

    const updateTrigger = (index: number, field: string, value: any) => {
        const newTriggers = [...triggers];
        if (field === 'triggerType') {
            newTriggers[index] = {triggerType: value, condition: {}};
        } else {
            newTriggers[index] = {...newTriggers[index], condition: {...newTriggers[index].condition, [field]: value}};
        }
        setTriggers(newTriggers);
    };

    const addAction = () => {
        setActions([...actions, {actionType: 1, deviceId: 0, params: {}, delay: 0}]);
    };

    const removeAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const updateAction = (index: number, field: string, value: any) => {
        const newActions = [...actions];
        if (field === 'actionType' || field === 'deviceId' || field === 'delay') {
            newActions[index] = {...newActions[index], [field]: value};
        } else {
            newActions[index] = {...newActions[index], params: {...newActions[index].params, [field]: value}};
        }
        setActions(newActions);
    };

    const columns = [
        {title: '场景名称', dataIndex: 'sceneName', key: 'sceneName'},
        {title: '描述', dataIndex: 'description', key: 'description'},
        {title: '图标', dataIndex: 'icon', key: 'icon'},
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '启用' : '禁用'}</Tag>
            )
        },
        {
            title: '默认场景',
            dataIndex: 'isDefault',
            key: 'isDefault',
            render: (isDefault: number) => (isDefault === 1 ? '是' : '否')
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, scene: Scene) => (
                <Space>
                    <Button type="text" icon={<PlayCircleOutlined/>} onClick={() => handleExecute(scene.id)}>执行</Button>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => handleEdit(scene)}>编辑</Button>
                    <Button type="text" danger icon={<DashOutlined/>} onClick={() => handleDelete(scene.id)}>删除</Button>
                </Space>
            )
        }
    ];

    return (
        <Card title="场景编辑器" extra={<Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>创建场景</Button>}>
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        loading={loading}
                        dataSource={scenes}
                        columns={columns}
                        rowKey="id"
                        pagination={{pageSize: 10}}
                    />
                </Col>
            </Row>

            <Modal
                title={editingScene ? '编辑场景' : '创建场景'}
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={handleSave}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="场景名称" name="sceneName" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea rows={2}/>
                    </Form.Item>
                    <Form.Item label="图标" name="icon">
                        <Input/>
                    </Form.Item>
                    <Form.Item label="状态" name="status">
                        <Select defaultValue={1}>
                            <Option value={1}>启用</Option>
                            <Option value={0}>禁用</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="默认场景" name="isDefault">
                        <Select defaultValue={0}>
                            <Option value={0}>否</Option>
                            <Option value={1}>是</Option>
                        </Select>
                    </Form.Item>

                    <div style={{marginBottom: 16}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                            <span style={{fontWeight: 'bold'}}>触发条件（如果）</span>
                            <Button type="dashed" size="small" icon={<PlusOutlined/>} onClick={addTrigger}>添加</Button>
                        </div>
                        {triggers.map((trigger, index) => (
                            <div key={index} style={{marginBottom: 8, padding: 8, border: '1px dashed #d9d9d9'}}>
                                <Row gutter={8}>
                                    <Col span={8}>
                                        <Select
                                            value={trigger.triggerType}
                                            onChange={(v) => updateTrigger(index, 'triggerType', v)}
                                            style={{width: '100%'}}
                                        >
                                            {Object.entries(triggerTypeMap).map(([key, value]) => (
                                                <Option key={key} value={parseInt(key)}>{value}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={12}>
                                        <Input
                                            placeholder="触发条件参数"
                                            value={JSON.stringify(trigger.condition)}
                                            onChange={(e) => updateTrigger(index, 'condition', JSON.parse(e.target.value || '{}'))}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Button danger onClick={() => removeTrigger(index)}>删除</Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                            <span style={{fontWeight: 'bold'}}>执行动作（就）</span>
                            <Button type="dashed" size="small" icon={<PlusOutlined/>} onClick={addAction}>添加</Button>
                        </div>
                        {actions.map((action, index) => (
                            <div key={index} style={{marginBottom: 8, padding: 8, border: '1px dashed #d9d9d9'}}>
                                <Row gutter={8}>
                                    <Col span={6}>
                                        <Select
                                            value={action.actionType}
                                            onChange={(v) => updateAction(index, 'actionType', v)}
                                            style={{width: '100%'}}
                                        >
                                            {Object.entries(actionTypeMap).map(([key, value]) => (
                                                <Option key={key} value={parseInt(key)}>{value}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            value={action.deviceId}
                                            onChange={(v) => updateAction(index, 'deviceId', v)}
                                            style={{width: '100%'}}
                                        >
                                            <Option value={0}>选择设备</Option>
                                            {devices.map(d => (
                                                <Option key={d.id} value={d.id}>{d.deviceName}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={8}>
                                        <Input
                                            placeholder="动作参数"
                                            value={JSON.stringify(action.params)}
                                            onChange={(e) => updateAction(index, 'params', JSON.parse(e.target.value || '{}'))}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Button danger onClick={() => removeAction(index)}>删除</Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </div>
                </Form>
            </Modal>
        </Card>
    );
};

export default SceneEditor;