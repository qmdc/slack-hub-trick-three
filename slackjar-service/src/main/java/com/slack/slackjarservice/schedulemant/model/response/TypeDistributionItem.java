package com.slack.slackjarservice.schedulemant.model.response;

import lombok.Data;

/**
 * 时间块类型分布项
 *
 * @author zhn
 */
@Data
public class TypeDistributionItem {
    private Integer blockType;
    private String typeName;
    private String color;
    private Long minutes;
    private Double percentage;
}
