package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;

/**
 * 升级塔响应
 *
 * @author zhn
 */
@Data
public class UpgradeTowerResponse {

    private Boolean success;

    private String message;

    private String towerInstanceId;

    private Integer newLevel;

    private Integer remainingGold;

    private Integer upgradedDamage;

    private Double upgradedAttackSpeed;

    private Integer upgradedRange;
}
