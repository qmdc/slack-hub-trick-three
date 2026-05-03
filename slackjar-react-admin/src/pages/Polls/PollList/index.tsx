import { useState, useEffect } from 'react'
import { Button, Table, Tag, Space, Popconfirm, message, Card, Input, Select } from 'antd'
import { PlusOutlined, EyeOutlined, BarChartOutlined, CopyOutlined, PauseCircleOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnType } from 'antd/es/table'
import { useNavigate } from 'react-router'
import { pageQueryPolls, deletePoll, updatePollStatus, type PollSurvey } from '../../../apis/modules/polls'
import type { PageResult } from '../../../apis/modules/types'

const { Search } = Input
const { Option } = Select

function PollList() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<PollSurvey[]>([])
    const [pagination, setPagination] = useState({ pageNo: 1, pageSize: 10, total: 0 })
    const [searchTitle, setSearchTitle] = useState('')
    const [searchStatus, setSearchStatus] = useState<number | undefined>()

    const columns: ColumnType<PollSurvey>[] = [
        {
            title: '问卷标题',
            dataIndex: 'title',
            ellipsis: true,
            width: 200
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (status) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? '开启' : '关闭'}
                </Tag>
            )
        },
        {
            title: '总投票数',
            dataIndex: 'totalVotes',
            width: 80
        },
        {
            title: '截止时间',
            dataIndex: 'deadline',
            width: 150,
            render: (deadline) => {
                if (!deadline) return '无限制'
                const date = new Date(deadline)
                return date.toLocaleString('zh-CN')
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: 150,
            render: (time) => {
                const date = new Date(time)
                return date.toLocaleString('zh-CN')
            }
        },
        {
            title: '操作',
            width: 300,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/polls/detail/${record.id}`)}
                    >
                        详情
                    </Button>
                    <Button
                        type="link"
                        icon={<BarChartOutlined />}
                        onClick={() => navigate(`/polls/statistics/${record.id}`)}
                    >
                        统计
                    </Button>
                    <Button
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => copyShareUrl(record.shareCode)}
                    >
                        分享链接
                    </Button>
                    <Button
                        type="link"
                        icon={record.status === 1 ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={() => toggleStatus(record.id, record.status)}
                    >
                        {record.status === 1 ? '关闭' : '开启'}
                    </Button>
                    <Popconfirm
                        title="确定删除此投票吗？"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await pageQueryPolls({
                pageNo: pagination.pageNo,
                pageSize: pagination.pageSize,
                title: searchTitle || undefined,
                status: searchStatus
            })
            const data = res.data
            if (data) {
                setData(data.list || [])
                setPagination(prev => ({
                    ...prev,
                    total: data.total
                }))
            }
        } catch (e) {
            message.error('加载失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [pagination.pageNo, pagination.pageSize])

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageNo: 1 }))
        loadData()
    }

    const handleDelete = async (id: number) => {
        try {
            await deletePoll(id)
            message.success('删除成功')
            loadData()
        } catch (e) {
            message.error('删除失败')
        }
    }

    const toggleStatus = async (id: number, status: number) => {
        try {
            await updatePollStatus(id, status === 1 ? 0 : 1)
            message.success(status === 1 ? '已关闭' : '已开启')
            loadData()
        } catch (e) {
            message.error('操作失败')
        }
    }

    const copyShareUrl = (shareCode: string) => {
        const url = `${window.location.origin}/polls/share/${shareCode}`
        navigator.clipboard.writeText(url)
        message.success('分享链接已复制')
    }

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination({ pageNo: page, pageSize, total: pagination.total })
    }

    return (
        <Card
            title="投票问卷列表"
            extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/polls/create')}>
                    创建投票
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }}>
                <Search
                    placeholder="搜索标题"
                    allowClear
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Select
                    placeholder="选择状态"
                    allowClear
                    value={searchStatus}
                    onChange={(value) => setSearchStatus(value)}
                    style={{ width: 120 }}
                >
                    <Option value={1}>开启</Option>
                    <Option value={0}>关闭</Option>
                </Select>
                <Button onClick={handleSearch}>搜索</Button>
            </Space>
            <Table
                loading={loading}
                dataSource={data}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: pagination.pageNo,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handlePageChange
                }}
            />
        </Card>
    )
}

export default PollList