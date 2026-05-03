package com.slack.slackjarservice.typingtest.model.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveTestRecordRequest {

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