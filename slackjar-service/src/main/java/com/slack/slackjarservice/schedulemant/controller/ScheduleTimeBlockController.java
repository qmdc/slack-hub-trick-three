package com.slack.slackjarservice.schedulemant.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTimeBlock;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockBatchSaveRequest;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockPageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockSaveRequest;
import com.slack.slackjarservice.schedulemant.service.ScheduleTimeBlockService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 时间块控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/schedule/time-block")
public class ScheduleTimeBlockController extends BaseController {

    @Resource
    private ScheduleTimeBlockService scheduleTimeBlockService;

    /**
     * 分页查询时间块列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<ScheduleTimeBlock>> pageQuery(@RequestBody TimeBlockPageQuery query) {
        return success(scheduleTimeBlockService.pageQuery(query));
    }

    /**
     * 获取时间块详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<ScheduleTimeBlock> getDetail(@PathVariable Long id) {
        return success(scheduleTimeBlockService.getTimeBlockDetail(id));
    }

    /**
     * 按日期范围查询时间块
     */
    @GetMapping("/byDateRange")
    public ApiResponse<List<ScheduleTimeBlock>> getByDateRange(
            @RequestParam Long startTime,
            @RequestParam Long endTime) {
        return success(scheduleTimeBlockService.getByDateRange(startTime, endTime));
    }

    /**
     * 保存时间块
     */
    @PostMapping("/save")
    public ApiResponse<ScheduleTimeBlock> save(@Valid @RequestBody TimeBlockSaveRequest request) {
        return success(scheduleTimeBlockService.saveTimeBlock(request));
    }

    /**
     * 批量从模板创建时间块
     */
    @PostMapping("/batchCreateFromTemplate")
    public ApiResponse<List<ScheduleTimeBlock>> batchCreateFromTemplate(
            @Valid @RequestBody TimeBlockBatchSaveRequest request) {
        return success(scheduleTimeBlockService.batchCreateFromTemplate(request));
    }

    /**
     * 删除时间块
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        scheduleTimeBlockService.deleteTimeBlock(id);
        return success();
    }
}
