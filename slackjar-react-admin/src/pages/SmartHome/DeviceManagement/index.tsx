import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Select, Switch, Tag, Card, Row, Col} from 'antd';
import {PlusOutlined, EditOutlined, DashOutlined, PoweroffOutlined} from '@ant-design/icons';
import {
    listDevices,
    saveDevice,
    deleteDevice,
    controlDevice,
    type IotDevice,
    type ControlRequest
} from '../../../apis/modules/smarthome';

const {Option} = Select;

const deviceTypeMap: Record<number, string> = {
    1: '灯光',
    2: '空调',
    3: '窗帘',
    4: '插座',
    5: '传感器',
    6: '门锁'
};

const statusMap: Record<number, string> = {
    0: '离线',
    1: '在线'
};

const powerStatusMap: Record<number, string> = {
    0: '关闭',
    1: '开启'
};

const DeviceManagement: React.FC = () => {
    const [devices, setDevices] = useState<IotDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [editingDevice, setEditingDevice] = useState<IotDevice | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        console.log('DeviceManagement component mounted');
        loadDevices();
    }, []);

    useEffect(() => {
        if (visible) {
            form.resetFields();
        }
    }, [visible]);

    const handleAdd = () => {
        console.log('handleAdd called');
        setEditingDevice(null);
        setVisible(true);
    };

    const loadDevices = async () => {
        setLoading(true);
        try {
            const res = await listDevices();
            console.log('DeviceManagement component loaded devices', res);
            if (res.code === 200) {
                setDevices(res.data || []);
            }
        } catch (error) {
            console.error('加载设备列表失败', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (device: IotDevice) => {
        setEditingDevice(device);
        form.setFieldsValue({
            deviceName: device.deviceName,
            deviceType: device.deviceType,
            deviceCode: device.deviceCode,
            position: device.position,
            roomId: device.roomId
        });
        setVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const device: IotDevice = {
                id: editingDevice?.id || 0,
                ...values,
                status: editingDevice?.status || 0,
                powerStatus: editingDevice?.powerStatus || 0,
                brightness: editingDevice?.brightness || 100,
                temperature: editingDevice?.temperature || 25,
                humidity: editingDevice?.humidity || 50,
                createTime: editingDevice?.createTime || Date.now(),
                updateTime: Date.now()
            };
            await saveDevice(device);
            setVisible(false);
            loadDevices();
        } catch (error) {
            console.error('保存设备失败', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteDevice(id);
            loadDevices();
        } catch (error) {
            console.error('删除设备失败', error);
        }
    };

    const handleControl = async (device: IotDevice, powerStatus: number) => {
        try {
            const request: ControlRequest = {powerStatus};
            await controlDevice(device.id, request);
            loadDevices();
        } catch (error) {
            console.error('控制设备失败', error);
        }
    };

    const columns = [
        {title: '设备名称', dataIndex: 'deviceName', key: 'deviceName'},
        {title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', render: (type: number) => deviceTypeMap[type]},
        {title: '设备编码', dataIndex: 'deviceCode', key: 'deviceCode'},
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{statusMap[status]}</Tag>
            )
        },
        {
            title: '电源状态',
            dataIndex: 'powerStatus',
            key: 'powerStatus',
            render: (status: number) => (
                <Tag color={status === 1 ? 'blue' : 'gray'}>{powerStatusMap[status]}</Tag>
            )
        },
        {title: '温度', dataIndex: 'temperature', key: 'temperature', render: (t: number) => `${t}°C`},
        {title: '湿度', dataIndex: 'humidity', key: 'humidity', render: (h: number) => `${h}%`},
        {title: '位置', dataIndex: 'position', key: 'position'},
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, device: IotDevice) => (
                <>
                    <Button
                        type="text"
                        onClick={() => handleControl(device, device.powerStatus === 1 ? 0 : 1)}
                        icon={<PoweroffOutlined/>}
                    >
                        {device.powerStatus === 1 ? '关闭' : '开启'}
                    </Button>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => handleEdit(device)}>编辑</Button>
                    <Button type="text" danger icon={<DashOutlined/>} onClick={() => handleDelete(device.id)}>删除</Button>
                </>
            )
        }
    ];

    return (
        <Card title="设备管理" extra={<Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>添加设备</Button>}>
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        loading={loading}
                        dataSource={devices}
                        columns={columns}
                        rowKey="id"
                        pagination={{pageSize: 10}}
                    />
                </Col>
            </Row>

            <Modal
                title={editingDevice ? '编辑设备' : '添加设备'}
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={handleSave}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="设备名称" name="deviceName" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="设备类型" name="deviceType" rules={[{required: true}]}>
                        <Select>
                            {Object.entries(deviceTypeMap).map(([key, value]) => (
                                <Option key={key} value={parseInt(key)}>{value}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="设备编码" name="deviceCode" rules={[{required: true}]}>
                        <Input disabled={!!editingDevice}/>
                    </Form.Item>
                    <Form.Item label="位置" name="position">
                        <Input/>
                    </Form.Item>
                    <Form.Item label="所属房间" name="roomId">
                        <Input type="number"/>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default DeviceManagement;