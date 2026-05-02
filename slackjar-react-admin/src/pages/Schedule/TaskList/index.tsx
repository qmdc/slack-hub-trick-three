import React, {useState, useEffect, useCallback} from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    message,
    Tag,
    Popconfirm,
    Card,
    Tabs,
    Badge,
    Dropdown,
    MenuProps,
    Empty,
    Space
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    MoreOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs, {Dayjs} from 'dayjs'
import {
    pageQueryTasks,
    saveTask,
    deleteTask,
    updateTaskStatus,
    getPendingTasks,
    ScheduleTask,
    TaskPriorityLabels,
    TaskPriorityEnum
} from '../../../apis/modules/schedule'
import styles from './index.module.scss'

const QUADRANT_CONFIG = [
    {
        priority: TaskPriorityEnum.IMPORTANT_URGENT,
        title: '重要且紧急',
        color: TaskPriorityLabels[TaskPriorityEnum.IMPORTANT_URGENT].color,
        bgColor: '#fff1f0',
        description: '立即处理'
    },
    {
        priority: TaskPriorityEnum.IMPORTANT_NOT_URGENT,
        title: '重要不紧急',
        color: TaskPriorityLabels[TaskPriorityEnum.IMPORTANT_NOT_URGENT].color,
        bgColor: '#fffbe6',
        description: '计划安排'
    },
    {
        priority: TaskPriorityEnum.NOT_IMPORTANT_URGENT,
        title: '不重要但紧急',
        color: TaskPriorityLabels[TaskPriorityEnum.NOT_IMPORTANT_URGENT].color,
        bgColor: '#e6f7ff',
        description: '授权或快速处理'
    },
    {
        priority: TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT,
        title: '不重要不紧急',
        color: TaskPriorityLabels[TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT].color,
        bgColor: '#f5f5f5',
        description: '考虑删除或延迟'
    }
]

const TASK_STATUS = {
    PENDING: 0,
    IN_PROGRESS: 1,
    COMPLETED: 2
}

const TASK_STATUS_LABELS: Record<number, string> = {
    [TASK_STATUS.PENDING]: '待办',
    [TASK_STATUS.IN_PROGRESS]: '进行中',
    [TASK_STATUS.COMPLETED]: '已完成'
}

interface TaskGroup {
    priority: number
    tasks: ScheduleTask[]
}

const TaskList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('quadrant')
    const [tasks, setTasks] = useState<ScheduleTask[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null)
    const [form] = Form.useForm()

    const loadTasks = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getPendingTasks()
            if (res.data) {
                setTasks(res.data)
            }
        } catch (error) {
            message.error('加载任务失败')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTasks()
    }, [loadTasks])

    const groupTasksByPriority = useCallback((taskList: ScheduleTask[]): TaskGroup[] => {
        const groups: TaskGroup[] = QUADRANT_CONFIG.map(q => ({
            priority: q.priority,
            tasks: []
        }))

        taskList.forEach(task => {
            const priority = task.priority || TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT
            const group = groups.find(g => g.priority === priority)
            if (group) {
                group.tasks.push(task)
            }
        })

        return groups
    }, [])

    const getStatusBadge = (status: number) => {
        switch (status) {
            case TASK_STATUS.PENDING:
                return <Badge status="default" text={TASK_STATUS_LABELS[status]}/>
            case TASK_STATUS.IN_PROGRESS:
                return <Badge status="processing" text={TASK_STATUS_LABELS[status]}/>
            case TASK_STATUS.COMPLETED:
                return <Badge status="success" text={TASK_STATUS_LABELS[status]}/>
            default:
                return <Badge status="default" text="未知"/>
        }
    }

    const handleCreate = () => {
        form.setFieldsValue({
            title: '',
            description: '',
            priority: TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT,
            status: TASK_STATUS.PENDING,
            estimatedMinutes: 30
        })
        setEditingTask(null)
        setModalVisible(true)
    }

    const handleEdit = (task: ScheduleTask) => {
        form.setFieldsValue({
            title: task.title,
            description: task.description,
            priority: task.priority || TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT,
            status: task.status,
            estimatedMinutes: task.estimatedMinutes || 30,
            dueTime: task.dueTime ? dayjs(task.dueTime) : undefined
        })
        setEditingTask(task)
        setModalVisible(true)
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteTask(id)
            message.success('任务已删除')
            loadTasks()
        } catch (error) {
            message.error('删除失败')
        }
    }

    const handleStatusChange = async (id: number, status: number) => {
        try {
            await updateTaskStatus(id, status)
            message.success('状态已更新')
            loadTasks()
        } catch (error) {
            message.error('更新状态失败')
        }
    }

    const handleSave = async (values: any) => {
        try {
            const data = {
                ...(editingTask ? {id: editingTask.id} : {}),
                title: values.title,
                description: values.description,
                priority: values.priority,
                status: values.status,
                estimatedMinutes: values.estimatedMinutes,
                dueTime: values.dueTime ? values.dueTime.valueOf() : undefined
            }

            await saveTask(data)
            message.success(editingTask ? '任务已更新' : '任务已创建')
            setModalVisible(false)
            form.resetFields()
            loadTasks()
        } catch (error) {
            message.error('保存失败')
        }
    }

    const getTaskMenu = (task: ScheduleTask): MenuProps => {
        return {
            items: [
                {
                    key: 'edit',
                    icon: <EditOutlined/>,
                    label: '编辑',
                    onClick: () => handleEdit(task)
                },
                {
                    key: 'complete',
                    icon: <CheckCircleOutlined/>,
                    label: '标记完成',
                    onClick: () => handleStatusChange(task.id, TASK_STATUS.COMPLETED),
                    disabled: task.status === TASK_STATUS.COMPLETED
                },
                {
                    key: 'inProgress',
                    icon: <ClockCircleOutlined/>,
                    label: '开始执行',
                    onClick: () => handleStatusChange(task.id, TASK_STATUS.IN_PROGRESS),
                    disabled: task.status === TASK_STATUS.IN_PROGRESS
                },
                {
                    type: 'divider'
                },
                {
                    key: 'delete',
                    icon: <DeleteOutlined/>,
                    label: '删除',
                    danger: true
                }
            ],
            onClick: ({key}) => {
                if (key === 'delete') {
                    Modal.confirm({
                        title: '确定删除此任务？',
                        icon: <ExclamationCircleOutlined/>,
                        onOk: () => handleDelete(task.id)
                    })
                }
            }
        }
    }

    const taskGroups = groupTasksByPriority(tasks)

    const renderQuadrantView = () => (
        <div className={styles['quadrant-container']}>
            <div className={styles['quadrant-row']}>
                {taskGroups.slice(0, 2).map(group => {
                    const config = QUADRANT_CONFIG.find(q => q.priority === group.priority)!
                    return (
                        <div
                            key={group.priority}
                            className={styles['quadrant-card']}
                            style={{backgroundColor: config.bgColor}}
                        >
                            <div className={styles['quadrant-header']}>
                                <div className={styles['quadrant-title']} style={{color: config.color}}>
                                    {config.title}
                                </div>
                                <Tag color={config.color}>{config.description}</Tag>
                                <Badge count={group.tasks.length} style={{marginLeft: 'auto'}}/>
                            </div>
                            <div className={styles['quadrant-content']}>
                                {group.tasks.length > 0 ? (
                                    <div className={styles['task-list']}>
                                        {group.tasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={`${styles['task-item']} ${
                                                    task.status === TASK_STATUS.COMPLETED ? styles.completed : ''
                                                }`}
                                            >
                                                <div className={styles['task-header']}>
                                                    <span className={styles['task-title']}>{task.title}</span>
                                                    <div className={styles['task-actions']}>
                                                        {getStatusBadge(task.status)}
                                                        <Dropdown
                                                            menu={getTaskMenu(task)}
                                                            trigger={['click']}
                                                            placement="bottomRight"
                                                        >
                                                            <Button type="text" size="small" icon={<MoreOutlined/>}/>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <div className={styles['task-desc']}>{task.description}</div>
                                                )}
                                                <div className={styles['task-meta']}>
                                                    {task.estimatedMinutes && (
                                                        <span>预计 {task.estimatedMinutes} 分钟</span>
                                                    )}
                                                    {task.actualMinutes && (
                                                        <span>实际 {task.actualMinutes} 分钟</span>
                                                    )}
                                                    {task.dueTime && (
                                                        <span>截止 {dayjs(task.dueTime).format('MM-DD HH:mm')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty description="暂无任务" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className={styles['quadrant-row']}>
                {taskGroups.slice(2, 4).map(group => {
                    const config = QUADRANT_CONFIG.find(q => q.priority === group.priority)!
                    return (
                        <div
                            key={group.priority}
                            className={styles['quadrant-card']}
                            style={{backgroundColor: config.bgColor}}
                        >
                            <div className={styles['quadrant-header']}>
                                <div className={styles['quadrant-title']} style={{color: config.color}}>
                                    {config.title}
                                </div>
                                <Tag color={config.color}>{config.description}</Tag>
                                <Badge count={group.tasks.length} style={{marginLeft: 'auto'}}/>
                            </div>
                            <div className={styles['quadrant-content']}>
                                {group.tasks.length > 0 ? (
                                    <div className={styles['task-list']}>
                                        {group.tasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={`${styles['task-item']} ${
                                                    task.status === TASK_STATUS.COMPLETED ? styles.completed : ''
                                                }`}
                                            >
                                                <div className={styles['task-header']}>
                                                    <span className={styles['task-title']}>{task.title}</span>
                                                    <div className={styles['task-actions']}>
                                                        {getStatusBadge(task.status)}
                                                        <Dropdown
                                                            menu={getTaskMenu(task)}
                                                            trigger={['click']}
                                                            placement="bottomRight"
                                                        >
                                                            <Button type="text" size="small" icon={<MoreOutlined/>}/>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <div className={styles['task-desc']}>{task.description}</div>
                                                )}
                                                <div className={styles['task-meta']}>
                                                    {task.estimatedMinutes && (
                                                        <span>预计 {task.estimatedMinutes} 分钟</span>
                                                    )}
                                                    {task.actualMinutes && (
                                                        <span>实际 {task.actualMinutes} 分钟</span>
                                                    )}
                                                    {task.dueTime && (
                                                        <span>截止 {dayjs(task.dueTime).format('MM-DD HH:mm')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty description="暂无任务" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderListView = () => {
        const pendingTasks = tasks.filter(t => t.status === TASK_STATUS.PENDING)
        const inProgressTasks = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS)
        const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED)

        const renderTaskSection = (title: string, taskList: ScheduleTask[], badgeStatus: string) => (
            <Card
                key={title}
                title={
                    <Space>
                        <Badge status={badgeStatus as any}/>
                        <span>{title}</span>
                        <Badge count={taskList.length}/>
                    </Space>
                }
                style={{marginBottom: 16}}
            >
                {taskList.length > 0 ? (
                    <div className={styles['list-view-tasks']}>
                        {taskList.map(task => {
                            const priorityConfig = TaskPriorityLabels[task.priority || TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT]
                            return (
                                <div key={task.id} className={styles['list-task-item']}>
                                    <div className={styles['list-task-main']}>
                                        <div className={styles['list-task-title']}>
                                            <span>{task.title}</span>
                                            <Tag color={priorityConfig.color} style={{marginLeft: 8}}>
                                                {priorityConfig.label}
                                            </Tag>
                                        </div>
                                        {task.description && (
                                            <div className={styles['list-task-desc']}>{task.description}</div>
                                        )}
                                        <div className={styles['list-task-meta']}>
                                            {task.estimatedMinutes && (
                                                <span>预计: {task.estimatedMinutes}分钟</span>
                                            )}
                                            {task.dueTime && (
                                                <span>截止: {dayjs(task.dueTime).format('YYYY-MM-DD HH:mm')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles['list-task-actions']}>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined/>}
                                            onClick={() => handleEdit(task)}
                                        />
                                        <Popconfirm
                                            title="确定删除此任务？"
                                            onConfirm={() => handleDelete(task.id)}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined/>}
                                            />
                                        </Popconfirm>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <Empty description="暂无任务" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                )}
            </Card>
        )

        return (
            <div>
                {renderTaskSection('进行中', inProgressTasks, 'processing')}
                {renderTaskSection('待办', pendingTasks, 'default')}
                {renderTaskSection('已完成', completedTasks, 'success')}
            </div>
        )
    }

    return (
        <div className={styles['task-list-container']}>
            <div className={styles.header}>
                <div className={styles.title}>任务列表</div>
                <div className={styles.actions}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={handleCreate}
                    >
                        新建任务
                    </Button>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'quadrant',
                        label: '四象限视图'
                    },
                    {
                        key: 'list',
                        label: '列表视图'
                    }
                ]}
            />

            <div className={styles.content}>
                {loading ? (
                    <div className={styles['loading-container']}>
                        加载中...
                    </div>
                ) : (
                    <>
                        {activeTab === 'quadrant' && renderQuadrantView()}
                        {activeTab === 'list' && renderListView()}
                    </>
                )}
            </div>

            <Modal
                title={editingTask ? '编辑任务' : '新建任务'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                }}
                footer={null}
                className={styles['task-modal']}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className={styles['modal-form']}
                >
                    <Form.Item
                        name="title"
                        label="任务标题"
                        rules={[{required: true, message: '请输入任务标题'}]}
                    >
                        <Input placeholder="请输入任务标题"/>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="任务描述"
                    >
                        <Input.TextArea rows={3} placeholder="请输入任务描述（可选）"/>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="优先级"
                        rules={[{required: true, message: '请选择优先级'}]}
                    >
                        <Select>
                            {Object.entries(TaskPriorityLabels).map(([key, value]) => (
                                <Select.Option key={key} value={Number(key)}>
                                    <span style={{color: value.color}}>●</span> {value.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                    >
                        <Select>
                            {Object.entries(TASK_STATUS_LABELS).map(([key, value]) => (
                                <Select.Option key={key} value={Number(key)}>
                                    {value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div className={styles['form-row']}>
                        <Form.Item
                            name="estimatedMinutes"
                            label="预计用时（分钟）"
                            style={{flex: 1}}
                        >
                            <InputNumber
                                min={1}
                                max={480}
                                placeholder="预计用时"
                                style={{width: '100%'}}
                            />
                        </Form.Item>

                        <Form.Item
                            name="dueTime"
                            label="截止时间"
                            style={{flex: 1, marginLeft: 16}}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{width: '100%'}}
                                placeholder="选择截止时间"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item className={styles['form-footer']}>
                        <Button
                            onClick={() => {
                                setModalVisible(false)
                                form.resetFields()
                            }}
                            style={{marginRight: 8}}
                        >
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit">
                            保存
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default TaskList
