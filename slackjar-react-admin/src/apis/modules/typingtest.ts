import request from '../request'
import type { ResponseData } from './types'

export function getRandomArticle(difficulty?: number): Promise<ResponseData<TypingArticle>> {
    const params = difficulty ? { difficulty } : {}
    return request.get('/typing-test/article/random', { params })
}

export function getArticleById(id: number): Promise<ResponseData<TypingArticle>> {
    return request.get(`/typing-test/article/${id}`)
}

export function getAllArticles(): Promise<ResponseData<TypingArticle[]>> {
    return request.get('/typing-test/articles')
}

export function getAllCategories(): Promise<ResponseData<string[]>> {
    return request.get('/typing-test/categories')
}

export function saveTestRecord(data: SaveTestRecordRequest): Promise<ResponseData<TypingTestRecord>> {
    return request.post('/typing-test/record', data)
}

export function getRecords(): Promise<ResponseData<TypingTestRecord[]>> {
    return request.get('/typing-test/records')
}

export function getWeeklyRecords(): Promise<ResponseData<TypingTestRecord[]>> {
    return request.get('/typing-test/records/weekly')
}

export function getStatistics(): Promise<ResponseData<TypingStatisticsResponse>> {
    return request.get('/typing-test/statistics')
}

export function getRecordById(id: number): Promise<ResponseData<TypingTestRecord>> {
    return request.get(`/typing-test/record/${id}`)
}

export function deleteRecord(id: number): Promise<ResponseData<void>> {
    return request.delete(`/typing-test/record/${id}`)
}

export interface TypingArticle {
    id: number
    title: string
    content: string
    wordCount: number
    difficulty: number
    category: string
    status: number
    createTime: number
    updateTime: number
}

export interface TypingTestRecord {
    id: number
    userId: number
    articleId: number
    articleTitle: string
    wpm: number
    accuracy: number
    typedText: string
    correctChars: number
    totalChars: number
    testDuration: number
    startTime: number
    endTime: number
    createTime: number
    updateTime: number
}

export interface TypingStatisticsResponse {
    maxWpm: number
    avgWpm: number
    avgAccuracy: number
    totalCount: number
}

export interface SaveTestRecordRequest {
    articleId: number
    articleTitle: string
    wpm: number
    accuracy: number
    typedText: string
    correctChars: number
    totalChars: number
    testDuration: number
    startTime: number
    endTime: number
}