import request from '../request'
import type { PageResult, ResponseData } from './types'

export function savePoll(data: PollSaveRequest): Promise<ResponseData<PollDetailResponse>> {
    return request.post('/polls/save', data)
}

export function getPollDetail(id: number): Promise<ResponseData<PollDetailResponse>> {
    return request.get(`/polls/detail/${id}`)
}

export function getPollByShareCode(shareCode: string): Promise<ResponseData<PollDetailResponse>> {
    return request.get(`/polls/share/${shareCode}`)
}

export function pageQueryPolls(data: PollPageQuery): Promise<ResponseData<PageResult<PollSurvey>>> {
    return request.post('/polls/pageQuery', data)
}

export function deletePoll(id: number): Promise<ResponseData<void>> {
    return request.delete(`/polls/${id}`)
}

export function updatePollStatus(id: number, status: number): Promise<ResponseData<void>> {
    return request.put(`/polls/${id}/status/${status}`)
}

export function submitVote(data: PollVoteRequest): Promise<ResponseData<void>> {
    return request.post('/polls/vote', data)
}

export function getPollStatistics(id: number): Promise<ResponseData<PollStatisticsResponse>> {
    return request.get(`/polls/statistics/${id}`)
}

export interface PollSurvey {
    id: number
    title: string
    description: string
    status: number
    deadline: number
    shareCode: string
    totalVotes: number
    createdBy: number
    createTime: number
    updateTime: number
}

export interface PollDetailResponse {
    id: number
    title: string
    description: string
    status: number
    deadline: number
    shareCode: string
    shareUrl: string
    totalVotes: number
    createdBy: number
    createdByNickname: string
    createTime: number
    updateTime: number
    questions: QuestionDetail[]
}

export interface QuestionDetail {
    id: number
    questionText: string
    questionType: number
    questionTypeName: string
    sortOrder: number
    isRequired: number
    options: OptionDetail[]
}

export interface OptionDetail {
    id: number
    optionText: string
    voteCount: number
    sortOrder: number
    percentage: number
}

export interface PollStatisticsResponse {
    surveyId: number
    title: string
    totalVotes: number
    startTime: number
    deadline: number
    isExpired: boolean
    questionStatistics: QuestionStatistics[]
}

export interface QuestionStatistics {
    questionId: number
    questionText: string
    questionType: number
    questionTypeName: string
    totalVotes: number
    optionStatistics: OptionStatistics[]
}

export interface OptionStatistics {
    optionId: number
    optionText: string
    voteCount: number
    percentage: number
}

export interface PollSaveRequest {
    id?: number
    title: string
    description?: string
    status?: number
    deadline?: number
    questions: QuestionRequest[]
}

export interface QuestionRequest {
    id?: number
    questionText: string
    questionType?: number
    sortOrder?: number
    isRequired?: number
    options: OptionRequest[]
}

export interface OptionRequest {
    id?: number
    optionText: string
    sortOrder?: number
}

export interface PollPageQuery {
    pageNo?: number
    pageSize?: number
    title?: string
    status?: number
    createdBy?: number
}

export interface PollVoteRequest {
    surveyId?: number
    shareCode?: string
    voterId?: string
    votes: VoteOption[]
}

export interface VoteOption {
    questionId: number
    optionIds: number[]
}