import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Card, Row, Col, Tag, Space, Select} from 'antd';
import {PlusOutlined, EditOutlined, DashOutlined, PlayCircleOutlined, PauseCircleOutlined} from '@ant-design/icons';
import {listTasks, saveTask, deleteTask, startTask, stopTask, listScenes, type ScheduleTask} from '../../../apis/modules/smarthome';

const {Option} = Select;

const taskTypeMap: Record<number, string> = {
    1: '定时执行',
    2: '循环执行',
    3: '倒计时'
};

const ScheduleTaskPage: React.FC = () => {
    const [tasks, setTasks] = useState<ScheduleTask[]>([]);
    const [scenes, setScenes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTasks();
        loadScenes();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const res = await listTasks({});
            if (res.code === 200) {
                setTasks(res.data?.list || []);
            }
        } catch (error) {
            console.error('加载任务列表失败', error);
        } finally {
            setLoading(false);
        }
    };

    const loadScenes = async () => {
        try {
            const res = await listScenes({});
            if (res.code === 200) {
                setScenes(res.data?.list || []);
            }
        } catch (error) {
            console.error('加载场景列表失败', error);
        }
    };

    const handleAdd = () => {
        setEditingTask(null);
        form.resetFields();
        setVisible(true);
    };

    const handleEdit = (task: ScheduleTask) => {
        setEditingTask(task);
        form.setFieldsValue({
            taskName: task.taskName,
            taskType: task.taskType,
            cronExpression: task.cronExpression,
            startTime: task.startTime ? new Date(task.startTime).toISOString().slice(0, 16) : '',
            endTime: task.endTime ? new Date(task.endTime).toISOString().slice(0, 16) : '',
            repeatInterval: task.repeatInterval,
            repeatCount: task.repeatCount,
            targetSceneId: task.targetSceneId,
            status: task.status
        });
        setVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const task: ScheduleTask = {
                id: editingTask?.id || 0,
                taskName: values.taskName,
                taskType: values.taskType,
                cronExpression: values.cronExpression,
                startTime: values.startTime ? new Date(values.startTime).getTime() : 0,
                endTime: values.endTime ? new Date(values.endTime).getTime() : 0,
                repeatInterval: values.repeatInterval || 0,
                repeatCount: values.repeatCount || 0,
                targetSceneId: values.targetSceneId,
                status: editingTask?.status || 0,
                lastRunTime: editingTask?.lastRunTime || 0,
                nextRunTime: editingTask?.nextRunTime || 0,
                createTime: editingTask?.createTime || Date.now(),
                updateTime: Date.now()
            };
            await saveTask(task);
            setVisible(false);
            loadTasks();
        } catch (error) {
            console.error('保存任务失败', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteTask(id);
            loadTasks();
        } catch (error) {
            console.error('删除任务失败', error);
        }
    };

    const handleStart = async (id: number) => {
        try {
            await startTask(id);
            loadTasks();
        } catch (error) {
            console.error('启动任务失败', error);
        }
    };

    const handleStop = async (id: number) => {
        try {
            await stopTask(id);
            loadTasks();
        } catch (error) {
            console.error('停止任务失败', error);
        }
    };

    const columns = [
        {title: '任务名称', dataIndex: 'taskName', key: 'taskName'},
        {title: '任务类型', dataIndex: 'taskType', key: 'taskType', render: (type: number) => taskTypeMap[type]},
        {title: 'Cron表达式', dataIndex: 'cronExpression', key: 'cronExpression'},
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (time: number) => time ? new Date(time).toLocaleString() : '-'
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (time: number) => time ? new Date(time).toLocaleString() : '-'
        },
        {title: '重复间隔(秒)', dataIndex: 'repeatInterval', key: 'repeatInterval'},
        {title: '重复次数', dataIndex: 'repeatCount', key: 'repeatCount'},
        {title: '关联场景', dataIndex: 'targetSceneId', key: 'targetSceneId', render: (id: number) => scenes.find(s => s.id === id)?.sceneName || '-'},
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '运行中' : '已停止'}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, task: ScheduleTask) => (
                <Space>
                    {task.status === 0 ? (
                        <Button type="text" icon={<PlayCircleOutlined/>} onClick={() => handleStart(task.id)}>启动</Button>
                    ) : (
                        <Button type="text" icon={<PauseCircleOutlined/>} onClick={() => handleStop(task.id)}>停止</Button>
                    )}
                    <Button type="text" icon={<EditOutlined/>} onClick={() => handleEdit(task)}>编辑</Button>
                    <Button type="text" danger icon={<DashOutlined/>} onClick={() => handleDelete(task.id)}>删除</Button>
                </Space>
            )
        }
    ];

    return (
        <Card title="定时任务" extra={<Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>添加任务</Button>}>
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        loading={loading}
                        dataSource={tasks}
                        columns={columns}
                        rowKey="id"
                        pagination={{pageSize: 10}}
                    />
                </Col>
            </Row>

            <Modal
                title={editingTask ? '编辑任务' : '添加任务'}
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={handleSave}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="任务名称" name="taskName" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="任务类型" name="taskType" rules={[{required: true}]}>
                        <Select>
                            {Object.entries(taskTypeMap).map(([key, value]) => (
                                <Option key={key} value={parseInt(key)}>{value}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Cron表达式" name="cronExpression">
                        <Input placeholder="如: 0 0 8 * * ?"/>
                    </Form.Item>
                    <Form.Item label="开始时间" name="startTime">
                        <Input type="datetime-local"/>
                    </Form.Item>
                    <Form.Item label="结束时间" name="endTime">
                        <Input type="datetime-local"/>
                    </Form.Item>
                    <Form.Item label="重复间隔(秒)" name="repeatInterval">
                        <Input type="number"/>
                    </Form.Item>
                    <Form.Item label="重复次数" name="repeatCount">
                        <Input type="number"/>
                    </Form.Item>
                    <Form.Item label="关联场景" name="targetSceneId">
                        <Select>
                            <Option value={0}>选择场景</Option>
                            {scenes.map(s => (
                                <Option key={s.id} value={s.id}>{s.sceneName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ScheduleTaskPage;