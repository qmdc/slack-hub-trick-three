package com.slack.slackjarservice.polls.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.polls.entity.PollSurvey;
import com.slack.slackjarservice.polls.model.request.PollPageQuery;
import com.slack.slackjarservice.polls.model.request.PollSaveRequest;
import com.slack.slackjarservice.polls.model.request.PollVoteRequest;
import com.slack.slackjarservice.polls.model.response.PollDetailResponse;
import com.slack.slackjarservice.polls.model.response.PollStatisticsResponse;

public interface PollSurveyService extends IService<PollSurvey> {

    PollDetailResponse savePoll(PollSaveRequest request, Long userId);

    PollDetailResponse getByIdWithDetail(Long id);

    PollDetailResponse getByShareCode(String shareCode);

    IPage<PollSurvey> pageQuery(PollPageQuery query);

    boolean deleteById(Long id);

    boolean updateStatus(Long id, Integer status);

    void submitVote(PollVoteRequest request, String ipAddress);

    PollStatisticsResponse getStatistics(Long id);
}