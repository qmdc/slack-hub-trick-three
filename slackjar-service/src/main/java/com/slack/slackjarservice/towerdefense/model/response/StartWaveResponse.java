package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;
import java.util.List;

/**
 * 开始波次响应
 *
 * @author zhn
 */
@Data
public class StartWaveResponse {

    private Boolean success;

    private String message;

    private Integer waveNumber;

    private Long spawnInterval;

    private List<EnemySpawnInfo> spawnOrder;

    @Data
    public static class EnemySpawnInfo {
        private String instanceId;
        private Long enemyId;
        private Integer spawnOrder;
        private Integer maxHp;
        private Integer baseSpeed;
    }
}
