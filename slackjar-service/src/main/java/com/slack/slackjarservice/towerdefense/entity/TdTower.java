package com.slack.slackjarservice.towerdefense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 塔配置表(TdTower)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_tower")
public class TdTower extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private Integer towerType;

    private String description;

    private Integer baseCost;

    private Integer baseDamage;

    private Double baseAttackSpeed;

    private Integer baseRange;

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
