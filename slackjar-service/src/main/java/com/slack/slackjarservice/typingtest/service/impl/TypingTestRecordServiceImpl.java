package com.slack.slackjarservice.typingtest.service.impl;

import com.slack.slackjarservice.typingtest.dao.TypingTestRecordDao;
import com.slack.slackjarservice.typingtest.entity.TypingTestRecord;
import com.slack.slackjarservice.typingtest.model.response.TypingStatisticsResponse;
import com.slack.slackjarservice.typingtest.service.TypingTestRecordService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TypingTestRecordServiceImpl implements TypingTestRecordService {

    @Resource
    private TypingTestRecordDao typingTestRecordDao;

    @Override
    public TypingTestRecord saveRecord(TypingTestRecord record) {
        record.setCreateTime(System.currentTimeMillis());
        typingTestRecordDao.insert(record);
        return record;
    }

    @Override
    public List<TypingTestRecord> getRecordsByUserId(Long userId) {
        return typingTestRecordDao.selectByUserIdOrderByStartTimeDesc(userId);
    }

    @Override
    public List<TypingTestRecord> getRecordsByUserIdAndDateRange(Long userId, Long startDate, Long endDate) {
        return typingTestRecordDao.selectByUserIdAndDateRange(userId, startDate, endDate);
    }

    @Override
    public BigDecimal getMaxWpm(Long userId) {
        BigDecimal result = typingTestRecordDao.selectMaxWpmByUserId(userId);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getAvgWpm(Long userId) {
        BigDecimal result = typingTestRecordDao.selectAvgWpmByUserId(userId);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getAvgAccuracy(Long userId) {
        BigDecimal result = typingTestRecordDao.selectAvgAccuracyByUserId(userId);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public Integer getTotalCount(Long userId) {
        Integer result = typingTestRecordDao.selectTotalCountByUserId(userId);
        return result != null ? result : 0;
    }

    @Override
    public TypingStatisticsResponse getStatistics(Long userId) {
        return TypingStatisticsResponse.builder()
                .maxWpm(getMaxWpm(userId))
                .avgWpm(getAvgWpm(userId))
                .avgAccuracy(getAvgAccuracy(userId))
                .totalCount(getTotalCount(userId))
                .build();
    }

    @Override
    public List<TypingTestRecord> getWeeklyRecords(Long userId) {
        long sevenDaysAgo = System.currentTimeMillis() - 7L * 24 * 60 * 60 * 1000;
        return typingTestRecordDao.selectWeeklyRecords(userId, sevenDaysAgo);
    }

    @Override
    public void deleteRecord(Long id) {
        typingTestRecordDao.deleteById(id);
    }
}