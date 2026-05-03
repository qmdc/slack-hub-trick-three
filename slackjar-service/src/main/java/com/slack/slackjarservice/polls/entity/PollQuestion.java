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
@TableName("poll_question")
public class PollQuestion extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long surveyId;

    private String questionText;

    private Integer questionType;

    private Integer sortOrder;

    private Integer isRequired;
}