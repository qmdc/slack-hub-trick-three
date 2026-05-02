package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 升级塔请求
 *
 * @author zhn
 */
@Data
public class UpgradeTowerRequest {

    @NotNull(message = "游戏会话ID不能为空")
    private String gameSessionId;

    @NotNull(message = "塔实例ID不能为空")
    private String towerInstanceId;

    @NotNull(message = "升级等级不能为空")
    private Integer targetLevel;
}
