package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

import java.util.List;

/**
 * 专注时长趋势响应
 *
 * @author zhn
 */
@Data
public class FocusTrendResponse {

    private List<DailyFocusItem> dailyItems;

    private Long totalFocusMinutes;

    private Integer totalSessions;

    private Double averageMinutesPerSession;

    private Double completionRate;
}
