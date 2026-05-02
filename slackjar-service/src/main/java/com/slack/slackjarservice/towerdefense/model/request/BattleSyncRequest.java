package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

/**
 * 战斗同步请求
 *
 * @author zhn
 */
@Data
public class BattleSyncRequest {

    @NotNull(message = "游戏会话ID不能为空")
    private String gameSessionId;

    @NotNull(message = "时间戳不能为空")
    private Long timestamp;

    private List<TowerAttackRecord> towerAttacks;

    private List<EnemyMoveRecord> enemyMoves;

    private List<EnemyDamageRecord> enemyDamages;

    private Integer currentGold;

    private Integer currentHp;

    @Data
    public static class TowerAttackRecord {
        private String towerInstanceId;
        private String targetEnemyId;
        private Long attackTime;
        private Integer damage;
    }

    @Data
    public static class EnemyMoveRecord {
        private String enemyInstanceId;
        private Double positionX;
        private Double positionY;
        private Long pathIndex;
    }

    @Data
    public static class EnemyDamageRecord {
        private String enemyInstanceId;
        private Integer damage;
        private String sourceTowerId;
    }
}
