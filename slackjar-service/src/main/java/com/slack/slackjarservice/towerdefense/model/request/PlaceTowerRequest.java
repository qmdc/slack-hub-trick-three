package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 放置塔请求
 *
 * @author zhn
 */
@Data
public class PlaceTowerRequest {

    @NotNull(message = "游戏会话ID不能为空")
    private String gameSessionId;

    @NotNull(message = "塔类型ID不能为空")
    private Long towerId;

    @NotNull(message = "X坐标不能为空")
    private Integer gridX;

    @NotNull(message = "Y坐标不能为空")
    private Integer gridY;
}
