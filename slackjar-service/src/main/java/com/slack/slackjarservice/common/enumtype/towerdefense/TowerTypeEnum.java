package com.slack.slackjarservice.common.enumtype.towerdefense;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 塔类型枚举
 *
 * @author zhn
 */
@Getter
@AllArgsConstructor
public enum TowerTypeEnum {

    ARCHER(1, "箭塔", "远程单体攻击，攻速快", 100, 20, 5, 10, 30),
    CANNON(2, "炮塔", "范围攻击，伤害高", 150, 50, 3, 15, 60),
    MAGIC(3, "魔法塔", "减速敌人，持续伤害", 200, 35, 4, 12, 50),
    LASER(4, "激光塔", "穿透攻击，攻击直线敌人", 300, 60, 2, 20, 80),
    FROST(5, "冰冻塔", "冻结敌人，降低移动速度", 250, 25, 3, 15, 70);

    private final int code;
    private final String name;
    private final String description;
    private final int baseCost;
    private final int baseDamage;
    private final double baseAttackSpeed;
    private final int baseRange;
    private final int upgradeCost;
}
