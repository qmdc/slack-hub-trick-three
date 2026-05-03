package com.slack.slackjarservice.typingtest.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.typingtest.entity.TypingTestRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface TypingTestRecordDao extends BaseMapper<TypingTestRecord> {

    List<TypingTestRecord> selectByUserIdOrderByStartTimeDesc(@Param("userId") Long userId);

    List<TypingTestRecord> selectByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") Long startDate,
            @Param("endDate") Long endDate
    );

    BigDecimal selectMaxWpmByUserId(@Param("userId") Long userId);

    BigDecimal selectAvgWpmByUserId(@Param("userId") Long userId);

    BigDecimal selectAvgAccuracyByUserId(@Param("userId") Long userId);

    Integer selectTotalCountByUserId(@Param("userId") Long userId);

    List<TypingTestRecord> selectWeeklyRecords(@Param("userId") Long userId, @Param("startTime") Long startTime);
}