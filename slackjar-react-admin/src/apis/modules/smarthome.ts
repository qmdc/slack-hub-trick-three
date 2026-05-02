import request from '../request'
import type {PageResult, ResponseData} from './types'

// ============================================
// 设备相关API
// ============================================

export function listDevices(): Promise<ResponseData<IotDevice[]>> {
    return request.get('/smart-home/device/list')
}

export function pageDevices(data: DevicePageQuery): Promise<ResponseData<PageResult<IotDevice>>> {
    return request.get('/smart-home/device/page', {params: data})
}

export function getDeviceDetail(id: number): Promise<ResponseData<IotDevice>> {
    return request.get(`/smart-home/device/${id}`)
}

export function saveDevice(data: IotDevice): Promise<ResponseData<IotDevice>> {
    return request.post('/smart-home/device/save', data)
}

export function deleteDevice(id: number): Promise<ResponseData<void>> {
    return request.delete(`/smart-home/device/${id}`)
}

export function controlDevice(id: number, data: ControlRequest): Promise<ResponseData<void>> {
    return request.post(`/smart-home/device/${id}/control`, data)
}

// ============================================
// 场景相关API
// ============================================

export function listScenes(data: ScenePageQuery): Promise<ResponseData<PageResult<Scene>>> {
    return request.get('/smart-home/scene/list', {params: data})
}

export function getSceneDetail(id: number): Promise<ResponseData<Scene>> {
    return request.get(`/smart-home/scene/${id}`)
}

export function saveScene(data: SceneSaveRequest): Promise<ResponseData<Scene>> {
    return request.post('/smart-home/scene/save', data)
}

export function deleteScene(id: number): Promise<ResponseData<void>> {
    return request.delete(`/smart-home/scene/${id}`)
}

export function executeScene(id: number): Promise<ResponseData<void>> {
    return request.post(`/smart-home/scene/${id}/execute`)
}

// ============================================
// 定时任务API
// ============================================

export function listTasks(data: TaskPageQuery): Promise<ResponseData<PageResult<ScheduleTask>>> {
    return request.get('/smart-home/task/list', {params: data})
}

export function getTaskDetail(id: number): Promise<ResponseData<ScheduleTask>> {
    return request.get(`/smart-home/task/${id}`)
}

export function saveTask(data: ScheduleTask): Promise<ResponseData<ScheduleTask>> {
    return request.post('/smart-home/task/save', data)
}

export function deleteTask(id: number): Promise<ResponseData<void>> {
    return request.delete(`/smart-home/task/${id}`)
}

export function startTask(id: number): Promise<ResponseData<void>> {
    return request.post(`/smart-home/task/${id}/start`)
}

export function stopTask(id: number): Promise<ResponseData<void>> {
    return request.post(`/smart-home/task/${id}/stop`)
}

// ============================================
// 联动规则API
// ============================================

export function listRules(data: RulePageQuery): Promise<ResponseData<PageResult<LinkageRule>>> {
    return request.get('/smart-home/rule/list', {params: data})
}

export function getRuleDetail(id: number): Promise<ResponseData<LinkageRule>> {
    return request.get(`/smart-home/rule/${id}`)
}

export function saveRule(data: LinkageRule): Promise<ResponseData<LinkageRule>> {
    return request.post('/smart-home/rule/save', data)
}

export function deleteRule(id: number): Promise<ResponseData<void>> {
    return request.delete(`/smart-home/rule/${id}`)
}

export function enableRule(id: number): Promise<ResponseData<void>> {
    return request.post(`/smart-home/rule/${id}/enable`)
}

export function disableRule(id: number): Promise<ResponseData<void>> {
    return request.post(`/smart-home/rule/${id}/disable`)
}

// ============================================
// 能耗统计API
// ============================================

export function getDailyEnergy(deviceId: number, date?: number): Promise<ResponseData<Record<string, number>>> {
    return request.get(`/smart-home/energy/daily/${deviceId}`, {params: {date}})
}

export function getWeeklyEnergy(deviceId: number): Promise<ResponseData<Record<string, number>>> {
    return request.get(`/smart-home/energy/weekly/${deviceId}`)
}

export function getMonthlyEnergy(deviceId: number): Promise<ResponseData<Record<string, number>>> {
    return request.get(`/smart-home/energy/monthly/${deviceId}`)
}

export function getEnergyAnalysis(): Promise<ResponseData<EnergyAnalysisItem[]>> {
    return request.get('/smart-home/energy/analysis')
}

export function getEnergySuggestions(): Promise<ResponseData<EnergySuggestion[]>> {
    return request.get('/smart-home/energy/suggestions')
}

// ============================================
// 告警相关API
// ============================================

export function listAlerts(data: AlertPageQuery): Promise<ResponseData<PageResult<AlertRecord>>> {
    return request.get('/smart-home/alert/list', {params: data})
}

export function getAlertDetail(id: number): Promise<ResponseData<AlertRecord>> {
    return request.get(`/smart-home/alert/${id}`)
}

export function handleAlert(id: number, status: number): Promise<ResponseData<void>> {
    return request.post(`/smart-home/alert/handle/${id}`, null, {params: {status}})
}

// ============================================
// 类型定义
// ============================================

export interface IotDevice {
    id: number
    deviceName: string
    deviceType: number
    deviceCode: string
    status: number
    powerStatus: number
    brightness: number
    temperature: number
    humidity: number
    position: string
    roomId: number
    createTime: number
    updateTime: number
}

export interface ControlRequest {
    powerStatus?: number
    brightness?: number
    temperature?: number
}

export interface DevicePageQuery {
    pageNo?: number
    pageSize?: number
    deviceName?: string
    deviceType?: number
    status?: number
}

export interface Scene {
    id: number
    sceneName: string
    description: string
    icon: string
    status: number
    isDefault: number
    createTime: number
    updateTime: number
}

export interface SceneSaveRequest {
    id?: number
    sceneName: string
    description?: string
    icon?: string
    status?: number
    isDefault?: number
    triggers?: SceneTrigger[]
    actions?: SceneAction[]
}

export interface SceneTrigger {
    triggerType: number
    triggerCondition: string
}

export interface SceneAction {
    actionType: number
    targetDeviceId: number
    actionParams: string
    actionDelay?: number
}

export interface ScenePageQuery {
    pageNo?: number
    pageSize?: number
    sceneName?: string
    status?: number
}

export interface ScheduleTask {
    id: number
    taskName: string
    taskType: number
    cronExpression: string
    startTime: number
    endTime: number
    repeatInterval: number
    repeatCount: number
    targetSceneId: number
    status: number
    lastRunTime: number
    nextRunTime: number
    createTime: number
    updateTime: number
}

export interface TaskPageQuery {
    pageNo?: number
    pageSize?: number
    taskName?: string
    status?: number
}

export interface LinkageRule {
    id: number
    ruleName: string
    ruleDescription: string
    triggerDeviceId: number
    triggerCondition: string
    actionDeviceId: number
    actionParams: string
    status: number
    priority: number
    createTime: number
    updateTime: number
}

export interface RulePageQuery {
    pageNo?: number
    pageSize?: number
    ruleName?: string
    status?: number
}

export interface AlertRecord {
    id: number
    deviceId: number
    alertType: number
    alertLevel: number
    alertMessage: string
    alertTime: number
    status: number
    createTime: number
    updateTime: number
}

export interface AlertPageQuery {
    pageNo?: number
    pageSize?: number
    deviceId?: number
    alertType?: number
    status?: number
}

export interface EnergyAnalysisItem {
    deviceName: string
    totalEnergy: number
    avgDaily: number
    trend: 'up' | 'down' | 'stable'
}

export interface EnergySuggestion {
    id: number
    title: string
    description: string
    type: 'high' | 'medium' | 'low'
    estimatedSavings: string
}