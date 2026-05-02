package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 游戏初始化请求
 *
 * @author zhn
 */
@Data
public class GameInitRequest {

    @NotNull(message = "地图ID不能为空")
    private Long mapId;

    private Long layoutId;

    private String shareCode;
}
