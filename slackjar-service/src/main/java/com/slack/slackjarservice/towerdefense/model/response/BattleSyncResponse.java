package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;
import java.util.List;

/**
 * 战斗同步响应
 *
 * @author zhn
 */
@Data
public class BattleSyncResponse {

    private Boolean isValid;

    private String validationMessage;

    private Integer serverGold;

    private Integer serverHp;

    private Integer currentWave;

    private Integer gameStatus;

    private List<EnemyState> enemyStates;

    private List<TowerState> towerStates;

    private List<ServerEvent> serverEvents;

    @Data
    public static class EnemyState {
        private String instanceId;
        private Long enemyId;
        private Integer currentHp;
        private Integer maxHp;
        private Double positionX;
        private Double positionY;
        private Long pathIndex;
        private Boolean isAlive;
        private Double slowEffect;
        private Boolean isFrozen;
    }

    @Data
    public static class TowerState {
        private String instanceId;
        private Long towerId;
        private Integer level;
        private Integer gridX;
        private Integer gridY;
        private Long lastAttackTime;
    }

    @Data
    public static class ServerEvent {
        private String eventType;
        private Long timestamp;
        private String targetId;
        private Integer amount;
        private String message;
    }
}
