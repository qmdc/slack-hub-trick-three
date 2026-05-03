package com.slack.slackjarservice.typingtest.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingStatisticsResponse {

    private BigDecimal maxWpm;

    private BigDecimal avgWpm;

    private BigDecimal avgAccuracy;

    private Integer totalCount;
}