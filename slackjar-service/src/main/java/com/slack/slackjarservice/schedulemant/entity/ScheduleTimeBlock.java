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
 * 时间块实体
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("schedule_time_block")
public class ScheduleTimeBlock extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long taskId;

    private Integer blockType;

    private String title;

    private String description;

    private Long startTime;

    private Long endTime;

    private Integer dayOfWeek;

    private String color;

    private Integer priority;

    private Integer status;

    private String remark;
}
