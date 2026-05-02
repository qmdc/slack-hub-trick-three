package com.slack.slackjarservice.schedulemant.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 番茄钟开始请求
 *
 * @author zhn
 */
@Data
public class PomodoroStartRequest {

    private Long taskId;

    private Long timeBlockId;

    @NotNull(message = "计划时长不能为空")
    private Integer plannedMinutes;
}
