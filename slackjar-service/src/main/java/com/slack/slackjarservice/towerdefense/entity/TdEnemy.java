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
 * 敌人配置表(TdEnemy)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_enemy")
public class TdEnemy extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private Integer enemyType;

    private String description;

    private Integer baseHp;

    private Integer baseSpeed;

    private Double speedMultiplier;

    private Integer reward;

    private String icon;

    private String color;

    private Integer armor;

    private Double magicResistance;

    private String specialAbility;

    private Integer status;
}
