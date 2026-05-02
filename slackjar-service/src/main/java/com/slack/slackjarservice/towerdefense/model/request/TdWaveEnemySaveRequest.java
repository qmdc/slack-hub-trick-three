package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 波次敌人保存请求
 *
 * @author zhn
 */
@Data
public class TdWaveEnemySaveRequest {

    private Long id;

    private Long waveId;

    @NotNull(message = "敌人ID不能为空")
    private Long enemyId;

    @NotNull(message = "敌人数量不能为空")
    private Integer count;

    private Double hpMultiplier;

    private Double speedMultiplier;

    private Integer spawnOrder;

    private Integer status;
}
