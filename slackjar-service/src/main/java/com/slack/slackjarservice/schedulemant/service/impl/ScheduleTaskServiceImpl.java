package com.slack.slackjarservice.schedulemant.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.schedulemant.dao.ScheduleTaskDao;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTask;
import com.slack.slackjarservice.schedulemant.model.request.TaskPageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TaskSaveRequest;
import com.slack.slackjarservice.schedulemant.service.ScheduleTaskService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * 任务服务实现类
 *
 * @author zhn
 */
@Service("scheduleTaskService")
public class ScheduleTaskServiceImpl extends ServiceImpl<ScheduleTaskDao, ScheduleTask> implements ScheduleTaskService {

    @Override
    public PageResult<ScheduleTask> pageQuery(TaskPageQuery query) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTask> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTask::getUserId, userId);

        if (Objects.nonNull(query.getTitle()) && !query.getTitle().isEmpty()) {
            queryWrapper.like(ScheduleTask::getTitle, query.getTitle());
        }
        if (Objects.nonNull(query.getPriority())) {
            queryWrapper.eq(ScheduleTask::getPriority, query.getPriority());
        }
        if (Objects.nonNull(query.getTaskType())) {
            queryWrapper.eq(ScheduleTask::getTaskType, query.getTaskType());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(ScheduleTask::getStatus, query.getStatus());
        }
        if (Objects.nonNull(query.getDueTimeStart())) {
            queryWrapper.ge(ScheduleTask::getDueTime, query.getDueTimeStart());
        }
        if (Objects.nonNull(query.getDueTimeEnd())) {
            queryWrapper.le(ScheduleTask::getDueTime, query.getDueTimeEnd());
        }

        queryWrapper.orderByAsc(ScheduleTask::getDueTime)
                .orderByAsc(ScheduleTask::getPriority);

        Page<ScheduleTask> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    public ScheduleTask saveTask(TaskSaveRequest request) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTask task;
        if (Objects.nonNull(request.getId())) {
            task = this.getById(request.getId());
            AssertUtil.notNull(task, ResponseEnum.DATA_NOT_EXISTS);
            AssertUtil.isTrue(task.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);
        } else {
            task = new ScheduleTask();
            task.setUserId(userId);
            task.setStatus(EnableStatusEnum.ENABLE.getCode());
            task.setActualMinutes(0);
        }

        BeanUtils.copyProperties(request, task);

        if (Objects.nonNull(request.getStatus())) {
            task.setStatus(request.getStatus());
        }

        this.saveOrUpdate(task);
        return this.getById(task.getId());
    }

    @Override
    public void deleteTask(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTask task = this.getById(id);
        AssertUtil.notNull(task, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(task.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        this.removeById(id);
    }

    @Override
    public ScheduleTask getTaskDetail(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTask task = this.getById(id);
        AssertUtil.notNull(task, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(task.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        return task;
    }

    @Override
    public List<ScheduleTask> getByPriority(Integer priority) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTask> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTask::getUserId, userId)
                .eq(ScheduleTask::getPriority, priority)
                .orderByAsc(ScheduleTask::getDueTime);

        return this.list(queryWrapper);
    }

    @Override
    public List<ScheduleTask> getPendingTasks() {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTask> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTask::getUserId, userId)
                .eq(ScheduleTask::getStatus, EnableStatusEnum.ENABLE.getCode())
                .orderByAsc(ScheduleTask::getPriority)
                .orderByAsc(ScheduleTask::getDueTime);

        return this.list(queryWrapper);
    }

    @Override
    public void updateTaskStatus(Long id, Integer status) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTask task = this.getById(id);
        AssertUtil.notNull(task, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(task.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        task.setStatus(status);
        this.updateById(task);
    }
}
