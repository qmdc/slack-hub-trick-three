package com.slack.slackjarservice.schedulemant.model.request;

import lombok.Data;

/**
 * 统计查询请求
 *
 * @author zhn
 */
@Data
public class StatisticsQueryRequest {

    private Long startTime;

    private Long endTime;

    private Integer statisticsType;
}
