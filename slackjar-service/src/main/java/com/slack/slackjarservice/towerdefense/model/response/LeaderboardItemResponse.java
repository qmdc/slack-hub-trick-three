package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;

/**
 * 排行榜项响应
 *
 * @author zhn
 */
@Data
public class LeaderboardItemResponse {

    private Long id;

    private Long userId;

    private String username;

    private String nickname;

    private Long mapId;

    private String mapName;

    private Integer maxWaveReached;

    private Integer totalGoldEarned;

    private Integer totalDamageDealt;

    private Integer enemiesKilled;

    private Long playTime;

    private Long createTime;

    private Integer rank;
}
