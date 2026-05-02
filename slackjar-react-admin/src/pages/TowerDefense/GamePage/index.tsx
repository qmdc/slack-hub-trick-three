import React, {useState, useEffect, useRef} from 'react';
import {
    Button,
    Select,
    Modal,
    Input,
    Table,
    message,
    Popconfirm,
    Card,
    Statistic,
    Row,
    Col,
    Spin,
    Tooltip,
} from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    ReloadOutlined,
    SaveOutlined,
    ShareAltOutlined,
    ImportOutlined,
    TrophyOutlined,
    ArrowUpOutlined,
    DeleteOutlined,
    GoldOutlined,
    HeartOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import {useNavigate} from 'react-router';
import {
    getAvailableMaps,
    getAvailableTowers,
    initGame,
    placeTower,
    upgradeTower,
    sellTower,
    startWave,
    syncBattle,
    endGame,
    saveLayout,
    importLayout,
    getMyLayouts,
    getMyBestWave,
    type TdMap,
    type TowerInfo,
    type EnemyInstance,
    type TowerInstance,
    type PathPoint,
    type GameInitResponse,
    type TowerPlacement,
} from '../../../apis/modules/towerdefense';
import TowerDefenseGame from '../../../components/TowerDefenseGame';
import './GamePage.module.scss';
import type {ColumnsType} from 'antd/es/table';

// ============================================
// 类型定义
// ============================================
interface GameState {
    gameSessionId: string;
    mapId: number;
    mapWidth: number;
    mapHeight: number;
    tileSize: number;
    gridData: string;
    pathData: PathPoint[];
    currentGold: number;
    currentHp: number;
    maxHp: number;
    currentWave: number;
    totalWaves: number;
    availableTowers: TowerInfo[];
    isPlaying: boolean;
    selectedTowerType: TowerInfo | null;
    selectedTower: TowerInstance | null;
}

// ============================================
// 组件实现
// ============================================
const GamePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [maps, setMaps] = useState<TdMap[]>([]);
    const [selectedMap, setSelectedMap] = useState<TdMap | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [showMapSelector, setShowMapSelector] = useState(true);
    const [showLayoutModal, setShowLayoutModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [layouts, setLayouts] = useState<any[]>([]);
    const [newLayoutName, setNewLayoutName] = useState('');
    const [importShareCode, setImportShareCode] = useState('');
    const [bestWave, setBestWave] = useState(0);
    const gameRef = useRef<any>(null);
    const syncIntervalRef = useRef<NodeJS.Timeout>();

    // 加载地图列表
    useEffect(() => {
        loadMaps();
    }, []);

    const loadMaps = async () => {
        setLoading(true);
        try {
            const res = await getAvailableMaps();
            if (res.data) {
                setMaps(res.data);
            }
        } catch (error) {
            message.error('加载地图列表失败');
        } finally {
            setLoading(false);
        }
    };

    const loadLayouts = async () => {
        try {
            const res = await getMyLayouts();
            if (res.data) {
                setLayouts(res.data);
            }
        } catch (error) {
            message.error('加载布局列表失败');
        }
    };

    const loadBestWave = async () => {
        if (selectedMap) {
            try {
                const res = await getMyBestWave(selectedMap.id);
                if (res.data !== undefined) {
                    setBestWave(res.data);
                }
            } catch (error) {
                console.error('加载最佳成绩失败');
            }
        }
    };

    useEffect(() => {
        if (selectedMap) {
            loadBestWave();
        }
    }, [selectedMap]);

    // 开始游戏
    const startGame = async (mapId: number, layoutId?: number, shareCode?: string) => {
        setLoading(true);
        try {
            const res = await initGame({
                mapId,
                layoutId,
                shareCode,
            });

            if (res.data) {
                const data = res.data;
                setGameState({
                    gameSessionId: data.gameSessionId,
                    mapId: data.mapId,
                    mapWidth: data.mapWidth,
                    mapHeight: data.mapHeight,
                    tileSize: data.tileSize,
                    gridData: data.gridData,
                    pathData: data.pathData,
                    currentGold: data.startGold,
                    currentHp: data.playerHp,
                    maxHp: data.playerHp,
                    currentWave: 0,
                    totalWaves: data.totalWaves,
                    availableTowers: data.availableTowers,
                    isPlaying: false,
                    selectedTowerType: null,
                    selectedTower: null,
                });
                setShowMapSelector(false);
            }
        } catch (error) {
            message.error('初始化游戏失败');
        } finally {
            setLoading(false);
        }
    };

    // 更新金币
    const handleGoldChange = (gold: number) => {
        setGameState(prev => prev ? {...prev, currentGold: gold} : null);
    };

    // 选择塔类型
    const handleSelectTowerType = (tower: TowerInfo | null) => {
        setGameState(prev => prev ? {...prev, selectedTowerType: tower} : null);
    };

    // 选择已放置的塔
    const handleTowerSelected = (tower: any) => {
        setGameState(prev => prev ? {...prev, selectedTower: tower} : null);
    };

    // 塔放置回调
    const handleTowerPlaced = async (tower: any) => {
        if (!gameState) return;

        try {
            const res = await placeTower({
                gameSessionId: gameState.gameSessionId,
                towerId: tower.towerId,
                gridX: tower.gridX,
                gridY: tower.gridY,
            });

            if (res.data?.success) {
                message.success('放置成功');
            } else {
                message.error(res.data?.message || '放置失败');
            }
        } catch (error) {
            message.error('放置塔失败');
        }

        handleSelectTowerType(null);
    };

    // 升级塔
    const handleUpgradeTower = async () => {
        if (!gameState || !gameState.selectedTower) return;

        const currentLevel = gameState.selectedTower.level;
        const targetLevel = currentLevel + 1;

        try {
            const res = await upgradeTower({
                gameSessionId: gameState.gameSessionId,
                towerInstanceId: gameState.selectedTower.id,
                targetLevel,
            });

            if (res.data?.success) {
                setGameState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        currentGold: res.data!.remainingGold,
                    };
                });

                if (gameRef.current) {
                    gameRef.current.updateTower(gameState.selectedTower.id, {
                        level: targetLevel,
                        damage: res.data.upgradedDamage,
                        attackSpeed: res.data.upgradedAttackSpeed,
                        range: res.data.upgradedRange,
                        rangePixels: res.data.upgradedRange * gameState.tileSize,
                    });
                }

                message.success('升级成功');
            } else {
                message.error(res.data?.message || '升级失败');
            }
        } catch (error) {
            message.error('升级塔失败');
        }
    };

    // 出售塔
    const handleSellTower = async () => {
        if (!gameState || !gameState.selectedTower) return;

        try {
            const res = await sellTower({
                gameSessionId: gameState.gameSessionId,
                towerInstanceId: gameState.selectedTower.id,
            });

            if (res.data?.success) {
                setGameState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        currentGold: res.data!.remainingGold,
                        selectedTower: null,
                    };
                });

                if (gameRef.current) {
                    gameRef.current.removeTower(gameState.selectedTower.id);
                }

                message.success(`出售成功，获得 ${res.data.refundGold} 金币`);
            } else {
                message.error(res.data?.message || '出售失败');
            }
        } catch (error) {
            message.error('出售塔失败');
        }
    };

    // 开始波次
    const handleStartWave = async () => {
        if (!gameState) return;

        const nextWave = gameState.currentWave + 1;

        try {
            const res = await startWave({
                gameSessionId: gameState.gameSessionId,
                waveNumber: nextWave,
            });

            if (res.data?.success) {
                setGameState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        currentWave: nextWave,
                        isPlaying: true,
                    };
                });

                if (gameRef.current && res.data.spawnOrder) {
                    const enemies: EnemyInstance[] = res.data.spawnOrder.map((spawn: any, index: number) => ({
                        id: spawn.instanceId,
                        enemyId: spawn.enemyId,
                        enemyType: 1,
                        currentHp: spawn.maxHp,
                        maxHp: spawn.maxHp,
                        positionX: gameState!.pathData[0].x,
                        positionY: gameState!.pathData[0].y,
                        pathIndex: 0 - index * (gameState!.pathData.length / res.data!.spawnOrder.length),
                        baseSpeed: spawn.baseSpeed,
                        speedMultiplier: 1,
                        slowEffect: 1,
                        isFrozen: false,
                        isAlive: true,
                        color: '#ff6b6b',
                        reward: 10,
                    }));

                    gameRef.current.addEnemies(enemies);
                }

                startSyncInterval();
                message.success(`第 ${nextWave} 波开始`);
            } else {
                message.error(res.data?.message || '开始波次失败');
            }
        } catch (error) {
            message.error('开始波次失败');
        }
    };

    // 开始同步
    const startSyncInterval = () => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
        }

        syncIntervalRef.current = setInterval(async () => {
            if (!gameState) return;

            try {
                const killedEnemies = gameRef.current?.getKilledEnemies() || [];

                const res = await syncBattle({
                    gameSessionId: gameState.gameSessionId,
                    timestamp: Date.now(),
                    enemyDamages: killedEnemies.map((e: any) => ({
                        enemyInstanceId: e.id,
                        damage: e.maxHp,
                    })),
                    currentGold: gameState.currentGold,
                    currentHp: gameState.currentHp,
                });

                if (res.data) {
                    if (!res.data.isValid) {
                        console.warn('验证失败:', res.data.validationMessage);
                    }

                    setGameState(prev => {
                        if (!prev) return null;
                        let newState = {...prev, currentGold: res.data!.serverGold};

                        if (res.data!.gameStatus === 4) {
                            stopSyncInterval();
                            newState.isPlaying = false;
                            message.success('恭喜通关！');
                        } else if (res.data!.gameStatus === 5) {
                            stopSyncInterval();
                            newState.isPlaying = false;
                            message.error('游戏结束');
                        } else if (res.data!.gameStatus === 6) {
                            stopSyncInterval();
                            newState.isPlaying = false;
                            message.info(`第 ${prev.currentWave} 波完成！`);
                        }

                        return newState;
                    });
                }
            } catch (error) {
                console.error('同步失败:', error);
            }
        }, 1000);
    };

    const stopSyncInterval = () => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = undefined;
        }
    };

    useEffect(() => {
        return () => {
            stopSyncInterval();
        };
    }, []);

    // 保存布局
    const handleSaveLayout = async () => {
        if (!gameState || !newLayoutName) {
            message.warning('请输入布局名称');
            return;
        }

        const towers = gameRef.current?.getTowers() || [];
        const layoutData = JSON.stringify(towers.map((t: any) => ({
            towerId: t.towerId,
            gridX: t.gridX,
            gridY: t.gridY,
            level: t.level,
        })));

        try {
            const res = await saveLayout({
                name: newLayoutName,
                mapId: gameState.mapId,
                layoutData,
                isPublic: 0,
            });

            if (res.data?.success) {
                message.success(`保存成功！分享码: ${res.data.shareCode}`);
                setShowLayoutModal(false);
                setNewLayoutName('');
            } else {
                message.error(res.data?.message || '保存失败');
            }
        } catch (error) {
            message.error('保存布局失败');
        }
    };

    // 导入布局
    const handleImportLayout = async () => {
        if (!importShareCode) {
            message.warning('请输入分享码');
            return;
        }

        try {
            const res = await importLayout({
                shareCode: importShareCode,
            });

            if (res.data?.success) {
                message.success('导入成功');
                setShowImportModal(false);
                setImportShareCode('');

                if (selectedMap && res.data.mapId === selectedMap.id) {
                    startGame(selectedMap.id, res.data.layoutId);
                }
            } else {
                message.error(res.data?.message || '导入失败');
            }
        } catch (error) {
            message.error('导入布局失败');
        }
    };

    // 重新开始
    const handleRestart = () => {
        stopSyncInterval();
        if (gameState) {
            endGame(gameState.gameSessionId, 5).catch(() => {});
        }
        setGameState(null);
        setShowMapSelector(true);
    };

    const layoutColumns: ColumnsType<any> = [
        {
            title: '布局名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '分享码',
            dataIndex: 'shareCode',
            key: 'shareCode',
        },
        {
            title: '下载次数',
            dataIndex: 'downloadCount',
            key: 'downloadCount',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        startGame(selectedMap!.id, record.id);
                        setShowLayoutModal(false);
                    }}
                >
                    使用
                </Button>
            ),
        },
    ];

    // 地图选择界面
    if (showMapSelector) {
        return (
            <div className="game-page">
                <div className="map-selector">
                    <Card title="选择地图" className="map-card">
                        <Spin spinning={loading}>
                            <Row gutter={[16, 16]}>
                                {maps.map(map => (
                                    <Col xs={24} sm={12} md={8} key={map.id}>
                                        <Card
                                            hoverable
                                            className="map-item"
                                            onClick={() => {
                                                setSelectedMap(map);
                                            }}
                                            style={{
                                                borderColor: selectedMap?.id === map.id ? '#449eff' : '#333',
                                                background: selectedMap?.id === map.id ? 'rgba(68, 158, 255, 0.1)' : '#1a1a2e',
                                            }}
                                        >
                                            <div className="map-item-content">
                                                <div className="map-name">{map.name}</div>
                                                <div className="map-desc">{map.description}</div>
                                                <div className="map-stats">
                                                    <span>尺寸: {map.mapWidth} x {map.mapHeight}</span>
                                                    <span>波数: {map.totalWaves}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            <div className="map-actions">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlayCircleOutlined/>}
                                    disabled={!selectedMap}
                                    onClick={() => selectedMap && startGame(selectedMap.id)}
                                >
                                    开始游戏
                                </Button>
                                <Button
                                    size="large"
                                    icon={<ImportOutlined/>}
                                    onClick={() => {
                                        loadLayouts();
                                        setShowLayoutModal(true);
                                    }}
                                    disabled={!selectedMap}
                                >
                                    选择布局
                                </Button>
                            </div>
                        </Spin>
                    </Card>
                </div>

                <Modal
                    title="我的布局"
                    open={showLayoutModal}
                    onCancel={() => setShowLayoutModal(false)}
                    footer={null}
                    width={600}
                >
                    <Table
                        columns={layoutColumns}
                        dataSource={layouts}
                        rowKey="id"
                        pagination={false}
                    />
                </Modal>
            </div>
        );
    }

    if (!gameState) return null;

    const getTowerIcon = (towerType: number) => {
        const icons: Record<number, string> = {
            1: '🏹',
            2: '💣',
            3: '✨',
            4: '⚡',
            5: '❄️',
        };
        return icons[towerType] || '🗼';
    };

    return (
        <div className="game-page">
            <div className="tower-defense-game">
                <div className="game-header">
                    <div className="map-info">
                        <div className="map-name">{selectedMap?.name || '未命名地图'}</div>
                        <div className="wave-info">
                            <TrophyOutlined/> 最佳: 第 {bestWave} 波
                        </div>
                    </div>

                    <div className="game-stats">
                        <div className="stat-item">
                            <span className="stat-label">金币</span>
                            <span className="stat-value gold">
                                <GoldOutlined/> {gameState.currentGold}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">生命</span>
                            <span className="stat-value hp">
                                <HeartOutlined/> {gameState.currentHp}/{gameState.maxHp}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">波次</span>
                            <span className="stat-value wave">
                                <RocketOutlined/> {gameState.currentWave}/{gameState.totalWaves}
                            </span>
                        </div>
                    </div>

                    <div className="game-controls">
                        {!gameState.isPlaying && gameState.currentWave < gameState.totalWaves && (
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined/>}
                                onClick={handleStartWave}
                            >
                                开始第 {gameState.currentWave + 1} 波
                            </Button>
                        )}
                        <Button icon={<ReloadOutlined/>} onClick={handleRestart}>
                            重新开始
                        </Button>
                        <Button
                            icon={<SaveOutlined/>}
                            onClick={() => setShowLayoutModal(true)}
                            disabled={gameState.isPlaying}
                        >
                            保存布局
                        </Button>
                        <Button
                            icon={<ImportOutlined/>}
                            onClick={() => setShowImportModal(true)}
                            disabled={gameState.isPlaying}
                        >
                            导入布局
                        </Button>
                        <Button
                            icon={<TrophyOutlined/>}
                            onClick={() => setShowLeaderboardModal(true)}
                        >
                            排行榜
                        </Button>
                    </div>
                </div>

                <div className="game-content">
                    <div className="canvas-container">
                        <TowerDefenseGame
                            ref={gameRef}
                            mapWidth={gameState.mapWidth}
                            mapHeight={gameState.mapHeight}
                            tileSize={gameState.tileSize}
                            gridData={gameState.gridData}
                            pathData={gameState.pathData}
                            availableTowers={gameState.availableTowers}
                            currentGold={gameState.currentGold}
                            onGoldChange={handleGoldChange}
                            onTowerPlaced={handleTowerPlaced}
                            onTowerSelected={handleTowerSelected}
                            selectedTowerType={gameState.selectedTowerType}
                            gameSessionId={gameState.gameSessionId}
                            isPlaying={gameState.isPlaying}
                        />
                    </div>

                    <div className="sidebar">
                        <div className="sidebar-section">
                            <div className="section-title">防御塔</div>
                            <div className="tower-list">
                                {gameState.availableTowers.map(tower => {
                                    const canAfford = gameState.currentGold >= tower.baseCost;
                                    const isUnlocked = !tower.unlockWave || tower.unlockWave <= gameState.currentWave;
                                    const isSelected = gameState.selectedTowerType?.id === tower.id;

                                    return (
                                        <div
                                            key={tower.id}
                                            className={`tower-item ${isSelected ? 'selected' : ''} ${(!canAfford || !isUnlocked) ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (canAfford && isUnlocked) {
                                                    handleSelectTowerType(isSelected ? null : tower);
                                                }
                                            }}
                                        >
                                            <div
                                                className="tower-icon"
                                                style={{background: tower.color || '#4a9eff'}}
                                            >
                                                {getTowerIcon(tower.towerType)}
                                            </div>
                                            <div className="tower-info">
                                                <div className="tower-name">{tower.name}</div>
                                                <div className="tower-cost">
                                                    {!isUnlocked ? `第 ${tower.unlockWave} 波解锁` : `${tower.baseCost} 金币`}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {gameState.selectedTower && (
                            <div className="sidebar-section">
                                <div className="section-title">选中的塔</div>
                                <div className="selected-tower-info">
                                    <div className="tower-detail">
                                        <div
                                            className="tower-icon"
                                            style={{background: gameState.selectedTower.color}}
                                        >
                                            {getTowerIcon(gameState.selectedTower.towerType)}
                                        </div>
                                        <div className="tower-info">
                                            <div className="tower-name">
                                                {gameState.availableTowers.find(t => t.id === gameState.selectedTower!.towerId)?.name}
                                            </div>
                                            <div className="tower-level">
                                                等级 {gameState.selectedTower.level}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tower-stats">
                                        <div className="stat">
                                            <div className="stat-label">伤害</div>
                                            <div className="stat-value">{gameState.selectedTower.damage}</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-label">攻速</div>
                                            <div className="stat-value">{gameState.selectedTower.attackSpeed.toFixed(1)}/s</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-label">射程</div>
                                            <div className="stat-value">{gameState.selectedTower.range}</div>
                                        </div>
                                    </div>
                                    <div className="tower-actions">
                                        <Tooltip title="升级">
                                            <Button
                                                type="primary"
                                                icon={<ArrowUpOutlined/>}
                                                onClick={handleUpgradeTower}
                                                disabled={gameState.isPlaying}
                                            >
                                                升级
                                            </Button>
                                        </Tooltip>
                                        <Popconfirm
                                            title="确定要出售这个塔吗？"
                                            onConfirm={handleSellTower}
                                            okText="确定"
                                            cancelText="取消"
                                            disabled={gameState.isPlaying}
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined/>}
                                                disabled={gameState.isPlaying}
                                            >
                                                出售
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="保存布局"
                open={showLayoutModal}
                onOk={handleSaveLayout}
                onCancel={() => {
                    setShowLayoutModal(false);
                    setNewLayoutName('');
                }}
            >
                <Input
                    placeholder="输入布局名称"
                    value={newLayoutName}
                    onChange={e => setNewLayoutName(e.target.value)}
                    onPressEnter={handleSaveLayout}
                />
            </Modal>

            <Modal
                title="导入布局"
                open={showImportModal}
                onOk={handleImportLayout}
                onCancel={() => {
                    setShowImportModal(false);
                    setImportShareCode('');
                }}
            >
                <Input
                    placeholder="输入分享码"
                    value={importShareCode}
                    onChange={e => setImportShareCode(e.target.value.toUpperCase())}
                    onPressEnter={handleImportLayout}
                />
            </Modal>

            <Modal
                title="排行榜"
                open={showLeaderboardModal}
                onCancel={() => setShowLeaderboardModal(false)}
                footer={null}
                width={700}
            >
                <div>
                    <p>排行榜功能即将推出...</p>
                </div>
            </Modal>
        </div>
    );
};

export default GamePage;
