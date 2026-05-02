package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

/**
 * 每日效率项
 *
 * @author zhn
 */
@Data
public class DailyEfficiencyItem {
    private Integer dayOfWeek;
    private String dayName;
    private Long focusMinutes;
    private Integer blockCount;
}
