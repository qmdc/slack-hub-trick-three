package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 开始波次请求
 *
 * @author zhn
 */
@Data
public class StartWaveRequest {

    @NotNull(message = "游戏会话ID不能为空")
    private String gameSessionId;

    @NotNull(message = "波次序号不能为空")
    private Integer waveNumber;
}
