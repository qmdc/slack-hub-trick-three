import React, {useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle} from 'react';
import type {TowerInfo, EnemyState, TowerState, PathPoint, TowerPlacement} from '../../apis/modules/towerdefense';
import './TowerDefenseGame.module.scss';

// ============================================
// 游戏常量
// ============================================
const CELL_TYPES = {
    EMPTY: 0,
    PATH: 1,
    BLOCKED: 2,
    START: 3,
    END: 4,
};

const COLORS = {
    GRID: '#3a3a4a',
    GRID_LINE: '#2a2a3a',
    PATH: '#5a5a6a',
    EMPTY: '#4a4a5a',
    TOWER_RANGE: 'rgba(100, 200, 255, 0.1)',
    TOWER_RANGE_BORDER: 'rgba(100, 200, 255, 0.3)',
    ENEMY_HP_BG: '#ff4444',
    ENEMY_HP_FILL: '#44ff44',
};

// ============================================
// 类型定义
// ============================================
export interface TowerInstance {
    id: string;
    towerId: number;
    towerType: number;
    level: number;
    gridX: number;
    gridY: number;
    damage: number;
    attackSpeed: number;
    range: number;
    rangePixels: number;
    lastAttackTime: number;
    color: string;
    isSelected?: boolean;
}

export interface EnemyInstance {
    id: string;
    enemyId: number;
    enemyType: number;
    currentHp: number;
    maxHp: number;
    positionX: number;
    positionY: number;
    pathIndex: number;
    baseSpeed: number;
    speedMultiplier: number;
    slowEffect: number;
    isFrozen: boolean;
    isAlive: boolean;
    color: string;
    reward: number;
}

interface Projectile {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    color: string;
    damage: number;
    speed: number;
    towerId: string;
    targetEnemyId: string;
}

export interface GameCanvasProps {
    mapWidth: number;
    mapHeight: number;
    tileSize: number;
    gridData: string;
    pathData: PathPoint[];
    availableTowers: TowerInfo[];
    currentGold: number;
    onGoldChange: (gold: number) => void;
    onTowerPlaced: (tower: TowerInstance) => void;
    onTowerSelected: (tower: TowerInstance | null) => void;
    selectedTowerType: TowerInfo | null;
    gameSessionId: string;
    isPlaying: boolean;
}

export interface TowerDefenseGameRef {
    addEnemies: (enemies: EnemyInstance[]) => void;
    getTowers: () => TowerInstance[];
    updateTower: (towerId: string, updates: Partial<TowerInstance>) => void;
    removeTower: (towerId: string) => void;
    getKilledEnemies: () => EnemyInstance[];
}

// ============================================
// 组件实现
// ============================================
const TowerDefenseGame = forwardRef<TowerDefenseGameRef, GameCanvasProps>(({
    mapWidth,
    mapHeight,
    tileSize,
    gridData,
    pathData,
    availableTowers,
    currentGold,
    onGoldChange,
    onTowerPlaced,
    onTowerSelected,
    selectedTowerType,
    gameSessionId,
    isPlaying,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [grid, setGrid] = useState<number[]>([]);
    const [towers, setTowers] = useState<TowerInstance[]>([]);
    const [enemies, setEnemies] = useState<EnemyInstance[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [selectedTower, setSelectedTower] = useState<TowerInstance | null>(null);
    const [hoverCell, setHoverCell] = useState<{x: number, y: number} | null>(null);
    const gameLoopRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);

    // 初始化网格数据
    useEffect(() => {
        try {
            const parsed = JSON.parse(gridData);
            if (Array.isArray(parsed)) {
                setGrid(parsed);
            }
        } catch (e) {
            console.error('解析网格数据失败:', e);
        }
    }, [gridData]);

    // 获取网格类型
    const getCellType = useCallback((x: number, y: number): number => {
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            return CELL_TYPES.BLOCKED;
        }
        const index = y * mapWidth + x;
        return grid[index] ?? CELL_TYPES.BLOCKED;
    }, [grid, mapWidth, mapHeight]);

    // 检查是否可以放置塔
    const canPlaceTower = useCallback((x: number, y: number): boolean => {
        if (isPlaying) return false;
        const cellType = getCellType(x, y);
        if (cellType !== CELL_TYPES.EMPTY) return false;
        return !towers.some(t => t.gridX === x && t.gridY === y);
    }, [getCellType, towers, isPlaying]);

    // 放置塔
    const handlePlaceTower = useCallback((gridX: number, gridY: number) => {
        if (!selectedTowerType) return;
        if (!canPlaceTower(gridX, gridY)) return;
        if (currentGold < selectedTowerType.baseCost) return;

        const newTower: TowerInstance = {
            id: `tower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            towerId: selectedTowerType.id,
            towerType: selectedTowerType.towerType,
            level: 1,
            gridX,
            gridY,
            damage: selectedTowerType.baseDamage,
            attackSpeed: selectedTowerType.baseAttackSpeed,
            range: selectedTowerType.baseRange,
            rangePixels: selectedTowerType.baseRange * tileSize,
            lastAttackTime: 0,
            color: selectedTowerType.color || '#4a9eff',
        };

        setTowers(prev => [...prev, newTower]);
        onGoldChange(currentGold - selectedTowerType.baseCost);
        onTowerPlaced(newTower);
    }, [selectedTowerType, canPlaceTower, currentGold, tileSize, onGoldChange, onTowerPlaced]);

    // 画布点击事件
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridX = Math.floor(x / tileSize);
        const gridY = Math.floor(y / tileSize);

        const clickedTower = towers.find(t => t.gridX === gridX && t.gridY === gridY);
        if (clickedTower) {
            setSelectedTower(clickedTower);
            onTowerSelected(clickedTower);
            return;
        }

        if (selectedTowerType && canPlaceTower(gridX, gridY)) {
            handlePlaceTower(gridX, gridY);
        } else {
            setSelectedTower(null);
            onTowerSelected(null);
        }
    }, [towers, selectedTowerType, canPlaceTower, handlePlaceTower, tileSize, onTowerSelected]);

    // 画布移动事件
    const handleCanvasMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridX = Math.floor(x / tileSize);
        const gridY = Math.floor(y / tileSize);

        if (gridX >= 0 && gridX < mapWidth && gridY >= 0 && gridY < mapHeight) {
            setHoverCell({x: gridX, y: gridY});
        } else {
            setHoverCell(null);
        }
    }, [tileSize, mapWidth, mapHeight]);

    // 绘制游戏
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = mapWidth * tileSize;
        const height = mapHeight * tileSize;

        ctx.clearRect(0, 0, width, height);

        // 绘制网格
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const cellType = getCellType(x, y);
                const px = x * tileSize;
                const py = y * tileSize;

                switch (cellType) {
                    case CELL_TYPES.EMPTY:
                        ctx.fillStyle = COLORS.EMPTY;
                        break;
                    case CELL_TYPES.PATH:
                    case CELL_TYPES.START:
                    case CELL_TYPES.END:
                        ctx.fillStyle = COLORS.PATH;
                        break;
                    default:
                        ctx.fillStyle = COLORS.BLOCKED;
                }
                ctx.fillRect(px, py, tileSize, tileSize);

                ctx.strokeStyle = COLORS.GRID_LINE;
                ctx.lineWidth = 1;
                ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);
            }
        }

        // 绘制起点和终点
        if (pathData.length > 0) {
            pathData.forEach((point, index) => {
                const px = point.x * tileSize + tileSize / 2;
                const py = point.y * tileSize + tileSize / 2;

                if (index === 0) {
                    ctx.fillStyle = '#44ff44';
                    ctx.beginPath();
                    ctx.arc(px, py, tileSize / 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (index === pathData.length - 1) {
                    ctx.fillStyle = '#ff4444';
                    ctx.beginPath();
                    ctx.arc(px, py, tileSize / 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // 绘制悬停格子
        if (hoverCell && selectedTowerType) {
            const canPlace = canPlaceTower(hoverCell.x, hoverCell.y);
            const px = hoverCell.x * tileSize;
            const py = hoverCell.y * tileSize;

            ctx.fillStyle = canPlace ? 'rgba(68, 255, 68, 0.3)' : 'rgba(255, 68, 68, 0.3)';
            ctx.fillRect(px, py, tileSize, tileSize);

            if (canPlace) {
                const centerX = px + tileSize / 2;
                const centerY = py + tileSize / 2;
                const rangePixels = selectedTowerType.baseRange * tileSize;

                ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(centerX, centerY, rangePixels, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // 绘制塔
        towers.forEach(tower => {
            const centerX = tower.gridX * tileSize + tileSize / 2;
            const centerY = tower.gridY * tileSize + tileSize / 2;

            if (selectedTower?.id === tower.id) {
                ctx.fillStyle = COLORS.TOWER_RANGE;
                ctx.strokeStyle = COLORS.TOWER_RANGE_BORDER;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, tower.rangePixels, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = tower.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, tileSize / 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Lv${tower.level}`, centerX, centerY);
        });

        // 绘制敌人
        enemies.forEach(enemy => {
            if (!enemy.isAlive) return;

            const px = enemy.positionX * tileSize + tileSize / 2;
            const py = enemy.positionY * tileSize + tileSize / 2;

            ctx.fillStyle = enemy.isFrozen ? '#88ccff' : enemy.color;
            ctx.beginPath();
            ctx.arc(px, py, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            const hpBarWidth = tileSize * 0.8;
            const hpBarHeight = 6;
            const hpBarX = px - hpBarWidth / 2;
            const hpBarY = py - tileSize / 2.5 - hpBarHeight - 2;

            ctx.fillStyle = COLORS.ENEMY_HP_BG;
            ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

            const hpPercent = enemy.currentHp / enemy.maxHp;
            ctx.fillStyle = hpPercent > 0.5 ? COLORS.ENEMY_HP_FILL : hpPercent > 0.25 ? '#ffaa00' : '#ff4444';
            ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        });

        // 绘制投射物
        projectiles.forEach(proj => {
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

    }, [mapWidth, mapHeight, tileSize, getCellType, pathData, hoverCell, selectedTowerType, canPlaceTower, towers, enemies, projectiles, selectedTower]);

    // 游戏循环
    useEffect(() => {
        const gameLoop = (timestamp: number) => {
            if (!lastTimeRef.current) {
                lastTimeRef.current = timestamp;
            }
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            try {
                if (isPlaying && pathData.length > 0) {
                    setEnemies(prev => {
                        return prev.map(enemy => {
                            if (!enemy.isAlive) return enemy;

                            const speed = enemy.baseSpeed * enemy.speedMultiplier * enemy.slowEffect * (deltaTime / 1000);
                            let newPathIndex = enemy.pathIndex + speed;

                            if (newPathIndex >= pathData.length) {
                                return {...enemy, pathIndex: pathData.length - 1, isAlive: false};
                            }

                            if (newPathIndex < 0) {
                                const startPoint = pathData[0];
                                return {
                                    ...enemy,
                                    positionX: startPoint.x,
                                    positionY: startPoint.y,
                                    pathIndex: newPathIndex,
                                };
                            }

                            const pathIndex = Math.floor(newPathIndex);
                            const pathProgress = newPathIndex - pathIndex;

                            if (pathIndex >= pathData.length - 1) {
                                const lastPoint = pathData[pathData.length - 1];
                                return {
                                    ...enemy,
                                    positionX: lastPoint.x,
                                    positionY: lastPoint.y,
                                    pathIndex: newPathIndex,
                                };
                            }

                            if (pathIndex < 0 || pathIndex >= pathData.length) {
                                return enemy;
                            }

                            const currentPoint = pathData[pathIndex];
                            const nextPoint = pathData[Math.min(pathIndex + 1, pathData.length - 1)];

                            if (!currentPoint || !nextPoint) {
                                return enemy;
                            }

                            return {
                                ...enemy,
                                positionX: currentPoint.x + (nextPoint.x - currentPoint.x) * pathProgress,
                                positionY: currentPoint.y + (nextPoint.y - currentPoint.y) * pathProgress,
                                pathIndex: newPathIndex,
                            };
                        });
                    });

                    setProjectiles(prev => {
                        return prev.filter(proj => {
                            try {
                                const dx = proj.targetX - proj.x;
                                const dy = proj.targetY - proj.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);

                                if (dist < proj.speed) {
                                    setEnemies(enemies => enemies.map(e => {
                                        if (e.id === proj.targetEnemyId) {
                                            const newHp = e.currentHp - proj.damage;
                                            if (newHp <= 0) {
                                                return {...e, currentHp: 0, isAlive: false};
                                            }
                                            return {...e, currentHp: newHp};
                                        }
                                        return e;
                                    }));
                                    return false;
                                }

                                proj.x += (dx / dist) * proj.speed;
                                proj.y += (dy / dist) * proj.speed;
                                return true;
                            } catch (e) {
                                console.error('Projectile update error:', e);
                                return false;
                            }
                        });
                    });

                    setTowers(prev => {
                        const now = Date.now();
                        return prev.map(tower => {
                            try {
                                const attackInterval = 1000 / tower.attackSpeed;
                                if (now - tower.lastAttackTime < attackInterval) {
                                    return tower;
                                }

                                const centerX = tower.gridX * tileSize + tileSize / 2;
                                const centerY = tower.gridY * tileSize + tileSize / 2;

                                const targetEnemy = enemies.find(e => {
                                    if (!e.isAlive) return false;
                                    try {
                                        const ex = e.positionX * tileSize + tileSize / 2;
                                        const ey = e.positionY * tileSize + tileSize / 2;
                                        const dx = ex - centerX;
                                        const dy = ey - centerY;
                                        return Math.sqrt(dx * dx + dy * dy) <= tower.rangePixels;
                                    } catch (e) {
                                        return false;
                                    }
                                });

                                if (targetEnemy) {
                                    const ex = targetEnemy.positionX * tileSize + tileSize / 2;
                                    const ey = targetEnemy.positionY * tileSize + tileSize / 2;

                                    setProjectiles(p => [...p, {
                                        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                        x: centerX,
                                        y: centerY,
                                        targetX: ex,
                                        targetY: ey,
                                        color: tower.color,
                                        damage: tower.damage,
                                        speed: 15,
                                        towerId: tower.id,
                                        targetEnemyId: targetEnemy.id,
                                    }]);

                                    return {...tower, lastAttackTime: now};
                                }

                                return tower;
                            } catch (e) {
                                console.error('Tower attack error:', e);
                                return tower;
                            }
                        });
                    });
                }
            } catch (e) {
                console.error('Game loop error:', e);
            }

            try {
                draw();
            } catch (e) {
                console.error('Draw error:', e);
            }

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [isPlaying, enemies, pathData, tileSize, draw]);

    // 暴露方法给外部
    const addEnemies = useCallback((newEnemies: EnemyInstance[]) => {
        setEnemies(prev => [...prev, ...newEnemies]);
    }, []);

    const getTowers = useCallback(() => towers, [towers]);

    const updateTower = useCallback((towerId: string, updates: Partial<TowerInstance>) => {
        setTowers(prev => prev.map(t => t.id === towerId ? {...t, ...updates} : t));
    }, []);

    const removeTower = useCallback((towerId: string) => {
        setTowers(prev => prev.filter(t => t.id !== towerId));
        if (selectedTower?.id === towerId) {
            setSelectedTower(null);
            onTowerSelected(null);
        }
    }, [selectedTower, onTowerSelected]);

    const getKilledEnemies = useCallback(() => {
        const killed = enemies.filter(e => !e.isAlive);
        setEnemies(prev => prev.filter(e => e.isAlive));
        return killed;
    }, [enemies]);

    useImperativeHandle(ref, () => ({
        addEnemies,
        getTowers,
        updateTower,
        removeTower,
        getKilledEnemies,
    }));

    return (
        <canvas
            ref={canvasRef}
            width={mapWidth * tileSize}
            height={mapHeight * tileSize}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoverCell(null)}
            style={{cursor: selectedTowerType ? 'crosshair' : 'default'}}
        />
    );
});

TowerDefenseGame.displayName = 'TowerDefenseGame';

export default TowerDefenseGame;
