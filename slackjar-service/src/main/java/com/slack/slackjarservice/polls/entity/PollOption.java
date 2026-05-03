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
@TableName("poll_option")
public class PollOption extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long questionId;

    private String optionText;

    private Integer voteCount;

    private Integer sortOrder;
}