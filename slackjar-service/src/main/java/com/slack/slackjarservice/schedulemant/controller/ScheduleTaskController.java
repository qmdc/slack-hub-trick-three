package com.slack.slackjarservice.schedulemant.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTask;
import com.slack.slackjarservice.schedulemant.model.request.TaskPageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TaskSaveRequest;
import com.slack.slackjarservice.schedulemant.service.ScheduleTaskService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 任务控制器
 *
 * @author zhn
 */
@RestController("scheduleMantTaskController")
@RequestMapping("/schedule/task")
public class ScheduleTaskController extends BaseController {

    @Resource(name = "scheduleTaskService")
    private ScheduleTaskService scheduleTaskService;

    /**
     * 分页查询任务列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<ScheduleTask>> pageQuery(@RequestBody TaskPageQuery query) {
        return success(scheduleTaskService.pageQuery(query));
    }

    /**
     * 获取任务详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<ScheduleTask> getDetail(@PathVariable Long id) {
        return success(scheduleTaskService.getTaskDetail(id));
    }

    /**
     * 获取待办任务
     */
    @GetMapping("/pending")
    public ApiResponse<List<ScheduleTask>> getPendingTasks() {
        return success(scheduleTaskService.getPendingTasks());
    }

    /**
     * 按优先级获取任务
     */
    @GetMapping("/byPriority/{priority}")
    public ApiResponse<List<ScheduleTask>> getByPriority(@PathVariable Integer priority) {
        return success(scheduleTaskService.getByPriority(priority));
    }

    /**
     * 保存任务
     */
    @PostMapping("/save")
    public ApiResponse<ScheduleTask> save(@Valid @RequestBody TaskSaveRequest request) {
        return success(scheduleTaskService.saveTask(request));
    }

    /**
     * 更新任务状态
     */
    @PutMapping("/status/{id}/{status}")
    public ApiResponse<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        scheduleTaskService.updateTaskStatus(id, status);
        return success();
    }

    /**
     * 删除任务
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        scheduleTaskService.deleteTask(id);
        return success();
    }
}
