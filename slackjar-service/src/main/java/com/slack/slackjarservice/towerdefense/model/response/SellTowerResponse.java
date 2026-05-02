package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;

/**
 * 出售塔响应
 *
 * @author zhn
 */
@Data
public class SellTowerResponse {

    private Boolean success;

    private String message;

    private Integer refundGold;

    private Integer remainingGold;
}
