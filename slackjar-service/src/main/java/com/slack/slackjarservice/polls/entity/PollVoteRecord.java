package com.slack.slackjarservice.polls.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("poll_vote_record")
public class PollVoteRecord extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long surveyId;

    private Long questionId;

    private Long optionId;

    private String voterId;

    private String voterIp;

    private Long voteTime;
}