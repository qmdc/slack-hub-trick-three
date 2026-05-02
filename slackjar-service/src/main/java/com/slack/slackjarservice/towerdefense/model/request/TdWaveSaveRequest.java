package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 波次保存请求
 *
 * @author zhn
 */
@Data
public class TdWaveSaveRequest {

    private Long id;

    @NotNull(message = "地图ID不能为空")
    private Long mapId;

    @NotNull(message = "波次序号不能为空")
    private Integer waveNumber;

    private String name;

    @NotNull(message = "总敌人数不能为空")
    private Integer totalEnemies;

    @NotNull(message = "生成间隔不能为空")
    private Long spawnInterval;

    private Double difficultyMultiplier;

    private Integer bonusGold;

    private Integer status;

    private List<TdWaveEnemySaveRequest> enemies;
}
