package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 敌人保存请求
 *
 * @author zhn
 */
@Data
public class TdEnemySaveRequest {

    private Long id;

    @NotBlank(message = "敌人名称不能为空")
    private String name;

    @NotNull(message = "敌人类型不能为空")
    private Integer enemyType;

    private String description;

    @NotNull(message = "基础血量不能为空")
    private Integer baseHp;

    @NotNull(message = "基础速度不能为空")
    private Integer baseSpeed;

    @NotNull(message = "速度乘数不能为空")
    private Double speedMultiplier;

    @NotNull(message = "奖励金币不能为空")
    private Integer reward;

    private String icon;

    private String color;

    private Integer armor;

    private Double magicResistance;

    private String specialAbility;

    private Integer status;
}
