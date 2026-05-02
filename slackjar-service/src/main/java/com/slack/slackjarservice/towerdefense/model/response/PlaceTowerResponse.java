package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;

/**
 * 放置塔响应
 *
 * @author zhn
 */
@Data
public class PlaceTowerResponse {

    private Boolean success;

    private String message;

    private String towerInstanceId;

    private Long towerId;

    private Integer gridX;

    private Integer gridY;

    private Integer remainingGold;

    private Integer towerLevel;
}
