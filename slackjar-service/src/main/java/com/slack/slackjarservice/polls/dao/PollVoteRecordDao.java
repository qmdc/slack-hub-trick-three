package com.slack.slackjarservice.polls.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.polls.entity.PollVoteRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PollVoteRecordDao extends BaseMapper<PollVoteRecord> {

    int countBySurveyAndVoter(@Param("surveyId") Long surveyId, @Param("voterId") String voterId);

    List<PollVoteRecord> selectBySurveyId(@Param("surveyId") Long surveyId);

    List<PollVoteRecord> selectByQuestionId(@Param("questionId") Long questionId);
}