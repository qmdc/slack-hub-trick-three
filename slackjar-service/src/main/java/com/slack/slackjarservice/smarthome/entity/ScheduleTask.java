package com.slack.slackjarservice.smarthome.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.ibatis.type.Alias;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("schedule_task")
@Alias("SmartHomeScheduleTask")
public class ScheduleTask extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String taskName;

    private Integer taskType;

    private String cronExpression;

    private Long startTime;

    private Long endTime;

    private Integer repeatInterval;

    private Integer repeatCount;

    private Long targetSceneId;

    private Integer status;

    private Long lastRunTime;

    private Long nextRunTime;
}