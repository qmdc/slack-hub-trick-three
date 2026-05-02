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
 * 波次配置表(TdWave)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_wave")
public class TdWave extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long mapId;

    private Integer waveNumber;

    private String name;

    private Integer totalEnemies;

    private Long spawnInterval;

    private Double difficultyMultiplier;

    private Integer bonusGold;

    private Integer status;
}
