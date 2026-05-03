import { useState, useEffect, useRef } from 'react'
import { Button, Card, Tag, Space, message, Progress } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router'
import { getPollStatistics } from '../../../apis/modules/polls'
import type { PollStatisticsResponse } from '../../../apis/modules/polls'

function PollStatistics() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(false)
    const [statistics, setStatistics] = useState<PollStatisticsResponse | null>(null)
    const chartRefs = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        if (id) {
            loadStatistics(parseInt(id))
        }
    }, [id])

    useEffect(() => {
        if (statistics) {
            drawCharts()
        }
    }, [statistics])

    const loadStatistics = async (pollId: number) => {
        setLoading(true)
        try {
            const res = await getPollStatistics(pollId)
            if (res.data) {
                setStatistics(res.data)
            }
        } catch (e) {
            message.error('加载失败')
        } finally {
            setLoading(false)
        }
    }

    const drawCharts = () => {
        chartRefs.current.forEach((ref, index) => {
            if (ref && statistics) {
                const questionStats = statistics.questionStatistics[index]
                if (questionStats) {
                    drawPieChart(ref, questionStats.optionStatistics)
                }
            }
        })
    }

    const drawPieChart = (container: HTMLDivElement, options: { optionId: number; optionText: string; voteCount: number; percentage: number }[]) => {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 200
        container.innerHTML = ''
        container.appendChild(canvas)

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
        let startAngle = 0

        options.forEach((option, index) => {
            const sliceAngle = (option.percentage / 100) * Math.PI * 2
            ctx.beginPath()
            ctx.moveTo(100, 100)
            ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle)
            ctx.closePath()
            ctx.fillStyle = colors[index % colors.length]
            ctx.fill()
            startAngle += sliceAngle
        })

        ctx.beginPath()
        ctx.arc(100, 100, 50, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()

        ctx.fillStyle = '#333'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${statistics?.totalVotes || 0}`, 100, 95)
        ctx.font = '12px Arial'
        ctx.fillText('总票数', 100, 115)
    }

    if (loading) {
        return <div>加载中...</div>
    }

    if (!statistics) {
        return <div>未找到统计数据</div>
    }

    return (
        <Card title={`投票统计 - ${statistics.title}`}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/polls')} style={{ marginBottom: 16 }}>
                返回列表
            </Button>

            <Space style={{ marginBottom: 16 }}>
                <Tag color={statistics.isExpired ? 'orange' : 'green'}>
                    {statistics.isExpired ? '已结束' : '进行中'}
                </Tag>
                <span>总投票数: {statistics.totalVotes}</span>
                {statistics.deadline && (
                    <span>截止时间: {new Date(statistics.deadline).toLocaleString('zh-CN')}</span>
                )}
            </Space>

            <div style={{ marginTop: 32 }}>
                {statistics.questionStatistics.map((questionStats, index) => (
                    <Card key={questionStats.questionId} title={`问题 ${index + 1}: ${questionStats.questionText}`} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                            <div ref={(el) => { if (el) chartRefs.current[index] = el }} style={{ width: 200, height: 200 }} />
                            
                            <div style={{ flex: 1, minWidth: 300 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <span style={{ color: '#6b7280' }}>{questionStats.questionTypeName}</span>
                                    <span style={{ marginLeft: 16 }}>本问题票数: {questionStats.totalVotes}</span>
                                </div>
                                
                                {questionStats.optionStatistics.map((optionStats) => (
                                    <div key={optionStats.optionId} style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span>{optionStats.optionText}</span>
                                            <span>{optionStats.voteCount} 票 ({optionStats.percentage.toFixed(1)}%)</span>
                                        </div>
                                        <Progress
                                            percent={optionStats.percentage}
                                            strokeColor={{
                                                '0%': '#3b82f6',
                                                '50%': '#10b981',
                                                '100%': '#f59e0b'
                                            }}
                                            showInfo={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    )
}

export default PollStatistics