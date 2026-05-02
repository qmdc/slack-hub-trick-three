package com.slack.slackjarservice.schedulemant.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 任务保存请求
 *
 * @author zhn
 */
@Data
public class TaskSaveRequest {

    private Long id;

    @NotBlank(message = "任务标题不能为空")
    private String title;

    private String description;

    private Integer priority;

    private Long dueTime;

    private Integer estimatedMinutes;

    private Integer actualMinutes;

    private Integer taskType;

    private Integer status;

    private String remark;
}
