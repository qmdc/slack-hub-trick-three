package com.slack.slackjarservice.common.enumtype.schedulemant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 任务优先级枚举（四象限）
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum TaskPriorityEnum {

    IMPORTANT_URGENT(1, "重要且紧急", "#E74C3C"),
    IMPORTANT_NOT_URGENT(2, "重要不紧急", "#F39C12"),
    NOT_IMPORTANT_URGENT(3, "不重要但紧急", "#3498DB"),
    NOT_IMPORTANT_NOT_URGENT(4, "不重要不紧急", "#95A5A6");

    private final Integer code;
    private final String desc;
    private final String color;

    public static TaskPriorityEnum getByCode(Integer code) {
        if (code == null) {
            return NOT_IMPORTANT_NOT_URGENT;
        }
        for (TaskPriorityEnum priority : values()) {
            if (priority.getCode().equals(code)) {
                return priority;
            }
        }
        return NOT_IMPORTANT_NOT_URGENT;
    }
}
