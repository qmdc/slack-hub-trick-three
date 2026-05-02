package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

/**
 * 每日专注项
 *
 * @author zhn
 */
@Data
public class DailyFocusItem {
    private String date;
    private Long focusMinutes;
    private Integer sessionCount;
    private Integer completedCount;
}
