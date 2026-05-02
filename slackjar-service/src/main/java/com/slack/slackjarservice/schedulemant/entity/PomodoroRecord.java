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
 * 番茄钟记录实体
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("pomodoro_record")
public class PomodoroRecord extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long taskId;

    private Long timeBlockId;

    private Integer plannedMinutes;

    private Integer actualMinutes;

    private Long startTime;

    private Long endTime;

    private Integer status;

    private String interruptReason;

    private String remark;
}
