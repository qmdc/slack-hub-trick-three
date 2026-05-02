package com.slack.slackjarservice.schedulemant.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.enumtype.schedulemant.PomodoroStatusEnum;
import com.slack.slackjarservice.common.enumtype.schedulemant.TaskPriorityEnum;
import com.slack.slackjarservice.common.enumtype.schedulemant.TimeBlockTypeEnum;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.schedulemant.dao.PomodoroRecordDao;
import com.slack.slackjarservice.schedulemant.entity.PomodoroRecord;
import com.slack.slackjarservice.schedulemant.model.request.PomodoroStartRequest;
import com.slack.slackjarservice.schedulemant.model.response.*;
import com.slack.slackjarservice.schedulemant.service.PomodoroRecordService;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 番茄钟记录服务实现类
 *
 * @author zhn
 */
@Service("pomodoroRecordService")
public class PomodoroRecordServiceImpl extends ServiceImpl<PomodoroRecordDao, PomodoroRecord> implements PomodoroRecordService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String[] DAY_NAMES = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"};

    @Override
    public PomodoroRecord startPomodoro(PomodoroStartRequest request) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        PomodoroRecord record = new PomodoroRecord();
        record.setUserId(userId);
        record.setTaskId(request.getTaskId());
        record.setTimeBlockId(request.getTimeBlockId());
        record.setPlannedMinutes(request.getPlannedMinutes());
        record.setActualMinutes(0);
        record.setStartTime(System.currentTimeMillis());
        record.setStatus(PomodoroStatusEnum.IN_PROGRESS.getCode());

        this.save(record);
        return record;
    }

    @Override
    public PomodoroRecord completePomodoro(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        PomodoroRecord record = this.getById(id);
        AssertUtil.notNull(record, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(record.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        long endTime = System.currentTimeMillis();
        long duration = endTime - record.getStartTime();
        int actualMinutes = (int) Math.ceil(duration / 60000.0);

        record.setEndTime(endTime);
        record.setActualMinutes(actualMinutes);
        record.setStatus(PomodoroStatusEnum.COMPLETED.getCode());

        this.updateById(record);
        return record;
    }

    @Override
    public PomodoroRecord interruptPomodoro(Long id, String reason) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        PomodoroRecord record = this.getById(id);
        AssertUtil.notNull(record, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(record.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        long endTime = System.currentTimeMillis();
        long duration = endTime - record.getStartTime();
        int actualMinutes = (int) Math.ceil(duration / 60000.0);

        record.setEndTime(endTime);
        record.setActualMinutes(actualMinutes);
        record.setStatus(PomodoroStatusEnum.INTERRUPTED.getCode());
        record.setInterruptReason(reason);

        this.updateById(record);
        return record;
    }

    @Override
    public PomodoroRecord abandonPomodoro(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        PomodoroRecord record = this.getById(id);
        AssertUtil.notNull(record, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(record.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        record.setStatus(PomodoroStatusEnum.ABANDONED.getCode());

        this.updateById(record);
        return record;
    }

    @Override
    public PomodoroRecord getCurrentPomodoro() {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<PomodoroRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PomodoroRecord::getUserId, userId)
                .eq(PomodoroRecord::getStatus, PomodoroStatusEnum.IN_PROGRESS.getCode())
                .orderByDesc(PomodoroRecord::getCreateTime)
                .last("LIMIT 1");

        return this.getOne(queryWrapper);
    }

    @Override
    public List<PomodoroRecord> getByDateRange(Long startTime, Long endTime) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<PomodoroRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PomodoroRecord::getUserId, userId)
                .ge(PomodoroRecord::getStartTime, startTime)
                .orderByAsc(PomodoroRecord::getStartTime);
        
        if (endTime != null) {
            queryWrapper.and(wrapper -> wrapper
                    .le(PomodoroRecord::getEndTime, endTime)
                    .or()
                    .isNull(PomodoroRecord::getEndTime));
        }

        return this.list(queryWrapper);
    }

    @Override
    public TimeDistributionResponse getTimeDistribution(Long startTime, Long endTime) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<PomodoroRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PomodoroRecord::getUserId, userId)
                .eq(PomodoroRecord::getStatus, PomodoroStatusEnum.COMPLETED.getCode())
                .ge(PomodoroRecord::getStartTime, startTime)
                .le(PomodoroRecord::getEndTime, endTime);

        List<PomodoroRecord> records = this.list(queryWrapper);

        Map<Integer, Long> typeMinutes = new HashMap<>();
        Map<Integer, Long> priorityMinutes = new HashMap<>();

        for (PomodoroRecord record : records) {
            Integer actualMinutes = record.getActualMinutes();
            if (actualMinutes == null) {
                actualMinutes = 0;
            }

            Integer blockType = Optional.ofNullable(record.getTimeBlockId())
                    .map(id -> getTimeBlockType(id))
                    .orElse(TimeBlockTypeEnum.OTHER.getCode());
            typeMinutes.merge(blockType, actualMinutes.longValue(), Long::sum);

            Integer priority = Optional.ofNullable(record.getTaskId())
                    .map(id -> getTaskPriority(id))
                    .orElse(TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT.getCode());
            priorityMinutes.merge(priority, actualMinutes.longValue(), Long::sum);
        }

        final long totalMinutes = typeMinutes.values().stream().mapToLong(Long::longValue).sum();

        List<TypeDistributionItem> typeItems = typeMinutes.entrySet().stream()
                .map(entry -> {
                    TypeDistributionItem item = new TypeDistributionItem();
                    TimeBlockTypeEnum typeEnum = TimeBlockTypeEnum.getByCode(entry.getKey());
                    item.setBlockType(entry.getKey());
                    item.setTypeName(typeEnum.getDesc());
                    item.setColor(typeEnum.getColor());
                    item.setMinutes(entry.getValue());
                    item.setPercentage(totalMinutes > 0 ? (entry.getValue() * 100.0 / totalMinutes) : 0.0);
                    return item;
                })
                .sorted(Comparator.comparing(TypeDistributionItem::getMinutes).reversed())
                .collect(Collectors.toList());

        List<PriorityDistributionItem> priorityItems = priorityMinutes.entrySet().stream()
                .map(entry -> {
                    PriorityDistributionItem item = new PriorityDistributionItem();
                    TaskPriorityEnum priorityEnum = TaskPriorityEnum.getByCode(entry.getKey());
                    item.setPriority(entry.getKey());
                    item.setPriorityName(priorityEnum.getDesc());
                    item.setColor(priorityEnum.getColor());
                    item.setMinutes(entry.getValue());
                    item.setPercentage(totalMinutes > 0 ? (entry.getValue() * 100.0 / totalMinutes) : 0.0);
                    return item;
                })
                .sorted(Comparator.comparing(PriorityDistributionItem::getPriority))
                .collect(Collectors.toList());

        TimeDistributionResponse response = new TimeDistributionResponse();
        response.setTypeDistributions(typeItems);
        response.setPriorityDistributions(priorityItems);
        response.setTotalMinutes(totalMinutes);
        response.setBlockCount(records.size());

        return response;
    }

    @Override
    public FocusTrendResponse getFocusTrend(Long startTime, Long endTime) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<PomodoroRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PomodoroRecord::getUserId, userId)
                .ge(PomodoroRecord::getStartTime, startTime)
                .orderByAsc(PomodoroRecord::getStartTime);
        
        if (endTime != null) {
            queryWrapper.and(wrapper -> wrapper
                    .le(PomodoroRecord::getEndTime, endTime)
                    .or()
                    .isNull(PomodoroRecord::getEndTime));
        }

        List<PomodoroRecord> records = this.list(queryWrapper);

        Map<String, DailyStats> dailyStatsMap = new LinkedHashMap<>();

        LocalDate startDate = Instant.ofEpochMilli(startTime).atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate endDate = Instant.ofEpochMilli(endTime).atZone(ZoneId.systemDefault()).toLocalDate();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dailyStatsMap.put(date.format(DATE_FORMATTER), new DailyStats());
        }

        for (PomodoroRecord record : records) {
            LocalDate recordDate = Instant.ofEpochMilli(record.getStartTime())
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            String dateStr = recordDate.format(DATE_FORMATTER);

            DailyStats stats = dailyStatsMap.computeIfAbsent(dateStr, k -> new DailyStats());
            stats.setSessionCount(stats.getSessionCount() + 1);
            stats.setFocusMinutes(stats.getFocusMinutes() + Optional.ofNullable(record.getActualMinutes()).orElse(0));

            if (Objects.equals(record.getStatus(), PomodoroStatusEnum.COMPLETED.getCode())) {
                stats.setCompletedCount(stats.getCompletedCount() + 1);
            }
        }

        List<DailyFocusItem> dailyItems = dailyStatsMap.entrySet().stream()
                .map(entry -> {
                    DailyFocusItem item = new DailyFocusItem();
                    item.setDate(entry.getKey());
                    item.setFocusMinutes(entry.getValue().getFocusMinutes());
                    item.setSessionCount(entry.getValue().getSessionCount());
                    item.setCompletedCount(entry.getValue().getCompletedCount());
                    return item;
                })
                .collect(Collectors.toList());

        long totalFocusMinutes = records.stream()
                .mapToLong(r -> Optional.ofNullable(r.getActualMinutes()).orElse(0))
                .sum();
        int totalSessions = records.size();
        long completedCount = records.stream()
                .filter(r -> Objects.equals(r.getStatus(), PomodoroStatusEnum.COMPLETED.getCode()))
                .count();

        FocusTrendResponse response = new FocusTrendResponse();
        response.setDailyItems(dailyItems);
        response.setTotalFocusMinutes(totalFocusMinutes);
        response.setTotalSessions(totalSessions);
        response.setAverageMinutesPerSession(totalSessions > 0 ? (totalFocusMinutes * 1.0 / totalSessions) : 0.0);
        response.setCompletionRate(totalSessions > 0 ? (completedCount * 100.0 / totalSessions) : 0.0);

        return response;
    }

    @Override
    public EfficiencyAnalysisResponse getEfficiencyAnalysis(Long startTime, Long endTime) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<PomodoroRecord> recordQueryWrapper = new LambdaQueryWrapper<>();
        recordQueryWrapper.eq(PomodoroRecord::getUserId, userId)
                .ge(PomodoroRecord::getStartTime, startTime);
        
        if (endTime != null) {
            recordQueryWrapper.and(wrapper -> wrapper
                    .le(PomodoroRecord::getEndTime, endTime)
                    .or()
                    .isNull(PomodoroRecord::getEndTime));
        }

        List<PomodoroRecord> records = this.list(recordQueryWrapper);

        Map<Integer, HourlyStats> hourlyStats = new HashMap<>();
        Map<Integer, DailyStats> weeklyStats = new HashMap<>();

        for (int i = 0; i < 24; i++) {
            hourlyStats.put(i, new HourlyStats());
        }
        for (int i = 1; i <= 7; i++) {
            weeklyStats.put(i, new DailyStats());
        }

        for (PomodoroRecord record : records) {
            LocalDateTime dateTime = Instant.ofEpochMilli(record.getStartTime())
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            int hour = dateTime.getHour();
            int dayOfWeek = dateTime.getDayOfWeek().getValue();
            int minutes = Optional.ofNullable(record.getActualMinutes()).orElse(0);

            HourlyStats hStats = hourlyStats.get(hour);
            hStats.setFocusMinutes(hStats.getFocusMinutes() + minutes);
            hStats.setBlockCount(hStats.getBlockCount() + 1);

            DailyStats dStats = weeklyStats.get(dayOfWeek);
            dStats.setFocusMinutes(dStats.getFocusMinutes() + minutes);
            dStats.setSessionCount(dStats.getSessionCount() + 1);
        }

        List<HourlyEfficiencyItem> hourlyItems = hourlyStats.entrySet().stream()
                .map(entry -> {
                    HourlyEfficiencyItem item = new HourlyEfficiencyItem();
                    item.setHour(entry.getKey());
                    item.setFocusMinutes(entry.getValue().getFocusMinutes());
                    item.setBlockCount(entry.getValue().getBlockCount());
                    return item;
                })
                .sorted(Comparator.comparing(HourlyEfficiencyItem::getHour))
                .collect(Collectors.toList());

        List<DailyEfficiencyItem> dailyItems = weeklyStats.entrySet().stream()
                .map(entry -> {
                    DailyEfficiencyItem item = new DailyEfficiencyItem();
                    item.setDayOfWeek(entry.getKey());
                    item.setDayName(DAY_NAMES[entry.getKey() - 1]);
                    item.setFocusMinutes(entry.getValue().getFocusMinutes());
                    item.setBlockCount(entry.getValue().getSessionCount());
                    return item;
                })
                .sorted(Comparator.comparing(DailyEfficiencyItem::getDayOfWeek))
                .collect(Collectors.toList());

        String mostProductiveHour = hourlyItems.stream()
                .max(Comparator.comparing(HourlyEfficiencyItem::getFocusMinutes))
                .map(item -> item.getHour() + ":00")
                .orElse("0:00");

        String mostProductiveDay = dailyItems.stream()
                .max(Comparator.comparing(DailyEfficiencyItem::getFocusMinutes))
                .map(DailyEfficiencyItem::getDayName)
                .orElse("周一");

        long totalPlannedMinutes = records.stream()
                .mapToLong(r -> Optional.ofNullable(r.getPlannedMinutes()).orElse(0))
                .sum();
        long totalActualMinutes = records.stream()
                .mapToLong(r -> Optional.ofNullable(r.getActualMinutes()).orElse(0))
                .sum();

        EfficiencyAnalysisResponse response = new EfficiencyAnalysisResponse();
        response.setPlannedEfficiency(totalPlannedMinutes > 0 ? (totalActualMinutes * 100.0 / totalPlannedMinutes) : 0.0);
        response.setActualEfficiency(100.0);
        response.setPlannedTotalMinutes(totalPlannedMinutes);
        response.setActualTotalMinutes(totalActualMinutes);
        response.setCompletedTaskCount((int) records.stream().filter(r -> Objects.equals(r.getStatus(), PomodoroStatusEnum.COMPLETED.getCode())).count());
        response.setTotalTaskCount(records.size());
        response.setHourlyEfficiency(hourlyItems);
        response.setDailyEfficiency(dailyItems);
        response.setMostProductiveHour(mostProductiveHour);
        response.setMostProductiveDay(mostProductiveDay);

        return response;
    }

    private Integer getTimeBlockType(Long timeBlockId) {
        return TimeBlockTypeEnum.OTHER.getCode();
    }

    private Integer getTaskPriority(Long taskId) {
        return TaskPriorityEnum.NOT_IMPORTANT_NOT_URGENT.getCode();
    }

    private static class DailyStats {
        private int sessionCount = 0;
        private long focusMinutes = 0;
        private int completedCount = 0;

        public int getSessionCount() {
            return sessionCount;
        }

        public void setSessionCount(int sessionCount) {
            this.sessionCount = sessionCount;
        }

        public long getFocusMinutes() {
            return focusMinutes;
        }

        public void setFocusMinutes(long focusMinutes) {
            this.focusMinutes = focusMinutes;
        }

        public int getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(int completedCount) {
            this.completedCount = completedCount;
        }
    }

    private static class HourlyStats {
        private long focusMinutes = 0;
        private int blockCount = 0;

        public long getFocusMinutes() {
            return focusMinutes;
        }

        public void setFocusMinutes(long focusMinutes) {
            this.focusMinutes = focusMinutes;
        }

        public int getBlockCount() {
            return blockCount;
        }

        public void setBlockCount(int blockCount) {
            this.blockCount = blockCount;
        }
    }
}
