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
 * 波次敌人配置表(TdWaveEnemy)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_wave_enemy")
public class TdWaveEnemy extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long waveId;

    private Long enemyId;

    private Integer count;

    private Double hpMultiplier;

    private Double speedMultiplier;

    private Integer spawnOrder;

    private Integer status;
}
