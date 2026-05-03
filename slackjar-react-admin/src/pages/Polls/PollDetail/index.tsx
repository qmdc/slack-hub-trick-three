import { useState, useEffect } from 'react'
import { Button, Card, Tag, Space, Progress, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, BarChartOutlined, CopyOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router'
import { getPollDetail } from '../../../apis/modules/polls'
import type { PollDetailResponse } from '../../../apis/modules/polls'

function PollDetail() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(false)
    const [poll, setPoll] = useState<PollDetailResponse | null>(null)

    useEffect(() => {
        if (id) {
            loadDetail(parseInt(id))
        }
    }, [id])

    const loadDetail = async (pollId: number) => {
        setLoading(true)
        try {
            const res = await getPollDetail(pollId)
            if (res.data) {
                setPoll(res.data)
            }
        } catch (e) {
            message.error('加载失败')
        } finally {
            setLoading(false)
        }
    }

    const copyShareUrl = () => {
        if (poll) {
            navigator.clipboard.writeText(poll.shareUrl)
            message.success('分享链接已复制')
        }
    }

    if (loading) {
        return <div>加载中...</div>
    }

    if (!poll) {
        return <div>未找到投票</div>
    }

    const isExpired = poll.deadline && Date.now() > poll.deadline

    return (
        <Card
            extra={
                <Space>
                    <Button type="link" icon={<CopyOutlined />} onClick={copyShareUrl}>
                        复制分享链接
                    </Button>
                    <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/polls/create/${poll.id}`)}>
                        编辑
                    </Button>
                    <Button type="link" icon={<BarChartOutlined />} onClick={() => navigate(`/polls/statistics/${poll.id}`)}>
                        查看统计
                    </Button>
                </Space>
            }
        >
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/polls')} style={{ marginBottom: 16 }}>
                返回列表
            </Button>

            <h1>{poll.title}</h1>
            {poll.description && <p style={{ margin: '16px 0' }}>{poll.description}</p>}

            <Space style={{ marginBottom: 16 }}>
                <Tag color={poll.status === 1 ? 'green' : 'red'}>
                    {poll.status === 1 ? '开启' : '关闭'}
                </Tag>
                {isExpired && <Tag color="orange">已过期</Tag>}
                <span>总投票数: {poll.totalVotes}</span>
                <span>创建人: {poll.createdByNickname}</span>
            </Space>

            {poll.deadline && (
                <p>截止时间: {new Date(poll.deadline).toLocaleString('zh-CN')}</p>
            )}

            <div style={{ marginTop: 32 }}>
                {poll.questions.map((question, index) => (
                    <Card key={question.id} title={`问题 ${index + 1}: ${question.questionText}`} style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                            <span>{question.questionTypeName}</span>
                            {question.isRequired === 1 && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>* 必填</span>}
                        </div>

                        {question.options.map((option) => (
                            <div key={option.id} style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>{option.optionText}</span>
                                    <span>{option.voteCount} 票 ({option.percentage.toFixed(1)}%)</span>
                                </div>
                                <Progress
                                    percent={option.percentage}
                                    strokeColor={{
                                        '0%': '#10b981',
                                        '100%': '#3b82f6'
                                    }}
                                    showInfo={false}
                                />
                            </div>
                        ))}
                    </Card>
                ))}
            </div>
        </Card>
    )
}

export default PollDetail