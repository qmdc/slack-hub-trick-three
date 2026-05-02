import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
    Button,
    Input,
    InputNumber,
    Table,
    Modal,
    Form,
    Select,
    message,
    Popconfirm,
    Card,
    Row,
    Col,
    Tabs,
    Spin,
    Space,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    ReloadOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import {
    pageQueryMaps,
    getMapDetail,
    saveMap,
    deleteMap,
    pageQueryTowers,
    saveTower,
    deleteTower,
    pageQueryEnemies,
    saveEnemy,
    deleteEnemy,
    getWavesByMapId,
    saveWave,
    deleteWave,
    getAvailableEnemies,
    type TdMap,
    type TdTower,
    type TdEnemy,
    type TdWave,
} from '../../apis/modules/towerdefense';
import './MapEditor.module.scss';
import type {ColumnsType} from 'antd/es/table';

const {TextArea} = Input;
const {Title} = Typography;

// ============================================
// 单元格类型
// ============================================
const CELL_TYPES = {
    EMPTY: 0,
    PATH: 1,
    START: 3,
    END: 4,
};

const CELL_COLORS: Record<number, string> = {
    [CELL_TYPES.EMPTY]: '#4a4a5a',
    [CELL_TYPES.PATH]: '#5a5a6a',
    [CELL_TYPES.START]: '#44ff44',
    [CELL_TYPES.END]: '#ff4444',
};

// ============================================
// 组件实现
// ============================================
const MapEditor: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [maps, setMaps] = useState<TdMap[]>([]);
    const [towers, setTowers] = useState<TdTower[]>([]);
    const [enemies, setEnemies] = useState<TdEnemy[]>([]);
    const [activeTab, setActiveTab] = useState('maps');

    // 地图编辑状态
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [editingMap, setEditingMap] = useState<TdMap | null>(null);
    const [mapForm] = Form.useForm();

    // 地图绘制状态
    const [drawingMap, setDrawingMap] = useState<{
        width: number;
        height: number;
        grid: number[];
        path: {x: number; y: number}[];
        currentTool: 'empty' | 'path' | 'start' | 'end';
    } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 塔编辑状态
    const [towerModalVisible, setTowerModalVisible] = useState(false);
    const [editingTower, setEditingTower] = useState<TdTower | null>(null);
    const [towerForm] = Form.useForm();

    // 敌人编辑状态
    const [enemyModalVisible, setEnemyModalVisible] = useState(false);
    const [editingEnemy, setEditingEnemy] = useState<TdEnemy | null>(null);
    const [enemyForm] = Form.useForm();

    // 波次编辑状态
    const [waveModalVisible, setWaveModalVisible] = useState(false);
    const [selectedMapForWaves, setSelectedMapForWaves] = useState<TdMap | null>(null);
    const [waves, setWaves] = useState<TdWave[]>([]);
    const [editingWave, setEditingWave] = useState<TdWave | null>(null);
    const [waveForm] = Form.useForm();
    const [waveEnemies, setWaveEnemies] = useState<{enemyId: number; count: number}[]>([]);

    // 加载数据
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadMaps(),
                loadTowers(),
                loadEnemies(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadMaps = async () => {
        try {
            const res = await pageQueryMaps({pageNo: 0, pageSize: 100});
            if (res.data?.list) {
                setMaps(res.data.list);
            }
        } catch (error) {
            message.error('加载地图列表失败');
        }
    };

    const loadTowers = async () => {
        try {
            const res = await pageQueryTowers({pageNo: 0, pageSize: 100});
            if (res.data?.list) {
                setTowers(res.data.list);
            }
        } catch (error) {
            message.error('加载塔列表失败');
        }
    };

    const loadEnemies = async () => {
        try {
            const res = await pageQueryEnemies({pageNo: 0, pageSize: 100});
            if (res.data?.list) {
                setEnemies(res.data.list);
            }
        } catch (error) {
            message.error('加载敌人列表失败');
        }
    };

    // ============================================
    // 地图绘制
    // ============================================
    const startDrawingMap = (width: number, height: number, existingGrid?: number[], existingPath?: {x: number; y: number}[]) => {
        const grid: number[] = existingGrid || Array(width * height).fill(CELL_TYPES.EMPTY);
        const path: {x: number; y: number}[] = existingPath || [];

        setDrawingMap({
            width,
            height,
            grid,
            path,
            currentTool: 'empty',
        });
    };

    const drawGrid = useCallback(() => {
        if (!canvasRef.current || !drawingMap) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const tileSize = 32;
        const width = drawingMap.width * tileSize;
        const height = drawingMap.height * tileSize;

        ctx.clearRect(0, 0, width, height);

        for (let y = 0; y < drawingMap.height; y++) {
            for (let x = 0; x < drawingMap.width; x++) {
                const index = y * drawingMap.width + x;
                const cellType = drawingMap.grid[index];
                const px = x * tileSize;
                const py = y * tileSize;

                ctx.fillStyle = CELL_COLORS[cellType] || CELL_COLORS[CELL_TYPES.EMPTY];
                ctx.fillRect(px, py, tileSize, tileSize);

                ctx.strokeStyle = '#2a2a3a';
                ctx.lineWidth = 1;
                ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);

                const isInPath = drawingMap.path.some(p => p.x === x && p.y === y);
                if (isInPath) {
                    ctx.strokeStyle = '#ffaa00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
                }
            }
        }
    }, [drawingMap]);

    useEffect(() => {
        drawGrid();
    }, [drawingMap, drawGrid]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawingMap || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tileSize = 32;
        const gridX = Math.floor(x / tileSize);
        const gridY = Math.floor(y / tileSize);

        if (gridX < 0 || gridX >= drawingMap.width || gridY < 0 || gridY >= drawingMap.height) {
            return;
        }

        const newGrid = [...drawingMap.grid];
        let newPath = [...drawingMap.path];

        switch (drawingMap.currentTool) {
            case 'empty':
                newGrid[gridY * drawingMap.width + gridX] = CELL_TYPES.EMPTY;
                newPath = newPath.filter(p => !(p.x === gridX && p.y === gridY));
                break;
            case 'path':
                newGrid[gridY * drawingMap.width + gridX] = CELL_TYPES.PATH;
                if (!newPath.some(p => p.x === gridX && p.y === gridY)) {
                    newPath.push({x: gridX, y: gridY});
                }
                break;
            case 'start':
                for (let i = 0; i < newGrid.length; i++) {
                    if (newGrid[i] === CELL_TYPES.START) {
                        newGrid[i] = CELL_TYPES.PATH;
                    }
                }
                newGrid[gridY * drawingMap.width + gridX] = CELL_TYPES.START;
                break;
            case 'end':
                for (let i = 0; i < newGrid.length; i++) {
                    if (newGrid[i] === CELL_TYPES.END) {
                        newGrid[i] = CELL_TYPES.PATH;
                    }
                }
                newGrid[gridY * drawingMap.width + gridX] = CELL_TYPES.END;
                break;
        }

        setDrawingMap({
            ...drawingMap,
            grid: newGrid,
            path: newPath,
        });
    };

    // ============================================
    // 地图管理
    // ============================================
    const handleAddMap = () => {
        setEditingMap(null);
        mapForm.resetFields();
        mapForm.setFieldsValue({
            mapWidth: 20,
            mapHeight: 15,
            tileSize: 32,
            startGold: 500,
            playerHp: 20,
            totalWaves: 10,
        });
        setMapModalVisible(true);
    };

    const handleEditMap = (map: TdMap) => {
        setEditingMap(map);
        mapForm.setFieldsValue({
            name: map.name,
            description: map.description,
            mapWidth: map.mapWidth,
            mapHeight: map.mapHeight,
            tileSize: map.tileSize,
            startGold: map.startGold,
            playerHp: map.playerHp,
            totalWaves: map.totalWaves,
            gridData: map.gridData,
            pathData: map.pathData,
        });
        setMapModalVisible(true);
    };

    const handleMapOk = async () => {
        try {
            const values = await mapForm.validateFields();

            let gridData = values.gridData;
            let pathData = values.pathData;

            if (drawingMap) {
                gridData = JSON.stringify(drawingMap.grid);
                pathData = JSON.stringify(drawingMap.path);
            }

            const saveData: any = {
                ...values,
                gridData,
                pathData,
            };

            if (editingMap) {
                saveData.id = editingMap.id;
            }

            const res = await saveMap(saveData);
            if (res.data) {
                message.success('保存成功');
                setMapModalVisible(false);
                setDrawingMap(null);
                loadMaps();
            }
        } catch (error) {
            message.error('保存失败');
        }
    };

    const handleDeleteMap = async (id: number) => {
        try {
            await deleteMap(id);
            message.success('删除成功');
            loadMaps();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // ============================================
    // 塔管理
    // ============================================
    const handleAddTower = () => {
        setEditingTower(null);
        towerForm.resetFields();
        towerForm.setFieldsValue({
            towerType: 1,
            baseCost: 100,
            baseDamage: 20,
            baseAttackSpeed: 1.0,
            baseRange: 3,
            upgradeCost: 50,
            damageUpgradeRate: 1.3,
            attackSpeedUpgradeRate: 1.1,
            rangeUpgrade: 1,
            color: '#4a9eff',
            status: 1,
        });
        setTowerModalVisible(true);
    };

    const handleEditTower = (tower: TdTower) => {
        setEditingTower(tower);
        towerForm.setFieldsValue(tower);
        setTowerModalVisible(true);
    };

    const handleTowerOk = async () => {
        try {
            const values = await towerForm.validateFields();
            const saveData: any = {...values};
            if (editingTower) {
                saveData.id = editingTower.id;
            }

            const res = await saveTower(saveData);
            if (res.data) {
                message.success('保存成功');
                setTowerModalVisible(false);
                loadTowers();
            }
        } catch (error) {
            message.error('保存失败');
        }
    };

    const handleDeleteTower = async (id: number) => {
        try {
            await deleteTower(id);
            message.success('删除成功');
            loadTowers();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // ============================================
    // 敌人管理
    // ============================================
    const handleAddEnemy = () => {
        setEditingEnemy(null);
        enemyForm.resetFields();
        enemyForm.setFieldsValue({
            enemyType: 1,
            baseHp: 100,
            baseSpeed: 2,
            speedMultiplier: 1.0,
            reward: 10,
            armor: 0,
            magicResistance: 0,
            color: '#ff6b6b',
            status: 1,
        });
        setEnemyModalVisible(true);
    };

    const handleEditEnemy = (enemy: TdEnemy) => {
        setEditingEnemy(enemy);
        enemyForm.setFieldsValue(enemy);
        setEnemyModalVisible(true);
    };

    const handleEnemyOk = async () => {
        try {
            const values = await enemyForm.validateFields();
            const saveData: any = {...values};
            if (editingEnemy) {
                saveData.id = editingEnemy.id;
            }

            const res = await saveEnemy(saveData);
            if (res.data) {
                message.success('保存成功');
                setEnemyModalVisible(false);
                loadEnemies();
            }
        } catch (error) {
            message.error('保存失败');
        }
    };

    const handleDeleteEnemy = async (id: number) => {
        try {
            await deleteEnemy(id);
            message.success('删除成功');
            loadEnemies();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // ============================================
    // 波次管理
    // ============================================
    const handleEditWaves = async (map: TdMap) => {
        setSelectedMapForWaves(map);
        try {
            const res = await getWavesByMapId(map.id);
            if (res.data) {
                setWaves(res.data);
            }
        } catch (error) {
            message.error('加载波次失败');
        }
        setWaveModalVisible(true);
    };

    const handleAddWave = () => {
        setEditingWave(null);
        waveForm.resetFields();
        waveForm.setFieldsValue({
            waveNumber: waves.length + 1,
            totalEnemies: 10,
            spawnInterval: 1000,
            difficultyMultiplier: 1.0,
            bonusGold: 0,
        });
        setWaveEnemies([]);
    };

    const handleEditWave = (wave: TdWave) => {
        setEditingWave(wave);
        waveForm.setFieldsValue(wave);
        setWaveEnemies([]);
    };

    const handleWaveOk = async () => {
        try {
            const values = await waveForm.validateFields();
            const saveData: any = {
                ...values,
                mapId: selectedMapForWaves!.id,
                enemies: waveEnemies.map((we, index) => ({
                    enemyId: we.enemyId,
                    count: we.count,
                    spawnOrder: index,
                })),
            };
            if (editingWave) {
                saveData.id = editingWave.id;
            }

            const res = await saveWave(saveData);
            if (res.data) {
                message.success('保存成功');
                setEditingWave(null);
                setWaveEnemies([]);
                const wavesRes = await getWavesByMapId(selectedMapForWaves!.id);
                if (wavesRes.data) {
                    setWaves(wavesRes.data);
                }
            }
        } catch (error) {
            message.error('保存失败');
        }
    };

    const handleDeleteWave = async (id: number) => {
        try {
            await deleteWave(id);
            message.success('删除成功');
            const res = await getWavesByMapId(selectedMapForWaves!.id);
            if (res.data) {
                setWaves(res.data);
            }
        } catch (error) {
            message.error('删除失败');
        }
    };

    const mapColumns: ColumnsType<TdMap> = [
        {
            title: '地图名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '尺寸',
            key: 'size',
            render: (_, record) => `${record.mapWidth} x ${record.mapHeight}`,
        },
        {
            title: '初始金币',
            dataIndex: 'startGold',
            key: 'startGold',
        },
        {
            title: '玩家生命',
            dataIndex: 'playerHp',
            key: 'playerHp',
        },
        {
            title: '总波次',
            dataIndex: 'totalWaves',
            key: 'totalWaves',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditMap(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        icon={<UnorderedListOutlined/>}
                        onClick={() => handleEditWaves(record)}
                    >
                        波次
                    </Button>
                    <Popconfirm
                        title="确定要删除这个地图吗？"
                        onConfirm={() => handleDeleteMap(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const towerColumns: ColumnsType<TdTower> = [
        {
            title: '塔名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类型',
            dataIndex: 'towerType',
            key: 'towerType',
            render: (type: number) => {
                const types: Record<number, string> = {
                    1: '箭塔',
                    2: '炮塔',
                    3: '魔法塔',
                    4: '激光塔',
                    5: '冰冻塔',
                };
                return types[type] || type;
            },
        },
        {
            title: '费用',
            dataIndex: 'baseCost',
            key: 'baseCost',
        },
        {
            title: '伤害',
            dataIndex: 'baseDamage',
            key: 'baseDamage',
        },
        {
            title: '射程',
            dataIndex: 'baseRange',
            key: 'baseRange',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditTower(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个塔吗？"
                        onConfirm={() => handleDeleteTower(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const enemyColumns: ColumnsType<TdEnemy> = [
        {
            title: '敌人名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类型',
            dataIndex: 'enemyType',
            key: 'enemyType',
            render: (type: number) => {
                const types: Record<number, string> = {
                    1: '普通兵',
                    2: '快速兵',
                    3: '重甲兵',
                    4: 'BOSS',
                    5: '治疗兵',
                };
                return types[type] || type;
            },
        },
        {
            title: '血量',
            dataIndex: 'baseHp',
            key: 'baseHp',
        },
        {
            title: '奖励',
            dataIndex: 'reward',
            key: 'reward',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditEnemy(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个敌人吗？"
                        onConfirm={() => handleDeleteEnemy(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const waveColumns: ColumnsType<TdWave> = [
        {
            title: '波次序号',
            dataIndex: 'waveNumber',
            key: 'waveNumber',
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '敌人数',
            dataIndex: 'totalEnemies',
            key: 'totalEnemies',
        },
        {
            title: '难度倍率',
            dataIndex: 'difficultyMultiplier',
            key: 'difficultyMultiplier',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditWave(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个波次吗？"
                        onConfirm={() => handleDeleteWave(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="map-editor">
            <Card>
                <Title level={3}>塔防关卡编辑器</Title>
                <p>在这里配置地图、塔、敌人和波次</p>
            </Card>

            <Card style={{marginTop: 16}}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'maps',
                            label: '地图配置',
                            children: (
                                <div>
                                    <div style={{marginBottom: 16}}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined/>}
                                            onClick={handleAddMap}
                                        >
                                            添加地图
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined/>}
                                            onClick={loadMaps}
                                            style={{marginLeft: 8}}
                                        >
                                            刷新
                                        </Button>
                                    </div>
                                    <Table
                                        columns={mapColumns}
                                        dataSource={maps}
                                        rowKey="id"
                                        loading={loading}
                                        pagination={false}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: 'towers',
                            label: '塔配置',
                            children: (
                                <div>
                                    <div style={{marginBottom: 16}}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined/>}
                                            onClick={handleAddTower}
                                        >
                                            添加塔
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined/>}
                                            onClick={loadTowers}
                                            style={{marginLeft: 8}}
                                        >
                                            刷新
                                        </Button>
                                    </div>
                                    <Table
                                        columns={towerColumns}
                                        dataSource={towers}
                                        rowKey="id"
                                        loading={loading}
                                        pagination={false}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: 'enemies',
                            label: '敌人配置',
                            children: (
                                <div>
                                    <div style={{marginBottom: 16}}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined/>}
                                            onClick={handleAddEnemy}
                                        >
                                            添加敌人
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined/>}
                                            onClick={loadEnemies}
                                            style={{marginLeft: 8}}
                                        >
                                            刷新
                                        </Button>
                                    </div>
                                    <Table
                                        columns={enemyColumns}
                                        dataSource={enemies}
                                        rowKey="id"
                                        loading={loading}
                                        pagination={false}
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* 地图编辑模态框 */}
            <Modal
                title={editingMap ? '编辑地图' : '添加地图'}
                open={mapModalVisible}
                onOk={handleMapOk}
                onCancel={() => {
                    setMapModalVisible(false);
                    setDrawingMap(null);
                }}
                width={800}
            >
                <Form form={mapForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="地图名称"
                                rules={[{required: true, message: '请输入地图名称'}]}
                            >
                                <Input placeholder="请输入地图名称"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="mapWidth"
                                label="地图宽度(格子数)"
                                rules={[{required: true, message: '请输入地图宽度'}]}
                            >
                                <InputNumber
                                    min={5}
                                    max={50}
                                    style={{width: '100%'}}
                                    onChange={(value) => {
                                        if (value) {
                                            mapForm.setFieldValue('mapWidth', value);
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="mapHeight"
                                label="地图高度(格子数)"
                                rules={[{required: true, message: '请输入地图高度'}]}
                            >
                                <InputNumber
                                    min={5}
                                    max={50}
                                    style={{width: '100%'}}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="tileSize"
                                label="格子大小(像素)"
                                rules={[{required: true, message: '请输入格子大小'}]}
                            >
                                <InputNumber min={16} max={64} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="startGold"
                                label="初始金币"
                                rules={[{required: true, message: '请输入初始金币'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="playerHp"
                                label="玩家生命"
                                rules={[{required: true, message: '请输入玩家生命'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="totalWaves"
                                label="总波次"
                                rules={[{required: true, message: '请输入总波次'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="地图描述">
                        <TextArea rows={2} placeholder="请输入地图描述"/>
                    </Form.Item>

                    <Form.Item label="地图编辑器">
                        <div>
                            <Space style={{marginBottom: 8}}>
                                <Button
                                    onClick={() => {
                                        const values = mapForm.getFieldsValue();
                                        let existingGrid: number[] | undefined;
                                        let existingPath: {x: number; y: number}[] | undefined;

                                        if (values.gridData) {
                                            try {
                                                existingGrid = JSON.parse(values.gridData);
                                            } catch {}
                                        }
                                        if (values.pathData) {
                                            try {
                                                existingPath = JSON.parse(values.pathData);
                                            } catch {}
                                        }

                                        startDrawingMap(
                                            values.mapWidth || 20,
                                            values.mapHeight || 15,
                                            existingGrid,
                                            existingPath
                                        );
                                    }}
                                >
                                    开始绘制
                                </Button>
                                <Select
                                    value={drawingMap?.currentTool}
                                    onChange={(value) => {
                                        if (drawingMap) {
                                            setDrawingMap({
                                                ...drawingMap,
                                                currentTool: value,
                                            });
                                        }
                                    }}
                                    style={{width: 120}}
                                    disabled={!drawingMap}
                                >
                                    <Select.Option value="empty">空地</Select.Option>
                                    <Select.Option value="path">路径</Select.Option>
                                    <Select.Option value="start">起点</Select.Option>
                                    <Select.Option value="end">终点</Select.Option>
                                </Select>
                            </Space>

                            {drawingMap && (
                                <div style={{border: '1px solid #333', display: 'inline-block'}}>
                                    <canvas
                                        ref={canvasRef}
                                        width={drawingMap.width * 32}
                                        height={drawingMap.height * 32}
                                        onClick={handleCanvasClick}
                                        style={{cursor: 'crosshair'}}
                                    />
                                </div>
                            )}

                            <div style={{marginTop: 8, fontSize: 12, color: '#888'}}>
                                提示: 选择工具后点击画布绘制。绿色=起点, 红色=终点, 灰色=路径
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item name="gridData" label="网格数据(由编辑器生成)" hidden>
                        <TextArea rows={2}/>
                    </Form.Item>
                    <Form.Item name="pathData" label="路径数据(由编辑器生成)" hidden>
                        <TextArea rows={2}/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 塔编辑模态框 */}
            <Modal
                title={editingTower ? '编辑塔' : '添加塔'}
                open={towerModalVisible}
                onOk={handleTowerOk}
                onCancel={() => setTowerModalVisible(false)}
                width={600}
            >
                <Form form={towerForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="塔名称"
                                rules={[{required: true, message: '请输入塔名称'}]}
                            >
                                <Input placeholder="请输入塔名称"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="towerType"
                                label="塔类型"
                                rules={[{required: true, message: '请选择塔类型'}]}
                            >
                                <Select>
                                    <Select.Option value={1}>箭塔 (远程单体)</Select.Option>
                                    <Select.Option value={2}>炮塔 (范围攻击)</Select.Option>
                                    <Select.Option value={3}>魔法塔 (减速)</Select.Option>
                                    <Select.Option value={4}>激光塔 (穿透)</Select.Option>
                                    <Select.Option value={5}>冰冻塔 (冻结)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="baseCost"
                                label="基础费用"
                                rules={[{required: true, message: '请输入基础费用'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="baseDamage"
                                label="基础伤害"
                                rules={[{required: true, message: '请输入基础伤害'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="baseAttackSpeed"
                                label="基础攻速(次/秒)"
                                rules={[{required: true, message: '请输入基础攻速'}]}
                            >
                                <InputNumber min={0.1} step={0.1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="baseRange"
                                label="基础射程"
                                rules={[{required: true, message: '请输入基础射程'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="upgradeCost"
                                label="升级费用"
                                rules={[{required: true, message: '请输入升级费用'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="unlockWave"
                                label="解锁波次"
                            >
                                <InputNumber min={0} placeholder="0=始终解锁" style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="damageUpgradeRate"
                                label="伤害升级倍率"
                                rules={[{required: true, message: '请输入伤害升级倍率'}]}
                            >
                                <InputNumber min={1} step={0.1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="attackSpeedUpgradeRate"
                                label="攻速升级倍率"
                                rules={[{required: true, message: '请输入攻速升级倍率'}]}
                            >
                                <InputNumber min={1} step={0.1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="rangeUpgrade"
                                label="射程升级增量"
                                rules={[{required: true, message: '请输入射程升级增量'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="color" label="显示颜色">
                        <Input type="color" style={{width: '100%'}}/>
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <TextArea rows={2} placeholder="请输入塔的描述"/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 敌人编辑模态框 */}
            <Modal
                title={editingEnemy ? '编辑敌人' : '添加敌人'}
                open={enemyModalVisible}
                onOk={handleEnemyOk}
                onCancel={() => setEnemyModalVisible(false)}
                width={600}
            >
                <Form form={enemyForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="敌人名称"
                                rules={[{required: true, message: '请输入敌人名称'}]}
                            >
                                <Input placeholder="请输入敌人名称"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="enemyType"
                                label="敌人类型"
                                rules={[{required: true, message: '请选择敌人类型'}]}
                            >
                                <Select>
                                    <Select.Option value={1}>普通兵</Select.Option>
                                    <Select.Option value={2}>快速兵</Select.Option>
                                    <Select.Option value={3}>重甲兵</Select.Option>
                                    <Select.Option value={4}>BOSS</Select.Option>
                                    <Select.Option value={5}>治疗兵</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="baseHp"
                                label="基础血量"
                                rules={[{required: true, message: '请输入基础血量'}]}
                            >
                                <InputNumber min={1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="baseSpeed"
                                label="基础速度"
                                rules={[{required: true, message: '请输入基础速度'}]}
                            >
                                <InputNumber min={0.1} step={0.1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="speedMultiplier"
                                label="速度倍率"
                                rules={[{required: true, message: '请输入速度倍率'}]}
                            >
                                <InputNumber min={0.1} step={0.1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="reward"
                                label="击杀奖励"
                                rules={[{required: true, message: '请输入击杀奖励'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="armor"
                                label="护甲"
                                rules={[{required: true, message: '请输入护甲'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="magicResistance"
                                label="魔法抗性"
                                rules={[{required: true, message: '请输入魔法抗性'}]}
                            >
                                <InputNumber min={0} max={1} step={0.1} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="color" label="显示颜色">
                        <Input type="color" style={{width: '100%'}}/>
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <TextArea rows={2} placeholder="请输入敌人的描述"/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 波次编辑模态框 */}
            <Modal
                title={`波次配置 - ${selectedMapForWaves?.name}`}
                open={waveModalVisible}
                onCancel={() => {
                    setWaveModalVisible(false);
                    setSelectedMapForWaves(null);
                    setEditingWave(null);
                    setWaveEnemies([]);
                }}
                footer={null}
                width={800}
            >
                <div style={{marginBottom: 16}}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={handleAddWave}
                    >
                        添加波次
                    </Button>
                </div>

                <Table
                    columns={waveColumns}
                    dataSource={waves}
                    rowKey="id"
                    pagination={false}
                />

                {(editingWave || waveForm.getFieldsValue().waveNumber) && (
                    <Card title={editingWave ? '编辑波次' : '新建波次'} style={{marginTop: 16}}>
                        <Form form={waveForm} layout="vertical">
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item
                                        name="waveNumber"
                                        label="波次序号"
                                        rules={[{required: true, message: '请输入波次序号'}]}
                                    >
                                        <InputNumber min={1} style={{width: '100%'}}/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name="name"
                                        label="波次名称"
                                    >
                                        <Input placeholder="如: 第1波"/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name="totalEnemies"
                                        label="敌人数"
                                        rules={[{required: true, message: '请输入敌人数'}]}
                                    >
                                        <InputNumber min={1} style={{width: '100%'}}/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name="spawnInterval"
                                        label="生成间隔(ms)"
                                        rules={[{required: true, message: '请输入生成间隔'}]}
                                    >
                                        <InputNumber min={100} style={{width: '100%'}}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="difficultyMultiplier"
                                        label="难度倍率"
                                        rules={[{required: true, message: '请输入难度倍率'}]}
                                    >
                                        <InputNumber min={0.5} step={0.1} style={{width: '100%'}}/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="bonusGold"
                                        label="完成奖励金币"
                                        rules={[{required: true, message: '请输入完成奖励金币'}]}
                                    >
                                        <InputNumber min={0} style={{width: '100%'}}/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="敌人配置">
                                <div>
                                    {waveEnemies.map((we, index) => (
                                        <div key={index} style={{display: 'flex', gap: 8, marginBottom: 8}}>
                                            <Select
                                                style={{width: 150}}
                                                value={we.enemyId}
                                                onChange={(value) => {
                                                    const newEnemies = [...waveEnemies];
                                                    newEnemies[index].enemyId = value;
                                                    setWaveEnemies(newEnemies);
                                                }}
                                            >
                                                {enemies.map(e => (
                                                    <Select.Option key={e.id} value={e.id}>
                                                        {e.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <InputNumber
                                                min={1}
                                                value={we.count}
                                                onChange={(value) => {
                                                    const newEnemies = [...waveEnemies];
                                                    newEnemies[index].count = value || 1;
                                                    setWaveEnemies(newEnemies);
                                                }}
                                                placeholder="数量"
                                            />
                                            <Button
                                                danger
                                                onClick={() => {
                                                    const newEnemies = waveEnemies.filter((_, i) => i !== index);
                                                    setWaveEnemies(newEnemies);
                                                }}
                                            >
                                                移除
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        icon={<PlusOutlined/>}
                                        onClick={() => {
                                            setWaveEnemies([
                                                ...waveEnemies,
                                                {enemyId: enemies[0]?.id || 1, count: 5},
                                            ]);
                                        }}
                                    >
                                        添加敌人
                                    </Button>
                                </div>
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" onClick={handleWaveOk}>
                                        保存
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setEditingWave(null);
                                            setWaveEnemies([]);
                                            waveForm.resetFields();
                                        }}
                                    >
                                        取消
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                )}
            </Modal>
        </div>
    );
};

export default MapEditor;
