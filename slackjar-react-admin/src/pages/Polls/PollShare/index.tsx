import { useState, useEffect } from 'react'
import { Button, Card, Tag, Space, Radio, Checkbox, message } from 'antd'
import { useParams, useNavigate } from 'react-router'
import { getPollByShareCode, submitVote, type PollDetailResponse } from '../../../apis/modules/polls'

function PollShare() {
    const { shareCode } = useParams<{ shareCode: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [poll, setPoll] = useState<PollDetailResponse | null>(null)
    const [selectedOptions, setSelectedOptions] = useState<Map<number, number[]>>(new Map())
    const [hasVoted, setHasVoted] = useState(false)

    useEffect(() => {
        if (shareCode) {
            loadPoll()
        }
    }, [shareCode])

    const loadPoll = async () => {
        setLoading(true)
        try {
            const res = await getPollByShareCode(shareCode!)
            if (res.data) {
                setPoll(res.data)
            }
        } catch (e: any) {
            if (e.response?.data?.code === 1502) {
                setHasVoted(true)
            } else {
                message.error('加载投票失败')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSelect = (questionId: number, optionId: number, isMultiple: boolean) => {
        const current = selectedOptions.get(questionId) || []
        
        if (isMultiple) {
            const index = current.indexOf(optionId)
            if (index > -1) {
                current.splice(index, 1)
            } else {
                current.push(optionId)
            }
        } else {
            current.length = 0
            current.push(optionId)
        }
        
        setSelectedOptions(new Map(selectedOptions.set(questionId, [...current])))
    }

    const handleSubmit = async () => {
        if (!poll) return

        const requiredQuestions = poll.questions.filter(q => q.isRequired === 1)
        for (const q of requiredQuestions) {
            const selected = selectedOptions.get(q.id) || []
            if (selected.length === 0) {
                message.error(`问题"${q.questionText}"为必填项`)
                return
            }
        }

        setSubmitting(true)
        try {
            const votes = poll.questions.map(q => ({
                questionId: q.id,
                optionIds: selectedOptions.get(q.id) || []
            })).filter(v => v.optionIds.length > 0)

            await submitVote({
                shareCode: poll.shareCode,
                votes
            })

            message.success('投票成功')
            setTimeout(() => {
                navigate('/polls/statistics/' + poll.id)
            }, 1500)
        } catch (e: any) {
            if (e.response?.data?.code === 1502) {
                message.error('您已参与过此投票')
            } else if (e.response?.data?.code === 1500) {
                message.error('投票已关闭')
            } else if (e.response?.data?.code === 1501) {
                message.error('投票已过期')
            } else {
                message.error('投票失败')
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div>加载中...</div>
    }

    if (hasVoted) {
        return (
            <Card title="投票提示">
                <p>您已参与过此投票，感谢您的参与！</p>
            </Card>
        )
    }

    if (!poll) {
        return <div>未找到投票</div>
    }

    const isExpired = poll.deadline && Date.now() > poll.deadline
    const isClosed = poll.status !== 1

    if (isClosed || isExpired) {
        return (
            <Card title="投票状态">
                <Tag color="red">{isExpired ? '投票已过期' : '投票已关闭'}</Tag>
                <p style={{ marginTop: 16 }}>该投票当前不可参与</p>
            </Card>
        )
    }

    return (
        <Card title={poll.title}>
            {poll.description && <p style={{ marginBottom: 16 }}>{poll.description}</p>}

            <Space style={{ marginBottom: 16 }}>
                <Tag color="green">进行中</Tag>
                <span>总投票数: {poll.totalVotes}</span>
            </Space>

            {poll.deadline && (
                <p style={{ marginBottom: 16 }}>截止时间: {new Date(poll.deadline).toLocaleString('zh-CN')}</p>
            )}

            <div style={{ marginTop: 32 }}>
                {poll.questions.map((question, index) => (
                    <Card key={question.id} title={`问题 ${index + 1}`} style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 16 }}>
                            <span>{question.questionText}</span>
                            {question.isRequired === 1 && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>* 必填</span>}
                            <span style={{ marginLeft: 8, color: '#6b7280' }}>- {question.questionTypeName}</span>
                        </div>

                        {question.questionType === 1 ? (
                            <Radio.Group
                                value={selectedOptions.get(question.id)?.[0]}
                                onChange={(e) => handleOptionSelect(question.id, e.target.value, false)}
                            >
                                {question.options.map((option) => (
                                    <Radio key={option.id} value={option.id}>
                                        {option.optionText}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        ) : (
                            <Checkbox.Group
                                value={selectedOptions.get(question.id) || []}
                                onChange={(values) => {
                                    setSelectedOptions(new Map(selectedOptions.set(question.id, values)))
                                }}
                            >
                                {question.options.map((option) => (
                                    <Checkbox key={option.id} value={option.id}>
                                        {option.optionText}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        )}
                    </Card>
                ))}
            </div>

            <Button type="primary" loading={submitting} onClick={handleSubmit} style={{ marginTop: 16, width: '100%' }}>
                提交投票
            </Button>
        </Card>
    )
}

export default PollShare