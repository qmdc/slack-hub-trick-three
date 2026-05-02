package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

/**
 * 小时效率项
 *
 * @author zhn
 */
@Data
public class HourlyEfficiencyItem {
    private Integer hour;
    private Long focusMinutes;
    private Integer blockCount;
}
