package com.slack.slackjarservice.schedulemant.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTask;
import com.slack.slackjarservice.schedulemant.model.request.TaskPageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TaskSaveRequest;

import java.util.List;

/**
 * 任务服务接口
 *
 * @author zhn
 */
public interface ScheduleTaskService extends IService<ScheduleTask> {

    PageResult<ScheduleTask> pageQuery(TaskPageQuery query);

    ScheduleTask saveTask(TaskSaveRequest request);

    void deleteTask(Long id);

    ScheduleTask getTaskDetail(Long id);

    List<ScheduleTask> getByPriority(Integer priority);

    List<ScheduleTask> getPendingTasks();

    void updateTaskStatus(Long id, Integer status);
}
