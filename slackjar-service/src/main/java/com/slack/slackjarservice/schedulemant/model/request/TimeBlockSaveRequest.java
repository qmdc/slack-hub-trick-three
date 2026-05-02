package com.slack.slackjarservice.schedulemant.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 时间块保存请求
 *
 * @author zhn
 */
@Data
public class TimeBlockSaveRequest {

    private Long id;

    private Long taskId;

    @NotNull(message = "时间块类型不能为空")
    private Integer blockType;

    @NotBlank(message = "时间块标题不能为空")
    private String title;

    private String description;

    @NotNull(message = "开始时间不能为空")
    private Long startTime;

    @NotNull(message = "结束时间不能为空")
    private Long endTime;

    private Integer dayOfWeek;

    private String color;

    private Integer priority;

    private Integer status;

    private String remark;
}
