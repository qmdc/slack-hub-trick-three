package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 塔保存请求
 *
 * @author zhn
 */
@Data
public class TdTowerSaveRequest {

    private Long id;

    @NotBlank(message = "塔名称不能为空")
    private String name;

    @NotNull(message = "塔类型不能为空")
    private Integer towerType;

    private String description;

    @NotNull(message = "基础费用不能为空")
    private Integer baseCost;

    @NotNull(message = "基础伤害不能为空")
    private Integer baseDamage;

    @NotNull(message = "基础攻击速度不能为空")
    private Double baseAttackSpeed;

    @NotNull(message = "基础射程不能为空")
    private Integer baseRange;

    @NotNull(message = "升级费用不能为空")
    private Integer upgradeCost;

    private Double damageUpgradeRate;

    private Double attackSpeedUpgradeRate;

    private Integer rangeUpgrade;

    private String icon;

    private String color;

    private String specialEffect;

    private Integer unlockWave;

    private Integer status;
}
