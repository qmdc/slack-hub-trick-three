package com.slack.slackjarservice.smarthome.service.impl;

import com.alibaba.csp.sentinel.util.StringUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.smarthome.dao.ScheduleTaskDao;
import com.slack.slackjarservice.smarthome.entity.ScheduleTask;
import com.slack.slackjarservice.smarthome.service.ScheduleTaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import static cn.hutool.core.util.StrUtil.isNotBlank;

@Slf4j
@Service("smartHomeScheduleTaskService")
public class ScheduleTaskServiceImpl extends ServiceImpl<ScheduleTaskDao, ScheduleTask> implements ScheduleTaskService {

    @Override
    public IPage<ScheduleTask> pageQuery(IPage<ScheduleTask> page, String taskName, Integer status) {
        return baseMapper.selectPage(page, Wrappers.lambdaQuery(ScheduleTask.class)
                .like(StringUtil.isNotBlank(taskName), ScheduleTask::getTaskName, taskName)
                .eq(status != null, ScheduleTask::getStatus, status));
    }

    @Override
    public void startTask(Long taskId) {
        ScheduleTask task = getById(taskId);
        if (task != null) {
            task.setStatus(1);
            task.setNextRunTime(System.currentTimeMillis());
            updateById(task);
            log.info("启动定时任务: taskId={}, taskName={}", taskId, task.getTaskName());
        }
    }

    @Override
    public void stopTask(Long taskId) {
        ScheduleTask task = getById(taskId);
        if (task != null) {
            task.setStatus(0);
            updateById(task);
            log.info("停止定时任务: taskId={}, taskName={}", taskId, task.getTaskName());
        }
    }
}