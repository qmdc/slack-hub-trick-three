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
@TableName("poll_survey")
public class PollSurvey extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private Integer status;

    private Long deadline;

    private String shareCode;

    private Integer totalVotes;

    private Long createdBy;
}