package com.slack.slackjarservice.common.enumtype.towerdefense;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 游戏状态枚举
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum GameStatusEnum {

    PREPARING(1, "准备中", "玩家可以布置防御塔"),
    PLAYING(2, "进行中", "战斗进行中"),
    PAUSED(3, "暂停", "游戏暂停"),
    VICTORY(4, "胜利", "关卡通关"),
    DEFEAT(5, "失败", "游戏结束"),
    WAVE_COMPLETE(6, "波次完成", "当前波次敌人已消灭");

    private final int code;
    private final String name;
    private final String description;
}
