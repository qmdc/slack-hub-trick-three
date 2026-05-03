import { useState, useEffect } from 'react'
import { Button, Card, Form, Input, Select, DatePicker, Space, message } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router'
import { savePoll, getPollDetail, type PollSaveRequest } from '../../../apis/modules/polls'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

function PollCreate() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (id) {
            loadPollDetail(parseInt(id))
        }
    }, [id])

    const loadPollDetail = async (pollId: number) => {
        try {
            const res = await getPollDetail(pollId)
            if (res.data) {
                const { title, description, deadline, questions } = res.data
                form.setFieldsValue({
                    title,
                    description,
                    deadline: deadline ? dayjs(deadline) : undefined,
                    questions: questions.map(q => ({
                        ...q,
                        options: q.options.map(o => ({ ...o }))
                    }))
                })
            }
        } catch (e) {
            message.error('加载失败')
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            const deadline = values.deadline ? values.deadline.valueOf() : undefined
            
            const request: PollSaveRequest = {
                id: id ? parseInt(id) : undefined,
                title: values.title,
                description: values.description,
                deadline,
                questions: values.questions.map((q: any) => ({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    isRequired: q.isRequired,
                    options: q.options.map((o: any) => ({
                        id: o.id,
                        optionText: o.optionText
                    }))
                }))
            }

            setLoading(true)
            await savePoll(request)
            message.success(id ? '更新成功' : '创建成功')
            navigate('/polls')
        } catch (e) {
            message.error('提交失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card title={id ? '编辑投票' : '创建投票'}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    questions: [{ questionType: 1, isRequired: 1, options: [{ optionText: '' }, { optionText: '' }] }]
                }}
            >
                <Form.Item
                    label="问卷标题"
                    name="title"
                    rules={[{ required: true, message: '请输入标题' }]}
                >
                    <Input placeholder="请输入问卷标题" />
                </Form.Item>

                <Form.Item label="问卷描述" name="description">
                    <TextArea placeholder="请输入问卷描述（可选）" rows={3} />
                </Form.Item>

                <Form.Item label="截止时间" name="deadline">
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="选择截止时间（可选）"
                        format="YYYY-MM-DD HH:mm:ss"
                    />
                </Form.Item>

                <Form.List name="questions">
                    {(fields, { add, remove }) => (
                        <div>
                            {fields.map((field, index) => (
                                <Card key={field.key} title={`问题 ${index + 1}`} style={{ marginBottom: 16 }}>
                                    <Form.Item
                                        label="问题内容"
                                        {...field}
                                        name={[field.name, 'questionText']}
                                        rules={[{ required: true, message: '请输入问题内容' }]}
                                    >
                                        <Input placeholder="请输入问题内容" />
                                    </Form.Item>

                                    <Space>
                                        <Form.Item
                                            label="问题类型"
                                            {...field}
                                            name={[field.name, 'questionType']}
                                            rules={[{ required: true }]}
                                        >
                                            <Select defaultValue={1}>
                                                <Option value={1}>单选</Option>
                                                <Option value={2}>多选</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label="是否必填"
                                            {...field}
                                            name={[field.name, 'isRequired']}
                                            rules={[{ required: true }]}
                                        >
                                            <Select defaultValue={1}>
                                                <Option value={1}>是</Option>
                                                <Option value={0}>否</Option>
                                            </Select>
                                        </Form.Item>

                                        {fields.length > 1 && (
                                            <Button
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(field.name)}
                                            >
                                                删除问题
                                            </Button>
                                        )}
                                    </Space>

                                    <Form.List name={[field.name, 'options']}>
                                        {(optionFields, { add: addOption, remove: removeOption }) => (
                                            <div>
                                                {optionFields.map((optionField, optionIndex) => (
                                                    <Space key={optionField.key} style={{ marginTop: 8 }}>
                                                        <Form.Item
                                                            {...optionField}
                                                            name={[optionField.name, 'optionText']}
                                                            rules={[{ required: true, message: '请输入选项内容' }]}
                                                        >
                                                            <Input placeholder={`选项 ${optionIndex + 1}`} style={{ width: 300 }} />
                                                        </Form.Item>
                                                        {optionFields.length > 1 && (
                                                            <Button
                                                                danger
                                                                icon={<MinusCircleOutlined />}
                                                                onClick={() => removeOption(optionField.name)}
                                                            />
                                                        )}
                                                    </Space>
                                                ))}
                                                <Button
                                                    type="dashed"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => addOption()}
                                                    style={{ marginTop: 8 }}
                                                >
                                                    添加选项
                                                </Button>
                                            </div>
                                        )}
                                    </Form.List>
                                </Card>
                            ))}
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => add({ questionType: 1, isRequired: 1, options: [{ optionText: '' }, { optionText: '' }] })}
                                style={{ marginBottom: 16 }}
                            >
                                添加问题
                            </Button>
                        </div>
                    )}
                </Form.List>

                <Space>
                    <Button type="primary" loading={loading} onClick={handleSubmit}>
                        {id ? '保存修改' : '创建投票'}
                    </Button>
                    <Button onClick={() => navigate('/polls')}>取消</Button>
                </Space>
            </Form>
        </Card>
    )
}

export default PollCreate