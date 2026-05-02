import request from '../request'
import type {PageResult, ResponseData} from './types'

// ============================================
// 地图相关API
// ============================================

export function pageQueryMaps(data: MapPageQuery): Promise<ResponseData<PageResult<TdMap>>> {
    return request.post('/td/map/pageQuery', data)
}

export function getMapDetail(id: number): Promise<ResponseData<TdMap>> {
    return request.get(`/td/map/detail/${id}`)
}

export function getAvailableMaps(): Promise<ResponseData<TdMap[]>> {
    return request.get('/td/map/available')
}

export function saveMap(data: MapSaveRequest): Promise<ResponseData<TdMap>> {
    return request.post('/td/map/save', data)
}

export function deleteMap(id: number): Promise<ResponseData<void>> {
    return request.delete(`/td/map/${id}`)
}

// ============================================
// 塔相关API
// ============================================

export function pageQueryTowers(data: TowerPageQuery): Promise<ResponseData<PageResult<TdTower>>> {
    return request.post('/td/tower/pageQuery', data)
}

export function getTowerDetail(id: number): Promise<ResponseData<TdTower>> {
    return request.get(`/td/tower/detail/${id}`)
}

export function getAvailableTowers(currentWave?: number): Promise<ResponseData<TdTower[]>> {
    return request.get('/td/tower/available', {params: {currentWave}})
}

export function saveTower(data: TowerSaveRequest): Promise<ResponseData<TdTower>> {
    return request.post('/td/tower/save', data)
}

export function deleteTower(id: number): Promise<ResponseData<void>> {
    return request.delete(`/td/tower/${id}`)
}

// ============================================
// 敌人相关API
// ============================================

export function pageQueryEnemies(data: EnemyPageQuery): Promise<ResponseData<PageResult<TdEnemy>>> {
    return request.post('/td/enemy/pageQuery', data)
}

export function getEnemyDetail(id: number): Promise<ResponseData<TdEnemy>> {
    return request.get(`/td/enemy/detail/${id}`)
}

export function getAvailableEnemies(): Promise<ResponseData<TdEnemy[]>> {
    return request.get('/td/enemy/available')
}

export function saveEnemy(data: EnemySaveRequest): Promise<ResponseData<TdEnemy>> {
    return request.post('/td/enemy/save', data)
}

export function deleteEnemy(id: number): Promise<ResponseData<void>> {
    return request.delete(`/td/enemy/${id}`)
}

// ============================================
// 波次相关API
// ============================================

export function pageQueryWaves(data: WavePageQuery): Promise<ResponseData<PageResult<TdWave>>> {
    return request.post('/td/wave/pageQuery', data)
}

export function getWaveDetail(id: number): Promise<ResponseData<TdWave>> {
    return request.get(`/td/wave/detail/${id}`)
}

export function getWavesByMapId(mapId: number): Promise<ResponseData<TdWave[]>> {
    return request.get(`/td/wave/byMap/${mapId}`)
}

export function saveWave(data: WaveSaveRequest): Promise<ResponseData<TdWave>> {
    return request.post('/td/wave/save', data)
}

export function deleteWave(id: number): Promise<ResponseData<void>> {
    return request.delete(`/td/wave/${id}`)
}

// ============================================
// 游戏核心API
// ============================================

export function initGame(data: GameInitRequest): Promise<ResponseData<GameInitResponse>> {
    return request.post('/td/game/init', data)
}

export function placeTower(data: PlaceTowerRequest): Promise<ResponseData<PlaceTowerResponse>> {
    return request.post('/td/game/placeTower', data)
}

export function upgradeTower(data: UpgradeTowerRequest): Promise<ResponseData<UpgradeTowerResponse>> {
    return request.post('/td/game/upgradeTower', data)
}

export function sellTower(data: SellTowerRequest): Promise<ResponseData<SellTowerResponse>> {
    return request.post('/td/game/sellTower', data)
}

export function startWave(data: StartWaveRequest): Promise<ResponseData<StartWaveResponse>> {
    return request.post('/td/game/startWave', data)
}

export function syncBattle(data: BattleSyncRequest): Promise<ResponseData<BattleSyncResponse>> {
    return request.post('/td/game/syncBattle', data)
}

export function endGame(gameSessionId: string, gameStatus: number): Promise<ResponseData<void>> {
    return request.post(`/td/game/endGame/${gameSessionId}/${gameStatus}`)
}

// ============================================
// 布局相关API
// ============================================

export function saveLayout(data: SaveLayoutRequest): Promise<ResponseData<SaveLayoutResponse>> {
    return request.post('/td/layout/save', data)
}

export function importLayout(data: ImportLayoutRequest): Promise<ResponseData<ImportLayoutResponse>> {
    return request.post('/td/layout/import', data)
}

export function getMyLayouts(): Promise<ResponseData<TdLayout[]>> {
    return request.get('/td/layout/my')
}

export function getLayoutDetail(id: number): Promise<ResponseData<TdLayout>> {
    return request.get(`/td/layout/detail/${id}`)
}

export function deleteLayout(id: number): Promise<ResponseData<void>> {
    return request.delete(`/td/layout/${id}`)
}

// ============================================
// 排行榜相关API
// ============================================

export function pageQueryLeaderboard(data: LeaderboardPageQuery): Promise<ResponseData<PageResult<LeaderboardItem>>> {
    return request.post('/td/leaderboard/pageQuery', data)
}

export function getMyBestWave(mapId?: number): Promise<ResponseData<number>> {
    return request.get('/td/leaderboard/myBest', {params: {mapId}})
}

// ============================================
// 类型定义
// ============================================

export interface TdMap {
    id: number
    name: string
    description: string
    mapWidth: number
    mapHeight: number
    tileSize: number
    gridData: string
    pathData: string
    startGold: number
    playerHp: number
    totalWaves: number
    status: number
    createTime: number
    updateTime: number
}

export interface TdTower {
    id: number
    name: string
    towerType: number
    description: string
    baseCost: number
    baseDamage: number
    baseAttackSpeed: number
    baseRange: number
    upgradeCost: number
    damageUpgradeRate: number
    attackSpeedUpgradeRate: number
    rangeUpgrade: number
    icon: string
    color: string
    specialEffect: string
    unlockWave: number
    status: number
}

export interface TdEnemy {
    id: number
    name: string
    enemyType: number
    description: string
    baseHp: number
    baseSpeed: number
    speedMultiplier: number
    reward: number
    icon: string
    color: string
    armor: number
    magicResistance: number
    specialAbility: string
    status: number
}

export interface TdWave {
    id: number
    mapId: number
    waveNumber: number
    name: string
    totalEnemies: number
    spawnInterval: number
    difficultyMultiplier: number
    bonusGold: number
    status: number
}

export interface TdWaveEnemy {
    id: number
    waveId: number
    enemyId: number
    count: number
    hpMultiplier: number
    speedMultiplier: number
    spawnOrder: number
    status: number
}

export interface TdLayout {
    id: number
    userId: number
    mapId: number
    name: string
    layoutData: string
    shareCode: string
    downloadCount: number
    isPublic: number
    status: number
}

export interface LeaderboardItem {
    id: number
    userId: number
    username: string
    nickname: string
    mapId: number
    mapName: string
    maxWaveReached: number
    totalGoldEarned: number
    totalDamageDealt: number
    enemiesKilled: number
    playTime: number
    createTime: number
    rank: number
}

// ============================================
// 请求参数类型
// ============================================

export interface MapPageQuery {
    pageNo?: number
    pageSize?: number
    name?: string
    status?: number
}

export interface MapSaveRequest {
    id?: number
    name: string
    description?: string
    mapWidth: number
    mapHeight: number
    tileSize: number
    gridData: string
    pathData: string
    startGold: number
    playerHp: number
    totalWaves: number
    status?: number
}

export interface TowerPageQuery {
    pageNo?: number
    pageSize?: number
    name?: string
    towerType?: number
    status?: number
}

export interface TowerSaveRequest {
    id?: number
    name: string
    towerType: number
    description?: string
    baseCost: number
    baseDamage: number
    baseAttackSpeed: number
    baseRange: number
    upgradeCost: number
    damageUpgradeRate?: number
    attackSpeedUpgradeRate?: number
    rangeUpgrade?: number
    icon?: string
    color?: string
    specialEffect?: string
    unlockWave?: number
    status?: number
}

export interface EnemyPageQuery {
    pageNo?: number
    pageSize?: number
    name?: string
    enemyType?: number
    status?: number
}

export interface EnemySaveRequest {
    id?: number
    name: string
    enemyType: number
    description?: string
    baseHp: number
    baseSpeed: number
    speedMultiplier: number
    reward: number
    icon?: string
    color?: string
    armor?: number
    magicResistance?: number
    specialAbility?: string
    status?: number
}

export interface WavePageQuery {
    pageNo?: number
    pageSize?: number
    mapId?: number
    waveNumber?: number
    status?: number
}

export interface WaveSaveRequest {
    id?: number
    mapId: number
    waveNumber: number
    name?: string
    totalEnemies: number
    spawnInterval: number
    difficultyMultiplier?: number
    bonusGold?: number
    status?: number
    enemies?: WaveEnemySaveRequest[]
}

export interface WaveEnemySaveRequest {
    id?: number
    waveId?: number
    enemyId: number
    count: number
    hpMultiplier?: number
    speedMultiplier?: number
    spawnOrder?: number
    status?: number
}

export interface LeaderboardPageQuery {
    pageNo?: number
    pageSize?: number
    mapId?: number
    userId?: number
}

// ============================================
// 游戏请求参数
// ============================================

export interface GameInitRequest {
    mapId: number
    layoutId?: number
    shareCode?: string
}

export interface PlaceTowerRequest {
    gameSessionId: string
    towerId: number
    gridX: number
    gridY: number
}

export interface UpgradeTowerRequest {
    gameSessionId: string
    towerInstanceId: string
    targetLevel: number
}

export interface SellTowerRequest {
    gameSessionId: string
    towerInstanceId: string
}

export interface StartWaveRequest {
    gameSessionId: string
    waveNumber: number
}

export interface BattleSyncRequest {
    gameSessionId: string
    timestamp: number
    towerAttacks?: TowerAttackRecord[]
    enemyMoves?: EnemyMoveRecord[]
    enemyDamages?: EnemyDamageRecord[]
    currentGold?: number
    currentHp?: number
}

export interface TowerAttackRecord {
    towerInstanceId: string
    targetEnemyId: string
    attackTime: number
    damage: number
}

export interface EnemyMoveRecord {
    enemyInstanceId: string
    positionX: number
    positionY: number
    pathIndex: number
}

export interface EnemyDamageRecord {
    enemyInstanceId: string
    damage: number
    sourceTowerId?: string
}

export interface SaveLayoutRequest {
    name: string
    mapId: number
    layoutData: string
    isPublic?: number
}

export interface ImportLayoutRequest {
    shareCode: string
}

// ============================================
// 游戏响应类型
// ============================================

export interface GameInitResponse {
    gameSessionId: string
    mapId: number
    mapName: string
    mapWidth: number
    mapHeight: number
    tileSize: number
    gridData: string
    pathData: PathPoint[]
    startGold: number
    playerHp: number
    totalWaves: number
    availableTowers: TowerInfo[]
    waveInfos: WaveInfo[]
}

export interface PathPoint {
    x: number
    y: number
}

export interface TowerInfo {
    id: number
    name: string
    towerType: number
    description: string
    baseCost: number
    baseDamage: number
    baseAttackSpeed: number
    baseRange: number
    upgradeCost: number
    icon: string
    color: string
    specialEffect: string
    unlockWave: number
}

export interface WaveInfo {
    id: number
    waveNumber: number
    name: string
    totalEnemies: number
    spawnInterval: number
    difficultyMultiplier: number
    bonusGold: number
    enemies: WaveEnemyInfo[]
}

export interface WaveEnemyInfo {
    enemyId: number
    enemyName: string
    enemyType: number
    count: number
    hpMultiplier: number
    speedMultiplier: number
    spawnOrder: number
}

export interface BattleSyncResponse {
    isValid: boolean
    validationMessage: string
    serverGold: number
    serverHp: number
    currentWave: number
    gameStatus: number
    enemyStates: EnemyState[]
    towerStates: TowerState[]
    serverEvents: ServerEvent[]
}

export interface EnemyState {
    instanceId: string
    enemyId: number
    currentHp: number
    maxHp: number
    positionX: number
    positionY: number
    pathIndex: number
    isAlive: boolean
    slowEffect: number
    isFrozen: boolean
}

export interface TowerState {
    instanceId: string
    towerId: number
    level: number
    gridX: number
    gridY: number
    lastAttackTime: number
}

export interface ServerEvent {
    eventType: string
    timestamp: number
    targetId: string
    amount: number
    message: string
}

export interface PlaceTowerResponse {
    success: boolean
    message: string
    towerInstanceId: string
    towerId: number
    gridX: number
    gridY: number
    remainingGold: number
    towerLevel: number
}

export interface UpgradeTowerResponse {
    success: boolean
    message: string
    towerInstanceId: string
    newLevel: number
    remainingGold: number
    upgradedDamage: number
    upgradedAttackSpeed: number
    upgradedRange: number
}

export interface SellTowerResponse {
    success: boolean
    message: string
    refundGold: number
    remainingGold: number
}

export interface StartWaveResponse {
    success: boolean
    message: string
    waveNumber: number
    spawnInterval: number
    spawnOrder: EnemySpawnInfo[]
}

export interface EnemySpawnInfo {
    instanceId: string
    enemyId: number
    spawnOrder: number
    maxHp: number
    baseSpeed: number
}

export interface SaveLayoutResponse {
    success: boolean
    message: string
    layoutId: number
    shareCode: string
}

export interface ImportLayoutResponse {
    success: boolean
    message: string
    layoutId: number
    layoutName: string
    mapId: number
    layoutData: string
    towerPlacements: TowerPlacement[]
}

export interface TowerPlacement {
    towerId: number
    gridX: number
    gridY: number
    level: number
}
