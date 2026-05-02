package com.slack.slackjarservice.schedulemant.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 任务实体
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("schedule_task")
public class ScheduleTask extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

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
