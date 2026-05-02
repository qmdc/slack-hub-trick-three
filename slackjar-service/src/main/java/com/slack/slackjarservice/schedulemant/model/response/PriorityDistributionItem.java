package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

/**
 * 任务优先级分布项
 *
 * @author zhn
 */
@Data
public class PriorityDistributionItem {
    private Integer priority;
    private String priorityName;
    private String color;
    private Long minutes;
    private Double percentage;
}
