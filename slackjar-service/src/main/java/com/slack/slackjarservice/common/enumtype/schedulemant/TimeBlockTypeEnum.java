package com.slack.slackjarservice.common.enumtype.schedulemant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 时间块类型枚举
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum TimeBlockTypeEnum {

    WORK(1, "工作", "#4A90D9"),
    STUDY(2, "学习", "#9B59B6"),
    REST(3, "休息", "#27AE60"),
    EXERCISE(4, "运动", "#E67E22"),
    SOCIAL(5, "社交", "#E74C3C"),
    OTHER(0, "其他", "#95A5A6");

    private final Integer code;
    private final String desc;
    private final String color;

    public static TimeBlockTypeEnum getByCode(Integer code) {
        if (code == null) {
            return OTHER;
        }
        for (TimeBlockTypeEnum type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return OTHER;
    }
}
