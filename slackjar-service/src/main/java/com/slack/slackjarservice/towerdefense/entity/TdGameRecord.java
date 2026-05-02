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
 * 游戏记录表(TdGameRecord)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_game_record")
public class TdGameRecord extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long mapId;

    private Integer maxWaveReached;

    private Integer totalGoldEarned;

    private Integer totalDamageDealt;

    private Integer enemiesKilled;

    private Integer towersBuilt;

    private Integer gameStatus;

    private Long playTime;

    private Integer status;
}
