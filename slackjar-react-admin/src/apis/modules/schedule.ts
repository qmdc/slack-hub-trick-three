import request from '../request'
import type {PageResult, ResponseData} from './types'

// ============================================
// 时间块相关API
// ============================================

export function pageQueryTimeBlocks(data: TimeBlockPageQuery): Promise<ResponseData<PageResult<ScheduleTimeBlock>>> {
    return request.post('/schedule/time-block/pageQuery', data)
}

export function getTimeBlockDetail(id: number): Promise<ResponseData<ScheduleTimeBlock>> {
    return request.get(`/schedule/time-block/detail/${id}`)
}

export function getTimeBlocksByDateRange(startTime: number, endTime: number): Promise<ResponseData<ScheduleTimeBlock[]>> {
    return request.get('/schedule/time-block/byDateRange', {params: {startTime, endTime}})
}

export function saveTimeBlock(data: TimeBlockSaveRequest): Promise<ResponseData<ScheduleTimeBlock>> {
    return request.post('/schedule/time-block/save', data)
}

export function batchCreateTimeBlocksFromTemplate(data: TimeBlockBatchSaveRequest): Promise<ResponseData<ScheduleTimeBlock[]>> {
    return request.post('/schedule/time-block/batchCreateFromTemplate', data)
}

export function deleteTimeBlock(id: number): Promise<ResponseData<void>> {
    return request.delete(`/schedule/time-block/${id}`)
}

// ============================================
// 任务相关API
// ============================================

export function pageQueryTasks(data: TaskPageQuery): Promise<ResponseData<PageResult<ScheduleTask>>> {
    return request.post('/schedule/task/pageQuery', data)
}

export function getTaskDetail(id: number): Promise<ResponseData<ScheduleTask>> {
    return request.get(`/schedule/task/detail/${id}`)
}

export function getPendingTasks(): Promise<ResponseData<ScheduleTask[]>> {
    return request.get('/schedule/task/pending')
}

export function getTasksByPriority(priority: number): Promise<ResponseData<ScheduleTask[]>> {
    return request.get(`/schedule/task/byPriority/${priority}`)
}

export function saveTask(data: TaskSaveRequest): Promise<ResponseData<ScheduleTask>> {
    return request.post('/schedule/task/save', data)
}

export function updateTaskStatus(id: number, status: number): Promise<ResponseData<void>> {
    return request.put(`/schedule/task/status/${id}/${status}`)
}

export function deleteTask(id: number): Promise<ResponseData<void>> {
    return request.delete(`/schedule/task/${id}`)
}

// ============================================
// 模板相关API
// ============================================

export function pageQueryTemplates(data: TemplatePageQuery): Promise<ResponseData<PageResult<ScheduleTemplate>>> {
    return request.post('/schedule/template/pageQuery', data)
}

export function getTemplateDetail(id: number): Promise<ResponseData<ScheduleTemplate>> {
    return request.get(`/schedule/template/detail/${id}`)
}

export function getTemplatesByType(templateType: number): Promise<ResponseData<ScheduleTemplate[]>> {
    return request.get(`/schedule/template/byType/${templateType}`)
}

export function getDefaultTemplate(templateType: number): Promise<ResponseData<ScheduleTemplate>> {
    return request.get(`/schedule/template/default/${templateType}`)
}

export function saveTemplate(data: TemplateSaveRequest): Promise<ResponseData<ScheduleTemplate>> {
    return request.post('/schedule/template/save', data)
}

export function setDefaultTemplate(id: number): Promise<ResponseData<void>> {
    return request.put(`/schedule/template/setDefault/${id}`)
}

export function deleteTemplate(id: number): Promise<ResponseData<void>> {
    return request.delete(`/schedule/template/${id}`)
}

// ============================================
// 番茄钟相关API
// ============================================

export function getCurrentPomodoro(): Promise<ResponseData<PomodoroRecord>> {
    return request.get('/schedule/pomodoro/current')
}

export function getPomodorosByDateRange(startTime: number, endTime: number): Promise<ResponseData<PomodoroRecord[]>> {
    return request.get('/schedule/pomodoro/byDateRange', {params: {startTime, endTime}})
}

export function startPomodoro(data: PomodoroStartRequest): Promise<ResponseData<PomodoroRecord>> {
    return request.post('/schedule/pomodoro/start', data)
}

export function completePomodoro(id: number): Promise<ResponseData<PomodoroRecord>> {
    return request.post(`/schedule/pomodoro/complete/${id}`)
}

export function interruptPomodoro(id: number, reason?: string): Promise<ResponseData<PomodoroRecord>> {
    return request.post(`/schedule/pomodoro/interrupt/${id}`, null, {params: {reason}})
}

export function abandonPomodoro(id: number): Promise<ResponseData<PomodoroRecord>> {
    return request.post(`/schedule/pomodoro/abandon/${id}`)
}

// ============================================
// 统计相关API
// ============================================

export function getTimeDistribution(startTime: number, endTime: number): Promise<ResponseData<TimeDistributionResponse>> {
    return request.get('/schedule/pomodoro/statistics/timeDistribution', {params: {startTime, endTime}})
}

export function getFocusTrend(startTime: number, endTime: number): Promise<ResponseData<FocusTrendResponse>> {
    return request.get('/schedule/pomodoro/statistics/focusTrend', {params: {startTime, endTime}})
}

export function getEfficiencyAnalysis(startTime: number, endTime: number): Promise<ResponseData<EfficiencyAnalysisResponse>> {
    return request.get('/schedule/pomodoro/statistics/efficiencyAnalysis', {params: {startTime, endTime}})
}

// ============================================
// 类型定义
// ============================================

export interface ScheduleTimeBlock {
    id: number
    userId: number
    taskId?: number
    blockType: number
    title: string
    description?: string
    startTime: number
    endTime: number
    dayOfWeek?: number
    color: string
    priority?: number
    status: number
    remark?: string
    createTime: number
    updateTime: number
}

export interface ScheduleTask {
    id: number
    userId: number
    title: string
    description?: string
    priority?: number
    dueTime?: number
    estimatedMinutes?: number
    actualMinutes?: number
    taskType?: number
    status: number
    remark?: string
    createTime: number
    updateTime: number
}

export interface ScheduleTemplate {
    id: number
    userId: number
    name: string
    templateType: number
    templateData?: string
    description?: string
    isDefault?: number
    status: number
    createTime: number
    updateTime: number
}

export interface PomodoroRecord {
    id: number
    userId: number
    taskId?: number
    timeBlockId?: number
    plannedMinutes: number
    actualMinutes?: number
    startTime: number
    endTime?: number
    status: number
    interruptReason?: string
    remark?: string
    createTime: number
    updateTime: number
}

// ============================================
// 请求参数类型
// ============================================

export interface TimeBlockPageQuery {
    pageNo?: number
    pageSize?: number
    startTime?: number
    endTime?: number
    blockType?: number
    priority?: number
    status?: number
}

export interface TimeBlockSaveRequest {
    id?: number
    taskId?: number
    blockType: number
    title: string
    description?: string
    startTime: number
    endTime: number
    dayOfWeek?: number
    color?: string
    priority?: number
    status?: number
    remark?: string
}

export interface TimeBlockBatchSaveRequest {
    timeBlocks: TimeBlockSaveRequest[]
    targetDate?: number
}

export interface TaskPageQuery {
    pageNo?: number
    pageSize?: number
    title?: string
    priority?: number
    taskType?: number
    status?: number
    dueTimeStart?: number
    dueTimeEnd?: number
}

export interface TaskSaveRequest {
    id?: number
    title: string
    description?: string
    priority?: number
    dueTime?: number
    estimatedMinutes?: number
    actualMinutes?: number
    taskType?: number
    status?: number
    remark?: string
}

export interface TemplatePageQuery {
    pageNo?: number
    pageSize?: number
    name?: string
    templateType?: number
    status?: number
}

export interface TemplateSaveRequest {
    id?: number
    name: string
    templateType: number
    templateData?: string
    description?: string
    isDefault?: number
    status?: number
}

export interface PomodoroStartRequest {
    taskId?: number
    timeBlockId?: number
    plannedMinutes: number
}

// ============================================
// 统计响应类型
// ============================================

export interface TimeDistributionResponse {
    typeDistributions: TypeDistributionItem[]
    priorityDistributions: PriorityDistributionItem[]
    totalMinutes: number
    blockCount: number
}

export interface TypeDistributionItem {
    blockType: number
    typeName: string
    color: string
    minutes: number
    percentage: number
}

export interface PriorityDistributionItem {
    priority: number
    priorityName: string
    color: string
    minutes: number
    percentage: number
}

export interface FocusTrendResponse {
    dailyItems: DailyFocusItem[]
    totalFocusMinutes: number
    totalSessions: number
    averageMinutesPerSession: number
    completionRate: number
}

export interface DailyFocusItem {
    date: string
    focusMinutes: number
    sessionCount: number
    completedCount: number
}

export interface EfficiencyAnalysisResponse {
    plannedEfficiency: number
    actualEfficiency: number
    plannedTotalMinutes: number
    actualTotalMinutes: number
    completedTaskCount: number
    totalTaskCount: number
    hourlyEfficiency: HourlyEfficiencyItem[]
    dailyEfficiency: DailyEfficiencyItem[]
    mostProductiveHour: string
    mostProductiveDay: string
}

export interface HourlyEfficiencyItem {
    hour: number
    focusMinutes: number
    blockCount: number
}

export interface DailyEfficiencyItem {
    dayOfWeek: number
    dayName: string
    focusMinutes: number
    blockCount: number
}

// ============================================
// 常量定义
// ============================================

export const TimeBlockTypeEnum = {
    WORK: 1,
    STUDY: 2,
    REST: 3,
    EXERCISE: 4,
    SOCIAL: 5,
    OTHER: 0
} as const

export const TimeBlockTypeLabels: Record<number, { label: string; color: string }> = {
    [TimeBlockTypeEnum.WORK]: { label: '工作', color: '#4A90D9' },
    [TimeBlockTypeEnum.STUDY]: { label: '学习', color: '#9B59B6' },
    [TimeBlockTypeEnum.REST]: { label: '休息', color: '#27AE60' },
    [TimeBlockTypeEnum.EXERCISE]: { label: '运动', color: '#E67E22' },
    [TimeBlockTypeEnum.SOCIAL]: { label: '社交', color: '#E74C3C' },
    [TimeBlockTypeEnum.OTHER]: { label: '其他', color: '#95A5A6' }
}

export const TaskPriorityEnum = {
    IMPORTANT_URGENT: 1,
    IMPORTANT_NOT_URGENT: 2,
    NOT_IMPORTANT_URGENT: 3,
    NOT_IMPORTANT_NOT_URGENT: 4
} as const

export const TaskPriorityLabels: Record<number, { label: string; color: string }> = {
    [TaskPriorityEnum.IMPORTANT_URGENT]: { label: '重要且紧急', color: '#E74C3C' },
    [TaskPriorityEnum.IMPORTANT_NOT_URGENT]: { label: '重要不紧急', color: '#F39C12' },
    [TaskPriorityEnum.NOT_IMPORTANT_URGENT]: { label: '不重要但紧急', color: '#3498DB' },
    [TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT]: { label: '不重要不紧急', color: '#95A5A6' }
}

export const PomodoroStatusEnum = {
    IN_PROGRESS: 0,
    COMPLETED: 1,
    INTERRUPTED: 2,
    ABANDONED: 3
} as const

export const PomodoroStatusLabels: Record<number, string> = {
    [PomodoroStatusEnum.IN_PROGRESS]: '进行中',
    [PomodoroStatusEnum.COMPLETED]: '已完成',
    [PomodoroStatusEnum.INTERRUPTED]: '被打断',
    [PomodoroStatusEnum.ABANDONED]: '已放弃'
}

export const TemplateTypeEnum = {
    DAILY: 1,
    WEEKLY: 2
} as const

export const TemplateTypeLabels: Record<number, string> = {
    [TemplateTypeEnum.DAILY]: '每日模板',
    [TemplateTypeEnum.WEEKLY]: '每周模板'
}
