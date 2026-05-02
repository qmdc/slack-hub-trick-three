import React, {useState, useEffect} from 'react';
import {
    Table,
    Card,
    Select,
    Spin,
    Empty,
    Button,
    message,
} from 'antd';
import {
    TrophyOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import {
    pageQueryLeaderboard,
    getAvailableMaps,
    type LeaderboardItem,
    type TdMap,
    type LeaderboardPageQuery,
} from '../../../apis/modules/towerdefense';
import './Leaderboard.module.scss';
import type {ColumnsType} from 'antd/es/table';

// ============================================
// 组件实现
// ============================================
const Leaderboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [maps, setMaps] = useState<TdMap[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<number | undefined>();
    const [data, setData] = useState<LeaderboardItem[]>([]);
    const [total, setTotal] = useState(0);
    const [pageNo, setPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        loadMaps();
    }, []);

    useEffect(() => {
        loadLeaderboard();
    }, [selectedMapId, pageNo, pageSize]);

    const loadMaps = async () => {
        try {
            const res = await getAvailableMaps();
            if (res.data) {
                setMaps(res.data);
                if (res.data.length > 0) {
                    setSelectedMapId(res.data[0].id);
                }
            }
        } catch (error) {
            message.error('加载地图列表失败');
        }
    };

    const loadLeaderboard = async () => {
        if (!selectedMapId) return;

        setLoading(true);
        try {
            const query: LeaderboardPageQuery = {
                pageNo,
                pageSize,
                mapId: selectedMapId,
            };

            const res = await pageQueryLeaderboard(query);
            if (res.data) {
                setData(res.data.list || []);
                setTotal(res.data.total);
            }
        } catch (error) {
            message.error('加载排行榜失败');
        } finally {
            setLoading(false);
        }
    };

    const formatPlayTime = (ms: number | undefined) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        }
        if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        }
        return `${seconds}秒`;
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <span style={{color: '#ffd700', fontSize: 18}}>🥇</span>;
            case 2:
                return <span style={{color: '#c0c0c0', fontSize: 18}}>🥈</span>;
            case 3:
                return <span style={{color: '#cd7f32', fontSize: 18}}>🥉</span>;
            default:
                return <span style={{color: '#888'}}>{rank}</span>;
        }
    };

    const columns: ColumnsType<LeaderboardItem> = [
        {
            title: '排名',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (rank: number) => getRankIcon(rank),
        },
        {
            title: '玩家',
            key: 'player',
            render: (_, record) => record.nickname || record.username || `用户${record.userId}`,
        },
        {
            title: '最高波次',
            dataIndex: 'maxWaveReached',
            key: 'maxWaveReached',
            render: (wave: number) => (
                <span style={{color: '#44aaff', fontWeight: 'bold'}}>
                    第 {wave} 波
                </span>
            ),
        },
        {
            title: '击杀敌人',
            dataIndex: 'enemiesKilled',
            key: 'enemiesKilled',
        },
        {
            title: '获得金币',
            dataIndex: 'totalGoldEarned',
            key: 'totalGoldEarned',
        },
        {
            title: '游戏时长',
            dataIndex: 'playTime',
            key: 'playTime',
            render: formatPlayTime,
        },
    ];

    return (
        <div className="leaderboard-page">
            <Card
                title={
                    <span>
                        <TrophyOutlined style={{marginRight: 8}}/>
                        排行榜
                    </span>
                }
                extra={
                    <Button
                        icon={<ReloadOutlined/>}
                        onClick={loadLeaderboard}
                    >
                        刷新
                    </Button>
                }
            >
                <div style={{marginBottom: 16}}>
                    <Select
                        style={{width: 200}}
                        placeholder="选择地图"
                        value={selectedMapId}
                        onChange={setSelectedMapId}
                    >
                        {maps.map(map => (
                            <Select.Option key={map.id} value={map.id}>
                                {map.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <Spin spinning={loading}>
                    {data.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={data}
                            rowKey="id"
                            pagination={{
                                current: pageNo + 1,
                                pageSize,
                                total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条记录`,
                                onChange: (page, size) => {
                                    setPageNo(page - 1);
                                    setPageSize(size);
                                },
                            }}
                        />
                    ) : (
                        <Empty
                            description="暂无排行榜数据"
                            style={{padding: 48}}
                        />
                    )}
                </Spin>
            </Card>
        </div>
    );
};

export default Leaderboard;
