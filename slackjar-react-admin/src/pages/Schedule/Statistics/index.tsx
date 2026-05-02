import React, {useState, useEffect, useCallback, useRef} from 'react'
import {
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
    Select,
    Spin,
    Tag,
    Empty,
    Table,
    Tabs,
    Badge,
    Progress
} from 'antd'
import {
    ClockCircleOutlined,
    CalendarOutlined,
    TrophyOutlined,
    BarChartOutlined,
    RiseOutlined,
    FireOutlined
} from '@ant-design/icons'
import dayjs, {Dayjs} from 'dayjs'
import {
    getTimeDistribution,
    getFocusTrend,
    getEfficiencyAnalysis,
    TimeDistributionResponse,
    FocusTrendResponse,
    EfficiencyAnalysisResponse,
    TimeBlockTypeLabels,
    TaskPriorityLabels
} from '../../../apis/modules/schedule'
import styles from './index.module.scss'

const {RangePicker} = DatePicker

const TIME_RANGE_OPTIONS = [
    {value: 'week', label: '本周'},
    {value: 'month', label: '本月'},
    {value: 'custom', label: '自定义'}
]

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const Statistics: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [timeRange, setTimeRange] = useState<string>('week')
    const [customRange, setCustomRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(6, 'day'),
        dayjs()
    ])

    const [timeDistribution, setTimeDistribution] = useState<TimeDistributionResponse | null>(null)
    const [focusTrend, setFocusTrend] = useState<FocusTrendResponse | null>(null)
    const [efficiencyAnalysis, setEfficiencyAnalysis] = useState<EfficiencyAnalysisResponse | null>(null)

    const getDateRange = useCallback(() => {
        let start: Dayjs, end: Dayjs

        switch (timeRange) {
            case 'week':
                start = dayjs().startOf('week').add(1, 'day')
                end = dayjs().endOf('week').add(1, 'day')
                break
            case 'month':
                start = dayjs().startOf('month')
                end = dayjs().endOf('month')
                break
            case 'custom':
                start = customRange[0]
                end = customRange[1]
                break
            default:
                start = dayjs().subtract(6, 'day')
                end = dayjs()
        }

        return {
            startTime: start.valueOf(),
            endTime: end.valueOf()
        }
    }, [timeRange, customRange])

    const loadStatistics = useCallback(async () => {
        setLoading(true)
        try {
            const {startTime, endTime} = getDateRange()

            const [distributionRes, trendRes, efficiencyRes] = await Promise.all([
                getTimeDistribution(startTime, endTime),
                getFocusTrend(startTime, endTime),
                getEfficiencyAnalysis(startTime, endTime)
            ])

            if (distributionRes.data) {
                setTimeDistribution(distributionRes.data)
            }
            if (trendRes.data) {
                setFocusTrend(trendRes.data)
            }
            if (efficiencyRes.data) {
                setEfficiencyAnalysis(efficiencyRes.data)
            }
        } catch (error) {
            console.error('加载统计数据失败:', error)
        } finally {
            setLoading(false)
        }
    }, [getDateRange])

    useEffect(() => {
        loadStatistics()
    }, [loadStatistics])

    const PieChart: React.FC<{ data: any[] }> = ({data}) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

        useEffect(() => {
            const canvas = canvasRef.current
            if (!canvas || !data || data.length === 0) return

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const width = canvas.width
            const height = canvas.height
            const centerX = width / 2
            const centerY = height / 2
            const radius = Math.min(centerX, centerY) - 40
            const innerRadius = radius * 0.5

            ctx.clearRect(0, 0, width, height)

            const total = data.reduce((sum, item) => sum + item.minutes, 0)
            if (total === 0) return

            let startAngle = -Math.PI / 2

            data.forEach((item, index) => {
                const percentage = item.minutes / total
                const endAngle = startAngle + percentage * 2 * Math.PI

                ctx.beginPath()
                ctx.moveTo(centerX, centerY)
                ctx.arc(centerX, centerY, radius, startAngle, endAngle)
                ctx.closePath()

                ctx.fillStyle = item.color
                ctx.globalAlpha = hoveredIndex === index ? 1 : 0.85
                ctx.fill()

                ctx.strokeStyle = '#fff'
                ctx.lineWidth = 2
                ctx.globalAlpha = 1
                ctx.stroke()

                startAngle = endAngle
            })

            ctx.beginPath()
            ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
            ctx.fillStyle = '#fff'
            ctx.fill()

            ctx.fillStyle = '#1a1a1a'
            ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${total}`, centerX, centerY - 10)

            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.fillStyle = '#666'
            ctx.fillText('分钟', centerX, centerY + 15)

        }, [data, hoveredIndex])

        if (!data || data.length === 0) {
            return (
                <div className={styles['chart-empty']}>
                    <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            )
        }

        return (
            <div className={styles['pie-chart-container']}>
                <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    className={styles['pie-canvas']}
                />
                <div className={styles['pie-legend']}>
                    {data.map((item, index) => {
                        const total = data.reduce((s, i) => s + i.minutes, 0)
                        const percentage = ((item.minutes / total) * 100).toFixed(1)
                        return (
                            <div
                                key={index}
                                className={`${styles['legend-item']} ${hoveredIndex === index ? styles.hovered : ''}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div
                                    className={styles['legend-color']}
                                    style={{backgroundColor: item.color}}
                                />
                                <span className={styles['legend-label']}>{item.typeName || item.priorityName}</span>
                                <span className={styles['legend-value']}>
                                    {item.minutes}分钟 ({percentage}%)
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const BarChart: React.FC<{ data: any[], labelKey: string; valueKey: string }> = ({data, labelKey, valueKey}) => {
        if (!data || data.length === 0) {
            return (
                <div className={styles['chart-empty']}>
                    <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            )
        }

        const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 1)
        const chartHeight = 200
        const barWidth = Math.min(50, 300 / data.length)
        const gap = 10

        return (
            <div className={styles['bar-chart-container']}>
                <div className={styles['bar-chart']}>
                    {data.map((item, index) => {
                        const value = item[valueKey] || 0
                        const height = (value / maxValue) * chartHeight
                        const x = index * (barWidth + gap) + gap

                        return (
                            <div key={index} className={styles['bar-column']}>
                                <div className={styles['bar-value']}>{value}</div>
                                <div className={styles['bar-wrapper']} style={{height: chartHeight}}>
                                    <div
                                        className={styles['bar-rect']}
                                        style={{
                                            height: Math.max(2, height),
                                            width: barWidth,
                                            bottom: 0
                                        }}
                                    />
                                </div>
                                <div className={styles['bar-label']}>{item[labelKey]}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const HeatMapChart: React.FC<{ data: any[] }> = ({data}) => {
        if (!data || data.length === 0) {
            return (
                <div className={styles['chart-empty']}>
                    <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            )
        }

        const hours = Array.from({length: 24}, (_, i) => i)
        const days = Array.from({length: 7}, (_, i) => i + 1)

        const maxFocus = Math.max(...data.map(d => d.focusMinutes || 0), 1)

        const getColor = (minutes: number) => {
            const intensity = minutes / maxFocus
            if (intensity === 0) return '#f5f5f5'
            if (intensity < 0.25) return '#e6f7ff'
            if (intensity < 0.5) return '#91d5ff'
            if (intensity < 0.75) return '#40a9ff'
            return '#1890ff'
        }

        return (
            <div className={styles['heatmap-container']}>
                <div className={styles['heatmap-header']}>
                    <div className={styles['heatmap-corner']}></div>
                    {hours.slice(8, 22).map(h => (
                        <div key={h} className={styles['heatmap-hour']}>{h}:00</div>
                    ))}
                </div>
                {days.map(day => {
                    const dayData = data.find(d => d.dayOfWeek === day)
                    return (
                        <div key={day} className={styles['heatmap-row']}>
                            <div className={styles['heatmap-day-label']}>{DAY_NAMES[day - 1]}</div>
                            {hours.slice(8, 22).map(hour => {
                                const hourData = efficiencyAnalysis?.hourlyEfficiency?.find(h => h.hour === hour)
                                const minutes = hourData?.focusMinutes || 0
                                return (
                                    <div
                                        key={hour}
                                        className={styles['heatmap-cell']}
                                        style={{backgroundColor: getColor(minutes)}}
                                        title={`${DAY_NAMES[day - 1]} ${hour}:00 - ${minutes}分钟`}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
                <div className={styles['heatmap-legend']}>
                    <span>少</span>
                    {[0.25, 0.5, 0.75, 1].map((intensity, i) => (
                        <div
                            key={i}
                            className={styles['heatmap-legend-color']}
                            style={{
                                backgroundColor: intensity === 0 ? '#f5f5f5' :
                                    intensity < 0.25 ? '#e6f7ff' :
                                    intensity < 0.5 ? '#91d5ff' :
                                    intensity < 0.75 ? '#40a9ff' : '#1890ff'
                            }}
                        />
                    ))}
                    <span>多</span>
                </div>
            </div>
        )
    }

    const trendColumns = [
        {
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            render: (text: string) => <span>{text}</span>
        },
        {
            title: '专注时长',
            dataIndex: 'focusMinutes',
            key: 'focusMinutes',
            render: (v: number) => <Tag color="blue">{v || 0} 分钟</Tag>
        },
        {
            title: '专注次数',
            dataIndex: 'sessionCount',
            key: 'sessionCount',
            render: (v: number) => <span>{v || 0} 次</span>
        },
        {
            title: '完成次数',
            dataIndex: 'completedCount',
            key: 'completedCount',
            render: (v: number, record: any) => {
                const total = record.sessionCount || 1
                const rate = ((v / total) * 100).toFixed(0)
                return (
                    <span>
                        {v || 0} 次
                        <Tag color={Number(rate) >= 80 ? 'green' : Number(rate) >= 50 ? 'orange' : 'red'}>
                            {rate}%
                        </Tag>
                    </span>
                )
            }
        }
    ]

    return (
        <div className={styles['statistics-container']}>
            <div className={styles.header}>
                <div className={styles.title}>统计分析</div>
                <div className={styles['filter-bar']}>
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        style={{width: 120}}
                    >
                        {TIME_RANGE_OPTIONS.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>
                                {opt.label}
                            </Select.Option>
                        ))}
                    </Select>
                    {timeRange === 'custom' && (
                        <RangePicker
                            value={customRange}
                            onChange={(dates) => dates && setCustomRange(dates as [Dayjs, Dayjs])}
                        />
                    )}
                </div>
            </div>

            <Spin spinning={loading}>
                <div className={styles.content}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={12} md={6}>
                            <Card className={styles['stat-card']}>
                                <Statistic
                                    title="总专注时长"
                                    value={focusTrend?.totalFocusMinutes || 0}
                                    suffix="分钟"
                                    prefix={<ClockCircleOutlined/>}
                                    valueStyle={{color: '#1890ff'}}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <Card className={styles['stat-card']}>
                                <Statistic
                                    title="专注次数"
                                    value={focusTrend?.totalSessions || 0}
                                    suffix="次"
                                    prefix={<CalendarOutlined/>}
                                    valueStyle={{color: '#52c41a'}}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <Card className={styles['stat-card']}>
                                <Statistic
                                    title="平均每次时长"
                                    value={focusTrend?.averageMinutesPerSession || 0}
                                    suffix="分钟"
                                    prefix={<BarChartOutlined/>}
                                    valueStyle={{color: '#722ed1'}}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <Card className={styles['stat-card']}>
                                <Statistic
                                    title="完成率"
                                    value={((focusTrend?.completionRate || 0) * 100).toFixed(0)}
                                    suffix="%"
                                    prefix={<TrophyOutlined/>}
                                    valueStyle={{color: '#fa8c16'}}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Tabs
                        items={[
                            {
                                key: 'distribution',
                                label: '时间分配',
                                children: (
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} lg={12}>
                                            <Card title="按类型分配" className={styles['chart-card']}>
                                                <PieChart
                                                    data={timeDistribution?.typeDistributions?.map(d => ({
                                                        ...d,
                                                        color: d.color || TimeBlockTypeLabels[d.blockType]?.color || '#95A5A6'
                                                    })) || []}
                                                />
                                            </Card>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Card title="按优先级分配" className={styles['chart-card']}>
                                                <PieChart
                                                    data={timeDistribution?.priorityDistributions?.map(d => ({
                                                        ...d,
                                                        color: d.color || TaskPriorityLabels[d.priority]?.color || '#95A5A6'
                                                    })) || []}
                                                />
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: 'trend',
                                label: '专注趋势',
                                children: (
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24}>
                                            <Card title="每日专注时长趋势" className={styles['chart-card']}>
                                                <BarChart
                                                    data={focusTrend?.dailyItems || []}
                                                    labelKey="date"
                                                    valueKey="focusMinutes"
                                                />
                                            </Card>
                                        </Col>
                                        <Col xs={24}>
                                            <Card title="详细记录" className={styles['table-card']}>
                                                <Table
                                                    columns={trendColumns}
                                                    dataSource={focusTrend?.dailyItems?.map((item, index) => ({
                                                        ...item,
                                                        key: index
                                                    })) || []}
                                                    pagination={false}
                                                    size="small"
                                                />
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: 'efficiency',
                                label: '效率分析',
                                children: (
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} lg={12}>
                                            <Card title="效率概览" className={styles['chart-card']}>
                                                <div className={styles['efficiency-summary']}>
                                                    <div className={styles['efficiency-item']}>
                                                        <div className={styles['efficiency-label']}>计划效率</div>
                                                        <Progress
                                                            type="circle"
                                                            percent={((efficiencyAnalysis?.plannedEfficiency || 0) * 100)}
                                                            format={(percent) => `${percent?.toFixed(0)}%`}
                                                            size={100}
                                                        />
                                                    </div>
                                                    <div className={styles['efficiency-item']}>
                                                        <div className={styles['efficiency-label']}>实际效率</div>
                                                        <Progress
                                                            type="circle"
                                                            percent={((efficiencyAnalysis?.actualEfficiency || 0) * 100)}
                                                            format={(percent) => `${percent?.toFixed(0)}%`}
                                                            size={100}
                                                            status={Number(efficiencyAnalysis?.actualEfficiency || 0) >= 0.8 ? 'success' : 'active'}
                                                        />
                                                    </div>
                                                    <div className={styles['efficiency-item']}>
                                                        <div className={styles['efficiency-label']}>任务完成</div>
                                                        <div className={styles['efficiency-value']}>
                                                            <span className={styles['efficiency-count']}>
                                                                {efficiencyAnalysis?.completedTaskCount || 0}
                                                            </span>
                                                            <span className={styles['efficiency-divider']}>/</span>
                                                            <span>{efficiencyAnalysis?.totalTaskCount || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Card title="最佳时段" className={styles['chart-card']}>
                                                <div className={styles['best-time']}>
                                                    <div className={styles['best-time-item']}>
                                                        <RiseOutlined className={styles['best-time-icon']}/>
                                                        <div>
                                                            <div className={styles['best-time-label']}>最高效时段</div>
                                                            <div className={styles['best-time-value']}>
                                                                {efficiencyAnalysis?.mostProductiveHour || '--'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles['best-time-item']}>
                                                        <FireOutlined className={styles['best-time-icon']}/>
                                                        <div>
                                                            <div className={styles['best-time-label']}>最高效星期</div>
                                                            <div className={styles['best-time-value']}>
                                                                {efficiencyAnalysis?.mostProductiveDay || '--'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                        <Col xs={24}>
                                            <Card title="时段专注热力图" className={styles['chart-card']}>
                                                <HeatMapChart
                                                    data={efficiencyAnalysis?.dailyEfficiency || []}
                                                />
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            }
                        ]}
                    />
                </div>
            </Spin>
        </div>
    )
}

export default Statistics
