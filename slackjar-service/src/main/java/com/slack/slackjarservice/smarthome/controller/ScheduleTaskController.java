package com.slack.slackjarservice.smarthome.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.smarthome.entity.ScheduleTask;
import com.slack.slackjarservice.smarthome.service.ScheduleTaskService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController("smartHomeScheduleTaskController")
@RequestMapping("/smart-home/task")
public class ScheduleTaskController extends BaseController {

    @Resource(name = "smartHomeScheduleTaskService")
    private ScheduleTaskService scheduleTaskService;

    @GetMapping("/list")
    public ApiResponse<IPage<ScheduleTask>> listTasks(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String taskName,
            @RequestParam(required = false) Integer status) {
        IPage<ScheduleTask> page = new Page<>(pageNo, pageSize);
        IPage<ScheduleTask> result = scheduleTaskService.pageQuery(page, taskName, status);
        return success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<ScheduleTask> getTask(@PathVariable Long id) {
        ScheduleTask task = scheduleTaskService.getById(id);
        return success(task);
    }

    @PostMapping("/save")
    public ApiResponse<ScheduleTask> saveTask(@RequestBody ScheduleTask task) {
        scheduleTaskService.saveOrUpdate(task);
        return success(task);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(@PathVariable Long id) {
        scheduleTaskService.removeById(id);
        return success();
    }

    @PostMapping("/{id}/start")
    public ApiResponse<Void> startTask(@PathVariable Long id) {
        scheduleTaskService.startTask(id);
        return success();
    }

    @PostMapping("/{id}/stop")
    public ApiResponse<Void> stopTask(@PathVariable Long id) {
        scheduleTaskService.stopTask(id);
        return success();
    }
}