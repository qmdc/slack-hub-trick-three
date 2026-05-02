package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

import java.util.List;

/**
 * 效率分析响应
 *
 * @author zhn
 */
@Data
public class EfficiencyAnalysisResponse {

    private Double plannedEfficiency;

    private Double actualEfficiency;

    private Long plannedTotalMinutes;

    private Long actualTotalMinutes;

    private Integer completedTaskCount;

    private Integer totalTaskCount;

    private List<HourlyEfficiencyItem> hourlyEfficiency;

    private List<DailyEfficiencyItem> dailyEfficiency;

    private String mostProductiveHour;

    private String mostProductiveDay;
}
