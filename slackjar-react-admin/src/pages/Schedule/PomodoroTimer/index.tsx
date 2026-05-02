import React, {useState, useEffect, useCallback, useRef} from 'react'
import {
    Button,
    Card,
    Select,
    Modal,
    Input,
    message,
    Statistic,
    Row,
    Col,
    Tag
} from 'antd'
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    RedoOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
    getCurrentPomodoro,
    startPomodoro,
    completePomodoro,
    interruptPomodoro,
    abandonPomodoro,
    getPomodorosByDateRange,
    PomodoroRecord,
    PomodoroStatusEnum,
    PomodoroStatusLabels,
    getTimeBlocksByDateRange,
    ScheduleTimeBlock,
    getPendingTasks,
    ScheduleTask
} from '../../../apis/modules/schedule'
import styles from './index.module.scss'

const PRESET_DURATIONS = [
    {value: 15, label: '15分钟'},
    {value: 25, label: '25分钟'},
    {value: 45, label: '45分钟'},
    {value: 60, label: '60分钟'}
]

const CIRCUMFERENCE = 2 * Math.PI * 140

/**
 * 番茄钟专注模式页面
 * 支持倒计时、暂停、完成、打断、放弃等操作
 * 倒计时结束自动记录实际用时
 */
const PomodoroTimer: React.FC = () => {
    const [currentPomodoro, setCurrentPomodoro] = useState<PomodoroRecord | null>(null)
    const [remainingTime, setRemainingTime] = useState(25 * 60)
    const [selectedDuration, setSelectedDuration] = useState(25)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [history, setHistory] = useState<PomodoroRecord[]>([])
    const [todayStats, setTodayStats] = useState({
        totalSessions: 0,
        totalMinutes: 0,
        completedSessions: 0
    })
    const [interruptModalVisible, setInterruptModalVisible] = useState(false)
    const [interruptReason, setInterruptReason] = useState('')
    const [timeBlocks, setTimeBlocks] = useState<ScheduleTimeBlock[]>([])
    const [tasks, setTasks] = useState<ScheduleTask[]>([])
    const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null)
    const [selectedTimeBlock, setSelectedTimeBlock] = useState<ScheduleTimeBlock | null>(null)
    const [loading, setLoading] = useState(false)

    const timerRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)

    const loadCurrentPomodoro = useCallback(async () => {
        try {
            const res = await getCurrentPomodoro()
            if (res.data) {
                setCurrentPomodoro(res.data)
                const elapsed = Math.floor((Date.now() - res.data.startTime) / 1000)
                const remaining = Math.max(0, res.data.plannedMinutes * 60 - elapsed)
                setRemainingTime(remaining)

                if (res.data.status === PomodoroStatusEnum.IN_PROGRESS && remaining > 0) {
                    setIsRunning(true)
                    startTimeRef.current = Date.now() - elapsed * 1000
                }
            }
        } catch (error) {
            console.error('加载当前番茄钟失败:', error)
        }
    }, [])

    const loadHistory = useCallback(async () => {
        try {
            const todayStart = dayjs().startOf('day').valueOf()
            const todayEnd = dayjs().endOf('day').valueOf()
            const res = await getPomodorosByDateRange(todayStart, todayEnd)
            if (res.data) {
                const sortedHistory = [...res.data].sort((a, b) => b.startTime - a.startTime)
                setHistory(sortedHistory)

                const totalSessions = res.data.length
                const totalMinutes = res.data.reduce((sum, r) => sum + (r.actualMinutes || 0), 0)
                const completedSessions = res.data.filter(r => r.status === PomodoroStatusEnum.COMPLETED).length

                setTodayStats({
                    totalSessions,
                    totalMinutes,
                    completedSessions
                })
            }
        } catch (error) {
            console.error('加载历史记录失败:', error)
        }
    }, [])

    const loadTimeBlocks = useCallback(async () => {
        try {
            const todayStart = dayjs().startOf('day').valueOf()
            const todayEnd = dayjs().endOf('day').valueOf()
            const res = await getTimeBlocksByDateRange(todayStart, todayEnd)
            if (res.data) {
                setTimeBlocks(res.data)
            }
        } catch (error) {
            console.error('加载时间块失败:', error)
        }
    }, [])

    const loadTasks = useCallback(async () => {
        try {
            const res = await getPendingTasks()
            if (res.data) {
                setTasks(res.data)
            }
        } catch (error) {
            console.error('加载任务失败:', error)
        }
    }, [])

    useEffect(() => {
        loadCurrentPomodoro()
        loadHistory()
        loadTimeBlocks()
        loadTasks()
    }, [loadCurrentPomodoro, loadHistory, loadTimeBlocks, loadTasks])

    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 0) {
                        setIsRunning(false)
                        if (timerRef.current) {
                            clearInterval(timerRef.current)
                        }
                        handleComplete()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isRunning, isPaused])

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getProgress = (): number => {
        const totalSeconds = selectedDuration * 60
        return (1 - remainingTime / totalSeconds) * CIRCUMFERENCE
    }

    const handleStart = async () => {
        setLoading(true)
        try {
            const res = await startPomodoro({
                taskId: selectedTask?.id,
                timeBlockId: selectedTimeBlock?.id,
                plannedMinutes: selectedDuration
            })
            if (res.data) {
                setCurrentPomodoro(res.data)
                setRemainingTime(selectedDuration * 60)
                setIsRunning(true)
                setIsPaused(false)
                startTimeRef.current = Date.now()
                message.success('番茄钟已开始')
            }
        } catch (error) {
            message.error('开始番茄钟失败')
        } finally {
            setLoading(false)
        }
    }

    const handlePause = () => {
        setIsPaused(true)
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    const handleResume = () => {
        setIsPaused(false)
    }

    const handleComplete = async () => {
        if (!currentPomodoro) return

        try {
            const res = await completePomodoro(currentPomodoro.id)
            if (res.data) {
                setCurrentPomodoro(res.data)
                setIsRunning(false)
                setIsPaused(false)
                message.success('番茄钟已完成！')
                loadHistory()
            }
        } catch (error) {
            message.error('完成番茄钟失败')
        }
    }

    const handleInterrupt = async () => {
        if (!currentPomodoro) return

        try {
            const res = await interruptPomodoro(currentPomodoro.id, interruptReason)
            if (res.data) {
                setCurrentPomodoro(res.data)
                setIsRunning(false)
                setIsPaused(false)
                setInterruptModalVisible(false)
                setInterruptReason('')
                message.info('番茄钟已打断')
                loadHistory()
            }
        } catch (error) {
            message.error('打断番茄钟失败')
        }
    }

    const handleAbandon = async () => {
        if (!currentPomodoro) return

        Modal.confirm({
            title: '确定要放弃这个番茄钟吗？',
            icon: <ExclamationCircleOutlined/>,
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const res = await abandonPomodoro(currentPomodoro.id)
                    if (res.data) {
                        setCurrentPomodoro(res.data)
                        setIsRunning(false)
                        setIsPaused(false)
                        setRemainingTime(selectedDuration * 60)
                        message.info('番茄钟已放弃')
                        loadHistory()
                    }
                } catch (error) {
                    message.error('放弃番茄钟失败')
                }
            }
        })
    }

    const handleReset = () => {
        setRemainingTime(selectedDuration * 60)
        setIsRunning(false)
        setIsPaused(false)
        setCurrentPomodoro(null)
    }

    const handleDurationChange = (duration: number) => {
        if (!isRunning) {
            setSelectedDuration(duration)
            setRemainingTime(duration * 60)
        }
    }

    const getStatusClass = (status: number): string => {
        switch (status) {
            case PomodoroStatusEnum.COMPLETED:
                return 'completed'
            case PomodoroStatusEnum.INTERRUPTED:
                return 'interrupted'
            case PomodoroStatusEnum.ABANDONED:
                return 'abandoned'
            default:
                return ''
        }
    }

    return (
        <div className={styles['pomodoro-container']}>
            <div className={styles.header}>
                <div className={styles.title}>番茄钟专注模式</div>
            </div>

            <div className={styles['timer-section']}>
                <div className={styles['preset-durations']}>
                    {PRESET_DURATIONS.map(d => (
                        <button
                            key={d.value}
                            className={`${styles['duration-btn']} ${
                                selectedDuration === d.value ? styles.active : ''
                            }`}
                            onClick={() => handleDurationChange(d.value)}
                            disabled={isRunning}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                <div className={styles['timer-display']}>
                    <div className={styles['timer-circle']}>
                        <svg className={styles['progress-ring']} width="300" height="300">
                            <circle
                                className={styles['background-ring']}
                                cx="150"
                                cy="150"
                                r="140"
                            />
                            <circle
                                className={styles['progress-ring-circle']}
                                cx="150"
                                cy="150"
                                r="140"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={CIRCUMFERENCE - getProgress()}
                            />
                        </svg>
                        <div className={styles['time-display']}>
                            {formatTime(remainingTime)}
                        </div>
                        <div className={styles['status-text']}>
                            {isRunning ? (isPaused ? '已暂停' : '专注中...') : '准备开始'}
                        </div>
                    </div>
                </div>

                <div className={styles['timer-controls']}>
                    {!isRunning ? (
                        <Button
                            type="primary"
                            className={styles['control-btn']}
                            icon={<PlayCircleOutlined/>}
                            onClick={handleStart}
                            loading={loading}
                        />
                    ) : (
                        <>
                            {!isPaused ? (
                                <Button
                                    className={styles['control-btn']}
                                    icon={<PauseCircleOutlined/>}
                                    onClick={handlePause}
                                />
                            ) : (
                                <Button
                                    type="primary"
                                    className={styles['control-btn']}
                                    icon={<PlayCircleOutlined/>}
                                    onClick={handleResume}
                                />
                            )}
                            <Button
                                type="primary"
                                className={styles['control-btn']}
                                icon={<CheckCircleOutlined/>}
                                onClick={handleComplete}
                                style={{background: '#52c41a', borderColor: '#52c41a'}}
                            />
                            <Button
                                className={styles['control-btn']}
                                icon={<StopOutlined/>}
                                onClick={() => setInterruptModalVisible(true)}
                            />
                            <Button
                                className={styles['control-btn']}
                                icon={<RedoOutlined/>}
                                onClick={handleReset}
                                danger
                            />
                        </>
                    )}
                </div>
            </div>

            <div className={styles['task-section']}>
                <Card className={styles['current-task-card']} title="关联任务/时间块">
                    <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
                        <div style={{flex: 1}}>
                            <div style={{fontSize: 13, color: '#666', marginBottom: 8}}>选择任务（可选）</div>
                            <Select
                                style={{width: '100%'}}
                                placeholder="选择待办任务"
                                allowClear
                                value={selectedTask?.id}
                                onChange={(value) => {
                                    const task = tasks.find(t => t.id === value)
                                    setSelectedTask(task || null)
                                }}
                                disabled={isRunning}
                            >
                                {tasks.map(task => (
                                    <Select.Option key={task.id} value={task.id}>
                                        {task.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{fontSize: 13, color: '#666', marginBottom: 8}}>选择时间块（可选）</div>
                            <Select
                                style={{width: '100%'}}
                                placeholder="选择今日时间块"
                                allowClear
                                value={selectedTimeBlock?.id}
                                onChange={(value) => {
                                    const block = timeBlocks.find(b => b.id === value)
                                    setSelectedTimeBlock(block || null)
                                }}
                                disabled={isRunning}
                            >
                                {timeBlocks.map(block => (
                                    <Select.Option key={block.id} value={block.id}>
                                        {block.title} ({dayjs(block.startTime).format('HH:mm')}-{dayjs(block.endTime).format('HH:mm')})
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    {(selectedTask || selectedTimeBlock) && (
                        <div className={styles['task-info']}>
                            {selectedTask && (
                                <>
                                    <div className={styles['task-name']}>任务: {selectedTask.title}</div>
                                    <div className={styles['task-meta']}>
                                        {selectedTask.estimatedMinutes && (
                                            <span>预计: {selectedTask.estimatedMinutes}分钟</span>
                                        )}
                                        {selectedTask.priority && (
                                            <Tag color={selectedTask.priority <= 2 ? 'red' : 'blue'}>
                                                {selectedTask.priority === 1 ? '重要且紧急' :
                                                    selectedTask.priority === 2 ? '重要不紧急' :
                                                        selectedTask.priority === 3 ? '不重要但紧急' : '不重要不紧急'}
                                            </Tag>
                                        )}
                                    </div>
                                </>
                            )}
                            {selectedTimeBlock && (
                                <>
                                    <div className={styles['task-name']}>时间块: {selectedTimeBlock.title}</div>
                                    <div className={styles['task-meta']}>
                                        <span>
                                            {dayjs(selectedTimeBlock.startTime).format('HH:mm')} - {dayjs(selectedTimeBlock.endTime).format('HH:mm')}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {!selectedTask && !selectedTimeBlock && (
                        <div className={styles['no-task']}>
                            可以选择关联任务或时间块，以便更好地统计您的专注时间
                        </div>
                    )}
                </Card>

                <Card className={styles['stats-card']} title="今日统计">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Statistic
                                title="专注次数"
                                value={todayStats.totalSessions}
                                valueStyle={{fontSize: 24}}
                            />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="完成次数"
                                value={todayStats.completedSessions}
                                valueStyle={{fontSize: 24, color: '#52c41a'}}
                            />
                        </Col>
                        <Col span={24}>
                            <Statistic
                                title="总专注时长"
                                value={todayStats.totalMinutes}
                                suffix="分钟"
                                valueStyle={{fontSize: 20}}
                            />
                        </Col>
                    </Row>
                </Card>
            </div>

            <div className={styles['history-section']}>
                <div className={styles['section-title']}>今日专注记录</div>
                {history.length > 0 ? (
                    <div className={styles['history-list']}>
                        {history.map(record => (
                            <div key={record.id} className={styles['history-item']}>
                                <div className={styles['item-left']}>
                                    <div className={styles['item-title']}>
                                        {record.taskId ? `关联任务` : `自由专注`}
                                    </div>
                                    <div className={styles['item-time']}>
                                        {dayjs(record.startTime).format('HH:mm')} - {record.endTime ? dayjs(record.endTime).format('HH:mm') : '进行中'}
                                    </div>
                                </div>
                                <div className={styles['item-right']}>
                                    <div className={styles['item-duration']}>
                                        {record.actualMinutes || record.plannedMinutes}分钟
                                    </div>
                                    <span className={`${styles['item-status']} ${styles[getStatusClass(record.status)]}`}>
                                        {PomodoroStatusLabels[record.status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles['no-history']}>
                        今日还没有专注记录，开始您的第一个番茄钟吧！
                    </div>
                )}
            </div>

            <Modal
                title="打断专注"
                open={interruptModalVisible}
                onOk={handleInterrupt}
                onCancel={() => {
                    setInterruptModalVisible(false)
                    setInterruptReason('')
                }}
                okText="确定"
                cancelText="取消"
                className={styles['interrupt-modal']}
            >
                <div className={styles['modal-content']}>
                    <p>请输入打断原因（可选）：</p>
                    <Input.TextArea
                        rows={4}
                        placeholder="例如：被同事打扰、需要处理紧急事件..."
                        value={interruptReason}
                        onChange={(e) => setInterruptReason(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    )
}

export default PomodoroTimer
