package com.slack.slackjarservice.typingtest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("typing_test_record")
public class TypingTestRecord extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long articleId;

    private String articleTitle;

    private BigDecimal wpm;

    private BigDecimal accuracy;

    private String typedText;

    private Integer correctChars;

    private Integer totalChars;

    private Integer testDuration;

    private Long startTime;

    private Long endTime;
}