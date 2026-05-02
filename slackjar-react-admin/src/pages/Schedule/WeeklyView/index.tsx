import React, {useEffect, useRef, useState, useCallback} from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Select,
    TimePicker,
    message,
    Spin,
    Popconfirm,
    DatePicker
} from 'antd'
import {
    LeftOutlined,
    RightOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons'
import dayjs, {Dayjs} from 'dayjs'
import {
    getTimeBlocksByDateRange,
    saveTimeBlock,
    deleteTimeBlock,
    ScheduleTimeBlock,
    TimeBlockTypeLabels,
    TaskPriorityLabels
} from '../../../apis/modules/schedule'
import styles from './index.module.scss'

interface TimeBlock extends ScheduleTimeBlock {
    x: number
    y: number
    width: number
    height: number
}

interface DragState {
    isDragging: boolean
    type: 'create' | 'move' | 'resize'
    blockId?: number
    startX: number
    startY: number
    startBlock?: { x: number; y: number; width: number; height: number }
    dayIndex: number
    startHour: number
    startMinute: number
}

const DAYS_OF_WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const HOURS = Array.from({length: 24}, (_, i) => i)
const HOUR_HEIGHT = 60
const DAY_WIDTH = 180
const TIME_COLUMN_WIDTH = 60
const HEADER_HEIGHT = 40
const MINUTES_PER_HOUR = 60

/**
 * 周视图页面
 * 用于展示和管理一周的时间块
 * 支持拖拽创建、移动和调整时间块大小
 */
const WeeklyView: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentWeekStart, setCurrentWeekStart] = useState<Dayjs>(
        dayjs().startOf('week').add(1, 'day')
    )
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
    const [form] = Form.useForm()
    const [dragState, setDragState] = useState<DragState | null>(null)
    const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)

    const getWeekRange = useCallback(() => {
        const start = currentWeekStart.startOf('day')
        const end = currentWeekStart.add(6, 'day').endOf('day')
        return {
            start: start.valueOf(),
            end: end.valueOf(),
            startDate: start,
            endDate: end
        }
    }, [currentWeekStart])

    const loadTimeBlocks = useCallback(async () => {
        setLoading(true)
        try {
            const {start, end} = getWeekRange()
            const res = await getTimeBlocksByDateRange(start, end)
            if (res.data) {
                const blocks = res.data.map(block => ({
                    ...block,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                }))
                setTimeBlocks(blocks)
            }
        } catch (error) {
            message.error('加载时间块失败')
        } finally {
            setLoading(false)
        }
    }, [getWeekRange])

    useEffect(() => {
        loadTimeBlocks()
    }, [loadTimeBlocks])

    const getCanvasPosition = useCallback((e: React.MouseEvent | MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return null

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        const dayIndex = Math.floor((x - TIME_COLUMN_WIDTH) / DAY_WIDTH)
        const hour = (y - HEADER_HEIGHT) / HOUR_HEIGHT

        return {
            x,
            y,
            dayIndex: dayIndex >= 0 && dayIndex < 7 ? dayIndex : -1,
            hour: Math.max(0, Math.min(23.999, hour))
        }
    }, [])

    const calculateBlockPosition = useCallback((block: ScheduleTimeBlock, weekStart: Dayjs): {
        x: number
        y: number
        width: number
        height: number
    } => {
        const startTime = dayjs(block.startTime)
        const endTime = dayjs(block.endTime)

        const dayDiff = startTime.diff(weekStart, 'day')
        const startHour = startTime.hour() + startTime.minute() / MINUTES_PER_HOUR
        const endHour = endTime.hour() + endTime.minute() / MINUTES_PER_HOUR

        return {
            x: TIME_COLUMN_WIDTH + dayDiff * DAY_WIDTH + 2,
            y: HEADER_HEIGHT + startHour * HOUR_HEIGHT + 1,
            width: DAY_WIDTH - 4,
            height: Math.max(20, (endHour - startHour) * HOUR_HEIGHT - 2)
        }
    }, [])

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const container = containerRef.current
        if (!container) return

        canvas.width = container.clientWidth
        canvas.height = container.clientHeight

        const {startDate, endDate} = getWeekRange()

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#fafafa'
        ctx.fillRect(0, 0, TIME_COLUMN_WIDTH, canvas.height)
        ctx.fillRect(0, 0, canvas.width, HEADER_HEIGHT)

        ctx.strokeStyle = '#f0f0f0'
        ctx.lineWidth = 1

        ctx.beginPath()
        ctx.moveTo(TIME_COLUMN_WIDTH, 0)
        ctx.lineTo(TIME_COLUMN_WIDTH, canvas.height)
        ctx.stroke()

        for (let i = 0; i <= 7; i++) {
            const x = TIME_COLUMN_WIDTH + i * DAY_WIDTH
            ctx.beginPath()
            ctx.moveTo(x, HEADER_HEIGHT)
            ctx.lineTo(x, canvas.height)
            ctx.stroke()
        }

        for (let i = 0; i <= 24; i++) {
            const y = HEADER_HEIGHT + i * HOUR_HEIGHT
            ctx.beginPath()
            ctx.moveTo(TIME_COLUMN_WIDTH, y)
            ctx.lineTo(canvas.width, y)
            ctx.stroke()
        }

        ctx.fillStyle = '#666666'
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.textAlign = 'center'

        for (let i = 0; i < HOURS.length; i++) {
            const hour = HOURS[i]
            const y = HEADER_HEIGHT + i * HOUR_HEIGHT + 8
            ctx.fillText(`${hour}:00`, TIME_COLUMN_WIDTH / 2, y)
        }

        for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
            const day = startDate.add(i, 'day')
            const isToday = day.isSame(dayjs(), 'day')
            const x = TIME_COLUMN_WIDTH + i * DAY_WIDTH + DAY_WIDTH / 2

            if (isToday) {
                ctx.fillStyle = '#1890ff'
                ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            } else {
                ctx.fillStyle = '#666666'
                ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }

            const dayText = `${DAYS_OF_WEEK[i]} ${day.format('MM/DD')}`
            ctx.fillText(dayText, x, HEADER_HEIGHT - 12)
        }

        const calculatedBlocks: TimeBlock[] = []

        for (const block of timeBlocks) {
            const pos = calculateBlockPosition(block, startDate)
            const calculatedBlock = {...block, ...pos}
            calculatedBlocks.push(calculatedBlock)

            const isHovered = hoveredBlock === block.id
            const alpha = isHovered ? 0.95 : 0.85

            ctx.fillStyle = block.color || '#95A5A6'
            ctx.globalAlpha = alpha
            ctx.fillRect(pos.x, pos.y, pos.width, pos.height)

            ctx.strokeStyle = isHovered ? '#1890ff' : block.color || '#95A5A6'
            ctx.lineWidth = isHovered ? 2 : 1
            ctx.strokeRect(pos.x, pos.y, pos.width, pos.height)
            ctx.globalAlpha = 1

            ctx.fillStyle = '#ffffff'
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.textAlign = 'left'

            if (pos.height > 30) {
                const startTime = dayjs(block.startTime).format('HH:mm')
                const endTime = dayjs(block.endTime).format('HH:mm')
                ctx.fillText(`${startTime}-${endTime} ${block.title}`, pos.x + 6, pos.y + 18)
            } else if (pos.height > 20) {
                ctx.fillText(block.title, pos.x + 6, pos.y + 14)
            }
        }

        if (dragState && dragState.isDragging) {
            const previewBlock = calculateDragPreview()
            if (previewBlock) {
                ctx.fillStyle = 'rgba(24, 144, 255, 0.3)'
                ctx.fillRect(previewBlock.x, previewBlock.y, previewBlock.width, previewBlock.height)
                ctx.strokeStyle = '#1890ff'
                ctx.lineWidth = 2
                ctx.setLineDash([5, 5])
                ctx.strokeRect(previewBlock.x, previewBlock.y, previewBlock.width, previewBlock.height)
                ctx.setLineDash([])
            }
        }

        setTimeBlocks(calculatedBlocks)
    }, [timeBlocks, hoveredBlock, dragState, getWeekRange, calculateBlockPosition])

    const calculateDragPreview = useCallback(() => {
        if (!dragState) return null

        const {startDate} = getWeekRange()

        if (dragState.type === 'create') {
            const pos = getCanvasPositionFromState(dragState)
            if (!pos || pos.dayIndex < 0) return null

            const endHour = Math.min(24, pos.hour + 1)
            const startMinutes = Math.floor((pos.hour % 1) * 60)
            const endMinutes = 0

            return {
                x: TIME_COLUMN_WIDTH + pos.dayIndex * DAY_WIDTH + 2,
                y: HEADER_HEIGHT + Math.floor(pos.hour) * HOUR_HEIGHT + 1,
                width: DAY_WIDTH - 4,
                height: (endHour - Math.floor(pos.hour)) * HOUR_HEIGHT - 2
            }
        }

        if (dragState.type === 'move' && dragState.startBlock) {
            const pos = getCanvasPositionFromState(dragState)
            if (!pos) return null

            const dayOffset = pos.dayIndex - dragState.dayIndex
            const hourOffset = pos.hour - (dragState.startHour + dragState.startMinute / 60)

            return {
                x: Math.max(TIME_COLUMN_WIDTH, Math.min(
                    TIME_COLUMN_WIDTH + 7 * DAY_WIDTH - dragState.startBlock.width,
                    dragState.startBlock.x + dayOffset * DAY_WIDTH
                )),
                y: Math.max(HEADER_HEIGHT, Math.min(
                    HEADER_HEIGHT + 24 * HOUR_HEIGHT - dragState.startBlock.height,
                    dragState.startBlock.y + hourOffset * HOUR_HEIGHT
                )),
                width: dragState.startBlock.width,
                height: dragState.startBlock.height
            }
        }

        return null
    }, [dragState, getWeekRange])

    const getCanvasPositionFromState = useCallback((state: DragState) => {
        const {startDate} = getWeekRange()
        const dayStart = startDate.add(state.dayIndex, 'day')

        return {
            dayIndex: state.dayIndex,
            hour: state.startHour + state.startMinute / 60
        }
    }, [getWeekRange])

    useEffect(() => {
        drawCanvas()
    }, [drawCanvas])

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPosition(e)
        if (!pos) return

        const clickedBlock = [...timeBlocks].reverse().find(block =>
            pos.x >= block.x && pos.x <= block.x + block.width &&
            pos.y >= block.y && pos.y <= block.y + block.height
        )

        if (clickedBlock) {
            const isRightEdge = pos.x > clickedBlock.x + clickedBlock.width - 10
            const isBottomEdge = pos.y > clickedBlock.y + clickedBlock.height - 10

            if (isBottomEdge) {
                const startDate = currentWeekStart.startOf('day')
                const startTime = dayjs(clickedBlock.startTime)
                const dayIndex = startTime.diff(startDate, 'day')
                const startHour = startTime.hour()
                const startMinute = startTime.minute()

                setDragState({
                    isDragging: true,
                    type: 'resize',
                    blockId: clickedBlock.id,
                    startX: pos.x,
                    startY: pos.y,
                    startBlock: {
                        x: clickedBlock.x,
                        y: clickedBlock.y,
                        width: clickedBlock.width,
                        height: clickedBlock.height
                    },
                    dayIndex,
                    startHour,
                    startMinute
                })
            } else {
                const startDate = currentWeekStart.startOf('day')
                const startTime = dayjs(clickedBlock.startTime)
                const dayIndex = startTime.diff(startDate, 'day')
                const startHour = startTime.hour()
                const startMinute = startTime.minute()

                setDragState({
                    isDragging: true,
                    type: 'move',
                    blockId: clickedBlock.id,
                    startX: pos.x,
                    startY: pos.y,
                    startBlock: {
                        x: clickedBlock.x,
                        y: clickedBlock.y,
                        width: clickedBlock.width,
                        height: clickedBlock.height
                    },
                    dayIndex,
                    startHour,
                    startMinute
                })
            }
        } else if (pos.dayIndex >= 0 && pos.y > HEADER_HEIGHT) {
            const snappedHour = Math.floor(pos.hour)
            const snappedMinute = Math.round((pos.hour % 1) * 2) * 30

            setDragState({
                isDragging: true,
                type: 'create',
                startX: pos.x,
                startY: pos.y,
                dayIndex: pos.dayIndex,
                startHour: snappedHour,
                startMinute: Math.min(59, snappedMinute)
            })
        }
    }, [getCanvasPosition, timeBlocks, currentWeekStart])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPosition(e)
        if (!pos) return

        const hovered = [...timeBlocks].reverse().find(block =>
            pos.x >= block.x && pos.x <= block.x + block.width &&
            pos.y >= block.y && pos.y <= block.y + block.height
        )

        setHoveredBlock(hovered ? hovered.id : null)

        if (dragState && dragState.isDragging) {
            drawCanvas()
        }
    }, [getCanvasPosition, timeBlocks, dragState, drawCanvas])

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragState || !dragState.isDragging) return

        const pos = getCanvasPosition(e)

        if (dragState.type === 'create' && pos && pos.dayIndex >= 0) {
            const {startDate} = getWeekRange()
            const dayStart = startDate.add(dragState.dayIndex, 'day')

            const startHour = dragState.startHour + dragState.startMinute / 60
            const endHour = Math.min(24, Math.max(startHour + 0.5, pos.hour))

            const startTime = dayStart
                .hour(Math.floor(startHour))
                .minute(Math.round((startHour % 1) * 60))
                .second(0)

            const endTime = dayStart
                .hour(Math.floor(endHour))
                .minute(Math.round((endHour % 1) * 60))
                .second(0)

            form.setFieldsValue({
                title: '',
                blockType: 1,
                startTime: startTime,
                endTime: endTime,
                priority: 4
            })
            setEditingBlock(null)
            setModalVisible(true)
        } else if (dragState.type === 'move' && dragState.blockId && pos) {
            const block = timeBlocks.find(b => b.id === dragState.blockId)
            if (!block) return

            const {startDate} = getWeekRange()
            const originalStartTime = dayjs(block.startTime)
            const originalEndTime = dayjs(block.endTime)
            const duration = originalEndTime.diff(originalStartTime, 'minute')

            const dayOffset = pos.dayIndex - dragState.dayIndex
            const hourOffset = pos.hour - (dragState.startHour + dragState.startMinute / 60)

            const newStartTime = originalStartTime
                .add(dayOffset, 'day')
                .add(Math.round(hourOffset * 2) * 30, 'minute')

            const newEndTime = newStartTime.add(duration, 'minute')

            saveTimeBlock({
                ...block,
                startTime: newStartTime.valueOf(),
                endTime: newEndTime.valueOf()
            }).then(() => {
                message.success('时间块已移动')
                loadTimeBlocks()
            }).catch(() => {
                message.error('移动时间块失败')
            })
        } else if (dragState.type === 'resize' && dragState.blockId && pos) {
            const block = timeBlocks.find(b => b.id === dragState.blockId)
            if (!block) return

            const originalStartTime = dayjs(block.startTime)
            const newEndHour = Math.max(originalStartTime.hour() + originalStartTime.minute() / 60 + 0.5, pos.hour)

            const newEndTime = dayjs(block.startTime)
                .hour(Math.floor(newEndHour))
                .minute(Math.round((newEndHour % 1) * 60))
                .second(0)

            if (newEndTime.isAfter(originalStartTime)) {
                saveTimeBlock({
                    ...block,
                    endTime: newEndTime.valueOf()
                }).then(() => {
                    message.success('时间块已调整')
                    loadTimeBlocks()
                }).catch(() => {
                    message.error('调整时间块失败')
                })
            }
        }

        setDragState(null)
    }, [dragState, getCanvasPosition, getWeekRange, form, timeBlocks, loadTimeBlocks])

    const handleMouseLeave = useCallback(() => {
        setHoveredBlock(null)
    }, [])

    const handleBlockClick = useCallback((block: TimeBlock) => {
        setEditingBlock(block)
        form.setFieldsValue({
            title: block.title,
            description: block.description,
            blockType: block.blockType,
            priority: block.priority || 4,
            startTime: dayjs(block.startTime),
            endTime: dayjs(block.endTime)
        })
        setModalVisible(true)
    }, [form])

    const handleSave = useCallback(async (values: any) => {
        try {
            const startTime = values.startTime.valueOf()
            const endTime = values.endTime.valueOf()

            if (endTime <= startTime) {
                message.error('结束时间必须大于开始时间')
                return
            }

            const data = {
                ...(editingBlock ? {id: editingBlock.id} : {}),
                title: values.title,
                description: values.description,
                blockType: values.blockType,
                priority: values.priority,
                startTime,
                endTime,
                color: TimeBlockTypeLabels[values.blockType]?.color
            }

            await saveTimeBlock(data)
            message.success(editingBlock ? '时间块已更新' : '时间块已创建')
            setModalVisible(false)
            form.resetFields()
            loadTimeBlocks()
        } catch (error) {
            message.error('保存失败')
        }
    }, [editingBlock, form, loadTimeBlocks])

    const handleDelete = useCallback(async () => {
        if (!editingBlock) return
        try {
            await deleteTimeBlock(editingBlock.id)
            message.success('时间块已删除')
            setModalVisible(false)
            form.resetFields()
            loadTimeBlocks()
        } catch (error) {
            message.error('删除失败')
        }
    }, [editingBlock, form, loadTimeBlocks])

    const handlePrevWeek = useCallback(() => {
        setCurrentWeekStart(prev => prev.subtract(1, 'week'))
    }, [])

    const handleNextWeek = useCallback(() => {
        setCurrentWeekStart(prev => prev.add(1, 'week'))
    }, [])

    const handleToday = useCallback(() => {
        setCurrentWeekStart(dayjs().startOf('week').add(1, 'day'))
    }, [])

    const {startDate, endDate} = getWeekRange()

    return (
        <div className={styles['weekly-view-container']}>
            <div className={styles.header}>
                <div className={styles['date-nav']}>
                    <Button icon={<LeftOutlined/>} onClick={handlePrevWeek}/>
                    <span className={styles['date-range']}>
                        {startDate.format('YYYY年MM月DD日')} - {endDate.format('YYYY年MM月DD日')}
                    </span>
                    <Button icon={<RightOutlined/>} onClick={handleNextWeek}/>
                    <Button onClick={handleToday}>今天</Button>
                </div>
                <div className={styles.actions}>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => {
                        const now = dayjs()
                        const dayStart = now.startOf('day')
                        const hour = Math.max(9, now.hour())

                        form.setFieldsValue({
                            title: '',
                            blockType: 1,
                            priority: 4,
                            startTime: dayStart.hour(hour).minute(0),
                            endTime: dayStart.hour(hour + 1).minute(0)
                        })
                        setEditingBlock(null)
                        setModalVisible(true)
                    }}>
                        新建时间块
                    </Button>
                </div>
            </div>

            <div className={styles.legend}>
                {Object.entries(TimeBlockTypeLabels).map(([key, value]) => (
                    <div key={key} className={styles['legend-item']}>
                        <div
                            className={styles['color-dot']}
                            style={{backgroundColor: value.color}}
                        />
                        <span className={styles.label}>{value.label}</span>
                    </div>
                ))}
            </div>

            <div className={styles['canvas-container']} ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    className={styles['calendar-canvas']}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                />
                {loading && (
                    <div className={styles['loading-mask']}>
                        <Spin size="large"/>
                    </div>
                )}
            </div>

            <Modal
                title={editingBlock ? '编辑时间块' : '新建时间块'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                }}
                footer={[
                    editingBlock && (
                        <Popconfirm
                            key="delete"
                            title="确定要删除这个时间块吗？"
                            onConfirm={handleDelete}
                        >
                            <Button danger icon={<DeleteOutlined/>}>
                                删除
                            </Button>
                        </Popconfirm>
                    ),
                    <Button key="cancel" onClick={() => {
                        setModalVisible(false)
                        form.resetFields()
                    }}>
                        取消
                    </Button>,
                    <Button key="save" type="primary" onClick={() => form.submit()}>
                        保存
                    </Button>
                ]}
                className={styles['time-block-modal']}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className={styles['modal-content']}
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[{required: true, message: '请输入标题'}]}
                    >
                        <Input placeholder="请输入时间块标题"/>
                    </Form.Item>

                    <Form.Item
                        name="blockType"
                        label="类型"
                        rules={[{required: true, message: '请选择类型'}]}
                    >
                        <div className={styles['type-selector']}>
                            {Object.entries(TimeBlockTypeLabels).map(([key, value]) => (
                                <div
                                    key={key}
                                    className={`${styles['type-tag']} ${
                                        form.getFieldValue('blockType') === Number(key) ? styles.selected : ''
                                    }`}
                                    style={{
                                        backgroundColor: value.color,
                                        color: '#fff'
                                    }}
                                    onClick={() => form.setFieldValue('blockType', Number(key))}
                                >
                                    {value.label}
                                </div>
                            ))}
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="优先级"
                    >
                        <div className={styles['priority-selector']}>
                            {Object.entries(TaskPriorityLabels).map(([key, value]) => (
                                <div
                                    key={key}
                                    className={`${styles['priority-tag']} ${
                                        form.getFieldValue('priority') === Number(key) ? styles.selected : ''
                                    }`}
                                    style={{
                                        backgroundColor: value.color + '30',
                                        borderColor: value.color,
                                        color: value.color
                                    }}
                                    onClick={() => form.setFieldValue('priority', Number(key))}
                                >
                                    {value.label}
                                </div>
                            ))}
                        </div>
                    </Form.Item>

                    <div className={styles['time-range']}>
                        <Form.Item
                            name="startTime"
                            label="开始时间"
                            rules={[{required: true, message: '请选择开始时间'}]}
                            style={{flex: 1}}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{width: '100%'}}
                            />
                        </Form.Item>
                        <Form.Item
                            name="endTime"
                            label="结束时间"
                            rules={[{required: true, message: '请选择结束时间'}]}
                            style={{flex: 1}}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{width: '100%'}}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={3} placeholder="请输入描述（可选）"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default WeeklyView
