package com.slack.slackjarservice.polls.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.polls.entity.PollQuestion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PollQuestionDao extends BaseMapper<PollQuestion> {

    List<PollQuestion> selectBySurveyId(@Param("surveyId") Long surveyId);

    int deleteBySurveyId(@Param("surveyId") Long surveyId);
}