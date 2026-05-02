package com.slack.slackjarservice.smarthome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.smarthome.entity.ScheduleTask;

public interface ScheduleTaskService extends IService<ScheduleTask> {

    IPage<ScheduleTask> pageQuery(IPage<ScheduleTask> page, String taskName, Integer status);

    void startTask(Long taskId);

    void stopTask(Long taskId);
}