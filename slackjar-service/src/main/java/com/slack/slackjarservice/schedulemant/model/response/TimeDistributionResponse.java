package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

import java.util.List;

/**
 * 时间分配统计响应
 *
 * @author zhn
 */
@Data
public class TimeDistributionResponse {

    private List<TypeDistributionItem> typeDistributions;

    private List<PriorityDistributionItem> priorityDistributions;

    private Long totalMinutes;

    private Integer blockCount;
}
