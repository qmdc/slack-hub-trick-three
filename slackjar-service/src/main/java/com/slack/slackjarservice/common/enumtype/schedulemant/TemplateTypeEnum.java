package com.slack.slackjarservice.common.enumtype.schedulemant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 计划模板类型枚举
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum TemplateTypeEnum {

    DAILY(1, "每日模板"),
    WEEKLY(2, "每周模板");

    private final Integer code;
    private final String desc;
}
