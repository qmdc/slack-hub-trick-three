package com.slack.slackjarservice.polls.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.polls.entity.PollOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface PollOptionDao extends BaseMapper<PollOption> {

    List<PollOption> selectByQuestionId(@Param("questionId") Long questionId);

    int deleteByQuestionId(@Param("questionId") Long questionId);

    int deleteBySurveyId(@Param("surveyId") Long surveyId);

    @Update("UPDATE poll_option SET vote_count = vote_count + 1 WHERE id = #{optionId}")
    int incrementVoteCount(@Param("optionId") Long optionId);
}