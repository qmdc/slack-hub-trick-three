package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;
import java.util.List;

/**
 * 游戏初始化响应
 *
 * @author zhn
 */
@Data
public class GameInitResponse {

    private String gameSessionId;

    private Long mapId;

    private String mapName;

    private Integer mapWidth;

    private Integer mapHeight;

    private Integer tileSize;

    private String gridData;

    private List<PathPoint> pathData;

    private Integer startGold;

    private Integer playerHp;

    private Integer totalWaves;

    private List<TowerInfo> availableTowers;

    private List<WaveInfo> waveInfos;

    @Data
    public static class PathPoint {
        private Integer x;
        private Integer y;
    }

    @Data
    public static class TowerInfo {
        private Long id;
        private String name;
        private Integer towerType;
        private String description;
        private Integer baseCost;
        private Integer baseDamage;
        private Double baseAttackSpeed;
        private Integer baseRange;
        private Integer upgradeCost;
        private String icon;
        private String color;
        private String specialEffect;
        private Integer unlockWave;
    }

    @Data
    public static class WaveInfo {
        private Long id;
        private Integer waveNumber;
        private String name;
        private Integer totalEnemies;
        private Long spawnInterval;
        private Double difficultyMultiplier;
        private Integer bonusGold;
        private List<WaveEnemyInfo> enemies;
    }

    @Data
    public static class WaveEnemyInfo {
        private Long enemyId;
        private String enemyName;
        private Integer enemyType;
        private Integer count;
        private Double hpMultiplier;
        private Double speedMultiplier;
        private Integer spawnOrder;
    }
}
