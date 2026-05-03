import {useState, useEffect, useCallback, useRef} from 'react';
import {Button, Card, Progress, Statistic, Row, Col, Tag, Select, Space, message} from 'antd';
import {PlayCircleOutlined, TrophyOutlined, ClockCircleOutlined, TagOutlined, RestOutlined} from '@ant-design/icons';
import {
    getRandomArticle,
    saveTestRecord,
    type TypingArticle,
    type SaveTestRecordRequest
} from '../../../apis/modules/typingtest';

const {Option} = Select;

const difficultyOptions = [
    {value: 0, label: '随机'},
    {value: 1, label: '简单'},
    {value: 2, label: '中等'},
    {value: 3, label: '困难'},
];

export default function TypingTestPage() {
    const [article, setArticle] = useState<TypingArticle | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [difficulty, setDifficulty] = useState<number>(0);
    const [stats, setStats] = useState({wpm: 0, accuracy: 100});
    const [showResult, setShowResult] = useState(false);
    const [resultData, setResultData] = useState<{
        wpm: number;
        accuracy: number;
        duration: number;
        correctChars: number;
        totalChars: number;
    } | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        loadArticle();
    }, [difficulty]);

    useEffect(() => {
        if (isStarted && !isFinished) {
            timerRef.current = window.setInterval(() => {
                setCurrentTime(Date.now());
            }, 100);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isStarted, isFinished]);

    useEffect(() => {
        if (article && userInput.length > 0) {
            const correctChars = userInput.split('').filter((char, index) => char === article.content[index]).length;
            const totalChars = userInput.length;
            const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
            const elapsedMinutes = (currentTime - startTime) / 60000;
            const wpm = elapsedMinutes > 0 ? (userInput.length / 5) / elapsedMinutes : 0;
            setStats({wpm: Math.round(wpm), accuracy: Math.round(accuracy)});
        }
    }, [userInput, currentTime, startTime, article]);

    const loadArticle = async () => {
        const selectedDifficulty = difficulty === 0 ? undefined : difficulty;
        const res = await getRandomArticle(selectedDifficulty);
        if (res.data) {
            setArticle(res.data);
            setUserInput('');
            setIsStarted(false);
            setIsFinished(false);
            setStartTime(0);
            setCurrentTime(0);
            setStats({wpm: 0, accuracy: 100});
            setShowResult(false);
            setResultData(null);
        }
    };

    const handleStart = () => {
        setIsStarted(true);
        setStartTime(Date.now());
        setCurrentTime(Date.now());
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setUserInput(value);
        if (article && value.length >= article.content.length) {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsFinished(true);
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        const correctChars = userInput.split('').filter((char, index) => char === article?.content[index]).length;
        const totalChars = userInput.length;
        const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
        const elapsedMinutes = duration / 60;
        const wpm = elapsedMinutes > 0 ? Math.round((userInput.length / 5) / elapsedMinutes) : 0;
        const result = {wpm, accuracy: Math.round(accuracy), duration, correctChars, totalChars};
        setResultData(result);
        setShowResult(true);
        if (article) {
            const recordData: SaveTestRecordRequest = {
                articleId: article.id,
                articleTitle: article.title,
                wpm: wpm,
                accuracy: accuracy,
                typedText: userInput,
                correctChars: correctChars,
                totalChars: totalChars,
                testDuration: duration,
                startTime: startTime,
                endTime: endTime,
            };
            await saveTestRecord(recordData);
            message.success('测试记录已保存');
        }
    };

    const getDifficultyLabel = (level: number) => {
        const labels = {1: '简单', 2: '中等', 3: '困难'};
        return labels[level as keyof typeof labels] || '未知';
    };

    const getDifficultyColor = (level: number) => {
        const colors = {1: 'green', 2: 'yellow', 3: 'red'};
        return colors[level as keyof typeof colors] || 'gray';
    };

    const renderText = useCallback(() => {
        if (!article)
            return null;
        return article.content.split('').map((char, index) => {
            let color = '';
            if (index < userInput.length) {
                color = char === userInput[index] ? 'text-green-500' : 'text-red-500 bg-red-100';
            } else if (index === userInput.length) {
                color = 'bg-blue-100';
            }
            return (<span key={index} className={`inline ${color}`}>
 {char === ' ' ? '\u00A0' : char}
 </span>);
        });
    }, [article, userInput]);

    const progress = article ? (userInput.length / article.content.length) * 100 : 0;

    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="max-w-4xl mx-auto shadow-xl">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">打字速度测试</h1>
                <p className="text-gray-500">选择难度，点击开始，测试你的打字速度！</p>
            </div>

            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Statistic title="当前WPM" value={stats.wpm}
                               prefix={<TrophyOutlined className="text-yellow-500"/>}/>
                </Col>
                <Col span={6}>
                    <Statistic title="准确率" value={stats.accuracy} suffix="%"
                               prefix={<TagOutlined className="text-green-500"/>}/>
                </Col>
                <Col span={6}>
                    <Statistic title="用时" value={isStarted ? Math.round((currentTime - startTime) / 1000) : 0}
                               suffix="秒" prefix={<ClockCircleOutlined className="text-blue-500"/>}/>
                </Col>
                <Col span={6}>
                    <Statistic title="进度" value={Math.round(progress)} suffix="%"/>
                </Col>
            </Row>

            <div className="mb-6">
                <Space className="w-full justify-between">
                    <Select value={difficulty} onChange={(value) => setDifficulty(value)} style={{width: 150}}>
                        {difficultyOptions.map((opt) => (<Option key={opt.value} value={opt.value}>
                            {opt.label}
                        </Option>))}
                    </Select>
                    <Button type="primary" icon={isStarted ? <RestOutlined/> : <PlayCircleOutlined/>}
                            onClick={loadArticle} disabled={isStarted && !isFinished}>
                        {isStarted ? '重新开始' : '换一篇'}
                    </Button>
                </Space>
            </div>

            {article && (<>
                <div className="mb-4 flex items-center gap-2">
                    <Tag color={getDifficultyColor(article.difficulty)}>
                        {getDifficultyLabel(article.difficulty)}
                    </Tag>
                    <span className="text-gray-500 text-sm">{article.category}</span>
                    <span className="text-gray-500 text-sm">|</span>
                    <span className="text-gray-500 text-sm">{article.wordCount}字</span>
                </div>

                <Progress percent={progress} className="mb-6"/>

                <Card className="mb-6" bordered={false}>
                    <div className="text-xl leading-relaxed font-mono min-h-[100px] p-4 bg-gray-50 rounded-lg">
                        {renderText()}
                    </div>
                </Card>

                {!isFinished ? (<Card bordered={false}>
                    {!isStarted ? (
                        <Button type="primary" size="large" icon={<PlayCircleOutlined/>} onClick={handleStart}
                                className="w-full h-16 text-lg">
                            开始测试
                        </Button>) : (<textarea ref={inputRef} value={userInput} onChange={handleInputChange}
                                                className="w-full h-32 p-4 text-lg font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="在这里输入..." autoComplete="off" autoCorrect="off"
                                                autoCapitalize="off" spellCheck={false}/>)}
                </Card>) : null}

                {showResult && resultData && (
                    <Card title="测试结果" bordered={false} className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic title="WPM (每分钟字数)" value={resultData.wpm}
                                           prefix={<TrophyOutlined className="text-yellow-500"/>}
                                           className="text-center"/>
                            </Col>
                            <Col span={8}>
                                <Statistic title="准确率" value={resultData.accuracy} suffix="%"
                                           prefix={<TagOutlined className="text-green-500"/>} className="text-center"/>
                            </Col>
                            <Col span={8}>
                                <Statistic title="用时" value={resultData.duration} suffix="秒"
                                           prefix={<ClockCircleOutlined className="text-blue-500"/>}
                                           className="text-center"/>
                            </Col>
                        </Row>
                        <Row gutter={16} className="mt-4">
                            <Col span={8}>
                                <Statistic title="正确字符" value={resultData.correctChars} className="text-center"/>
                            </Col>
                            <Col span={8}>
                                <Statistic title="总字符" value={resultData.totalChars} className="text-center"/>
                            </Col>
                            <Col span={8}>
                                <Statistic title="错误字符" value={resultData.totalChars - resultData.correctChars}
                                           className="text-center"/>
                            </Col>
                        </Row>
                        <div className="text-center mt-6">
                            <Button type="primary" icon={<RestOutlined/>} onClick={loadArticle}>
                                再来一次
                            </Button>
                        </div>
                    </Card>)}
            </>)}
        </Card>
    </div>);
}

