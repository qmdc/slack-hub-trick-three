package com.slack.slackjarservice.common.enumtype.towerdefense;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 敌人类型枚举
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum EnemyTypeEnum {

    NORMAL(1, "普通兵", "基础敌人", 100, 5, 1, 10),
    FAST(2, "快速兵", "移动速度快", 60, 8, 1.5, 8),
    TANK(3, "重甲兵", "血量高，移动慢", 300, 3, 0.6, 25),
    BOSS(4, "BOSS", "血量极高，高奖励", 1000, 2, 0.5, 100),
    HEALER(5, "治疗兵", "治疗周围敌人", 150, 4, 0.8, 30);

    private final int code;
    private final String name;
    private final String description;
    private final int baseHp;
    private final int baseSpeed;
    private final double speedMultiplier;
    private final int reward;
}
