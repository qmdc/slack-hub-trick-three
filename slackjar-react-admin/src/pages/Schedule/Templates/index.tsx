import React, {useState, useEffect, useCallback} from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    message,
    Tag,
    Popconfirm,
    Card,
    Tabs,
    Empty,
    Space,
    Row,
    Col,
    Badge,
    Divider,
    List
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    CopyOutlined,
    StarOutlined,
    StarFilled,
    ClockCircleOutlined
} from '@ant-design/icons'
import dayjs, {Dayjs} from 'dayjs'
import {
    pageQueryTemplates,
    saveTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getTemplatesByType,
    getDefaultTemplate,
    batchCreateTimeBlocksFromTemplate,
    ScheduleTemplate,
    TemplateTypeEnum,
    TemplateTypeLabels,
    TimeBlockTypeLabels,
    TimeBlockTypeEnum,
    TimeBlockSaveRequest
} from '../../../apis/modules/schedule'
import styles from './index.module.scss'

interface TemplateTimeBlock {
    id?: string
    title: string
    blockType: number
    startTime: string
    endTime: string
    dayOfWeek?: number
}

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const Templates: React.FC = () => {
    const [activeTab, setActiveTab] = useState('daily')
    const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null)
    const [form] = Form.useForm()
    const [timeBlocks, setTimeBlocks] = useState<TemplateTimeBlock[]>([])
    const [applyModalVisible, setApplyModalVisible] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null)
    const [targetDate, setTargetDate] = useState<Dayjs>(dayjs())

    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const templateType = activeTab === 'daily' ? TemplateTypeEnum.DAILY : TemplateTypeEnum.WEEKLY
            const res = await getTemplatesByType(templateType)
            if (res.data) {
                setTemplates(res.data)
            }
        } catch (error) {
            message.error('加载模板失败')
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        loadTemplates()
    }, [loadTemplates])

    const handleCreate = () => {
        form.setFieldsValue({
            name: '',
            description: '',
            templateType: activeTab === 'daily' ? TemplateTypeEnum.DAILY : TemplateTypeEnum.WEEKLY
        })
        setTimeBlocks([
            {id: '1', title: '', blockType: TimeBlockTypeEnum.WORK, startTime: '09:00', endTime: '10:00'}
        ])
        setEditingTemplate(null)
        setModalVisible(true)
    }

    const handleEdit = (template: ScheduleTemplate) => {
        form.setFieldsValue({
            name: template.name,
            description: template.description,
            templateType: template.templateType
        })

        let blocks: TemplateTimeBlock[] = []
        if (template.templateData) {
            try {
                const data = JSON.parse(template.templateData)
                blocks = data.timeBlocks || []
            } catch (e) {
                blocks = []
            }
        }
        setTimeBlocks(blocks.length > 0 ? blocks : [
            {id: '1', title: '', blockType: TimeBlockTypeEnum.WORK, startTime: '09:00', endTime: '10:00'}
        ])
        setEditingTemplate(template)
        setModalVisible(true)
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteTemplate(id)
            message.success('模板已删除')
            loadTemplates()
        } catch (error) {
            message.error('删除失败')
        }
    }

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultTemplate(id)
            message.success('已设为默认模板')
            loadTemplates()
        } catch (error) {
            message.error('设置默认模板失败')
        }
    }

    const handleSave = async (values: any) => {
        try {
            const templateData = JSON.stringify({
                timeBlocks: timeBlocks.filter(b => b.title.trim())
            })

            const data = {
                ...(editingTemplate ? {id: editingTemplate.id} : {}),
                name: values.name,
                description: values.description,
                templateType: values.templateType,
                templateData
            }

            await saveTemplate(data)
            message.success(editingTemplate ? '模板已更新' : '模板已创建')
            setModalVisible(false)
            form.resetFields()
            loadTemplates()
        } catch (error) {
            message.error('保存失败')
        }
    }

    const handleApply = (template: ScheduleTemplate) => {
        setSelectedTemplate(template)
        setTargetDate(dayjs())
        setApplyModalVisible(true)
    }

    const handleConfirmApply = async () => {
        if (!selectedTemplate) return

        try {
            let timeBlocksToApply: TimeBlockSaveRequest[] = []

            if (selectedTemplate.templateData) {
                try {
                    const data = JSON.parse(selectedTemplate.templateData)
                    const blocks = data.timeBlocks || []
                    const baseDate = targetDate.startOf('day')

                    timeBlocksToApply = blocks.map((block: any, index: number) => {
                        const dayOffset = block.dayOfWeek ? (block.dayOfWeek - 1) : 0
                        const blockDate = baseDate.add(dayOffset, 'day')

                        const [startHour, startMin] = block.startTime.split(':').map(Number)
                        const [endHour, endMin] = block.endTime.split(':').map(Number)

                        const startTime = blockDate.hour(startHour).minute(startMin).second(0).valueOf()
                        const endTime = blockDate.hour(endHour).minute(endMin).second(0).valueOf()

                        return {
                            title: block.title,
                            blockType: block.blockType,
                            startTime,
                            endTime,
                            color: TimeBlockTypeLabels[block.blockType]?.color,
                            dayOfWeek: block.dayOfWeek
                        }
                    })
                } catch (e) {
                    message.error('模板数据解析失败')
                    return
                }
            }

            if (timeBlocksToApply.length === 0) {
                message.warning('模板中没有时间块')
                return
            }

            await batchCreateTimeBlocksFromTemplate({
                timeBlocks: timeBlocksToApply,
                targetDate: targetDate.valueOf()
            })

            message.success('模板已应用')
            setApplyModalVisible(false)
        } catch (error) {
            message.error('应用模板失败')
        }
    }

    const addTimeBlock = () => {
        const newBlock: TemplateTimeBlock = {
            id: Date.now().toString(),
            title: '',
            blockType: TimeBlockTypeEnum.WORK,
            startTime: '09:00',
            endTime: '10:00',
            dayOfWeek: activeTab === 'weekly' ? 1 : undefined
        }
        setTimeBlocks([...timeBlocks, newBlock])
    }

    const removeTimeBlock = (id: string) => {
        setTimeBlocks(timeBlocks.filter(b => b.id !== id))
    }

    const updateTimeBlock = (id: string, field: string, value: any) => {
        setTimeBlocks(timeBlocks.map(b =>
            b.id === id ? {...b, [field]: value} : b
        ))
    }

    const renderTemplateCard = (template: ScheduleTemplate) => {
        let blocks: any[] = []
        if (template.templateData) {
            try {
                const data = JSON.parse(template.templateData)
                blocks = data.timeBlocks || []
            } catch (e) {
                blocks = []
            }
        }

        return (
            <Card
                key={template.id}
                className={styles['template-card']}
                actions={[
                    <Button
                        key="apply"
                        type="link"
                        size="small"
                        icon={<CopyOutlined/>}
                        onClick={() => handleApply(template)}
                    >
                        应用
                    </Button>,
                    <Button
                        key="edit"
                        type="link"
                        size="small"
                        icon={<EditOutlined/>}
                        onClick={() => handleEdit(template)}
                    >
                        编辑
                    </Button>,
                    <Popconfirm
                        key="delete"
                        title="确定删除此模板？"
                        onConfirm={() => handleDelete(template.id)}
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                ]}
            >
                <Card.Meta
                    title={
                        <Space>
                            <span className={styles['template-name']}>{template.name}</span>
                            {template.isDefault === 1 && (
                                <Tag color="gold" icon={<StarFilled/>}>默认</Tag>
                            )}
                        </Space>
                    }
                    description={
                        <div className={styles['template-meta']}>
                            {template.description && (
                                <div className={styles['template-desc']}>{template.description}</div>
                            )}
                            <div className={styles['template-stats']}>
                                <Badge count={blocks.length} showZero>
                                    <span style={{color: '#666'}}>时间块</span>
                                </Badge>
                            </div>
                        </div>
                    }
                />

                {blocks.length > 0 && (
                    <div className={styles['template-preview']}>
                        <Divider style={{margin: '12px 0'}}/>
                        <div className={styles['preview-list']}>
                            {blocks.slice(0, 5).map((block: any, index: number) => {
                                const typeConfig = TimeBlockTypeLabels[block.blockType] || TimeBlockTypeLabels[TimeBlockTypeEnum.OTHER]
                                return (
                                    <div key={index} className={styles['preview-item']}>
                                        <div
                                            className={styles['preview-color']}
                                            style={{backgroundColor: typeConfig.color}}
                                        />
                                        <span className={styles['preview-title']}>{block.title}</span>
                                        <span className={styles['preview-time']}>
                                            {activeTab === 'weekly' && block.dayOfWeek && (
                                                <span className={styles['preview-day']}>{WEEKDAYS[block.dayOfWeek - 1]}</span>
                                            )}
                                            {block.startTime} - {block.endTime}
                                        </span>
                                    </div>
                                )
                            })}
                            {blocks.length > 5 && (
                                <div className={styles['preview-more']}>
                                    还有 {blocks.length - 5} 个时间块...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {template.isDefault !== 1 && (
                    <Button
                        type="text"
                        size="small"
                        icon={<StarOutlined/>}
                        onClick={() => handleSetDefault(template.id)}
                        style={{marginTop: 12}}
                    >
                        设为默认
                    </Button>
                )}
            </Card>
        )
    }

    return (
        <div className={styles['templates-container']}>
            <div className={styles.header}>
                <div className={styles.title}>计划模板</div>
                <div className={styles.actions}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={handleCreate}
                    >
                        新建模板
                    </Button>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'daily',
                        label: (
                            <Space>
                                <CalendarOutlined/>
                                每日模板
                            </Space>
                        )
                    },
                    {
                        key: 'weekly',
                        label: (
                            <Space>
                                <CalendarOutlined/>
                                每周模板
                            </Space>
                        )
                    }
                ]}
            />

            <div className={styles.content}>
                {loading ? (
                    <div className={styles['loading-container']}>
                        加载中...
                    </div>
                ) : templates.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {templates.map(template => (
                            <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
                                {renderTemplateCard(template)}
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description="暂无模板，点击新建模板创建"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
                            新建模板
                        </Button>
                    </Empty>
                )}
            </div>

            <Modal
                title={editingTemplate ? '编辑模板' : '新建模板'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                }}
                footer={null}
                width={700}
                className={styles['template-modal']}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className={styles['modal-form']}
                >
                    <Form.Item
                        name="name"
                        label="模板名称"
                        rules={[{required: true, message: '请输入模板名称'}]}
                    >
                        <Input placeholder="例如：工作日计划、周末休息计划"/>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="模板描述"
                    >
                        <Input.TextArea rows={2} placeholder="模板描述（可选）"/>
                    </Form.Item>

                    <Form.Item
                        name="templateType"
                        label="模板类型"
                        rules={[{required: true, message: '请选择模板类型'}]}
                    >
                        <Select disabled={!!editingTemplate}>
                            {Object.entries(TemplateTypeLabels).map(([key, value]) => (
                                <Select.Option key={key} value={Number(key)}>
                                    {value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div className={styles['time-blocks-section']}>
                        <div className={styles['section-header']}>
                            <span className={styles['section-title']}>时间块配置</span>
                            <Button type="dashed" size="small" icon={<PlusOutlined/>} onClick={addTimeBlock}>
                                添加时间块
                            </Button>
                        </div>

                        <div className={styles['time-blocks-list']}>
                            {timeBlocks.map((block, index) => {
                                const typeConfig = TimeBlockTypeLabels[block.blockType] || TimeBlockTypeLabels[TimeBlockTypeEnum.OTHER]
                                return (
                                    <div key={block.id} className={styles['time-block-row']}>
                                        {activeTab === 'weekly' && (
                                            <Select
                                                value={block.dayOfWeek}
                                                onChange={(value) => updateTimeBlock(block.id, 'dayOfWeek', value)}
                                                className={styles['day-select']}
                                            >
                                                {WEEKDAYS.map((day, i) => (
                                                    <Select.Option key={i + 1} value={i + 1}>
                                                        {day}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                        <TimePicker
                                            value={dayjs(block.startTime, 'HH:mm')}
                                            format="HH:mm"
                                            onChange={(time) => time && updateTimeBlock(block.id, 'startTime', time.format('HH:mm'))}
                                            className={styles['time-picker']}
                                            placeholder="开始"
                                        />
                                        <span className={styles['time-separator']}>-</span>
                                        <TimePicker
                                            value={dayjs(block.endTime, 'HH:mm')}
                                            format="HH:mm"
                                            onChange={(time) => time && updateTimeBlock(block.id, 'endTime', time.format('HH:mm'))}
                                            className={styles['time-picker']}
                                            placeholder="结束"
                                        />
                                        <Select
                                            value={block.blockType}
                                            onChange={(value) => updateTimeBlock(block.id, 'blockType', value)}
                                            className={styles['type-select']}
                                        >
                                            {Object.entries(TimeBlockTypeLabels).map(([key, value]) => (
                                                <Select.Option key={key} value={Number(key)}>
                                                    <span style={{color: value.color}}>●</span> {value.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Input
                                            value={block.title}
                                            onChange={(e) => updateTimeBlock(block.id, 'title', e.target.value)}
                                            placeholder="时间块名称"
                                            className={styles['title-input']}
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined/>}
                                            onClick={() => removeTimeBlock(block.id)}
                                            disabled={timeBlocks.length <= 1}
                                        />
                                    </div>
                                )
                            })}
                        </div>
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

            <Modal
                title="应用模板"
                open={applyModalVisible}
                onOk={handleConfirmApply}
                onCancel={() => setApplyModalVisible(false)}
                okText="确认应用"
                cancelText="取消"
            >
                <div className={styles['apply-modal-content']}>
                    <p>当前模板: <strong>{selectedTemplate?.name}</strong></p>
                    <div style={{marginTop: 16}}>
                        <p>选择应用日期:</p>
                        <DatePicker
                            value={targetDate}
                            onChange={(date) => date && setTargetDate(date)}
                            style={{width: 200}}
                            placeholder="选择日期"
                        />
                    </div>
                    <p style={{marginTop: 16, color: '#666', fontSize: 12}}>
                        时间块将被创建到所选日期（或周）。
                    </p>
                </div>
            </Modal>
        </div>
    )
}

export default Templates
