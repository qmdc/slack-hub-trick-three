package com.slack.slackjarservice.typingtest.service;

import com.slack.slackjarservice.typingtest.entity.TypingTestRecord;
import com.slack.slackjarservice.typingtest.model.response.TypingStatisticsResponse;

import java.math.BigDecimal;
import java.util.List;

public interface TypingTestRecordService {

    TypingTestRecord saveRecord(TypingTestRecord record);

    List<TypingTestRecord> getRecordsByUserId(Long userId);

    List<TypingTestRecord> getRecordsByUserIdAndDateRange(Long userId, Long startDate, Long endDate);

    BigDecimal getMaxWpm(Long userId);

    BigDecimal getAvgWpm(Long userId);

    BigDecimal getAvgAccuracy(Long userId);

    Integer getTotalCount(Long userId);

    TypingStatisticsResponse getStatistics(Long userId);

    List<TypingTestRecord> getWeeklyRecords(Long userId);

    void deleteRecord(Long id);
}