package com.slack.slackjarservice.polls.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.polls.entity.PollSurvey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface PollSurveyDao extends BaseMapper<PollSurvey> {

    PollSurvey selectByShareCode(@Param("shareCode") String shareCode);

    @Update("UPDATE poll_survey SET total_votes = total_votes + 1 WHERE id = #{id}")
    int incrementVoteCount(@Param("id") Long id);

    List<PollSurvey> selectByCreatedBy(@Param("createdBy") Long createdBy);
}