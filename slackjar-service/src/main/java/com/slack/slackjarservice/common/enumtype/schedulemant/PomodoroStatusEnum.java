package com.slack.slackjarservice.common.enumtype.schedulemant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 番茄钟状态枚举
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum PomodoroStatusEnum {

    IN_PROGRESS(0, "进行中"),
    COMPLETED(1, "已完成"),
    INTERRUPTED(2, "被打断"),
    ABANDONED(3, "已放弃");

    private final Integer code;
    private final String desc;
}
