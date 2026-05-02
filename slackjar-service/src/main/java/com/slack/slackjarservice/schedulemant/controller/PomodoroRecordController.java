package com.slack.slackjarservice.schedulemant.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.schedulemant.entity.PomodoroRecord;
import com.slack.slackjarservice.schedulemant.model.request.PomodoroStartRequest;
import com.slack.slackjarservice.schedulemant.model.response.EfficiencyAnalysisResponse;
import com.slack.slackjarservice.schedulemant.model.response.FocusTrendResponse;
import com.slack.slackjarservice.schedulemant.model.response.TimeDistributionResponse;
import com.slack.slackjarservice.schedulemant.service.PomodoroRecordService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 番茄钟记录控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/schedule/pomodoro")
public class PomodoroRecordController extends BaseController {

    @Resource
    private PomodoroRecordService pomodoroRecordService;

    /**
     * 获取当前进行中的番茄钟
     */
    @GetMapping("/current")
    public ApiResponse<PomodoroRecord> getCurrentPomodoro() {
        return success(pomodoroRecordService.getCurrentPomodoro());
    }

    /**
     * 按日期范围查询番茄钟记录
     */
    @GetMapping("/byDateRange")
    public ApiResponse<List<PomodoroRecord>> getByDateRange(
            @RequestParam Long startTime,
            @RequestParam Long endTime) {
        return success(pomodoroRecordService.getByDateRange(startTime, endTime));
    }

    /**
     * 开始番茄钟
     */
    @PostMapping("/start")
    public ApiResponse<PomodoroRecord> startPomodoro(@Valid @RequestBody PomodoroStartRequest request) {
        return success(pomodoroRecordService.startPomodoro(request));
    }

    /**
     * 完成番茄钟
     */
    @PostMapping("/complete/{id}")
    public ApiResponse<PomodoroRecord> completePomodoro(@PathVariable Long id) {
        return success(pomodoroRecordService.completePomodoro(id));
    }

    /**
     * 打断番茄钟
     */
    @PostMapping("/interrupt/{id}")
    public ApiResponse<PomodoroRecord> interruptPomodoro(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return success(pomodoroRecordService.interruptPomodoro(id, reason));
    }

    /**
     * 放弃番茄钟
     */
    @PostMapping("/abandon/{id}")
    public ApiResponse<PomodoroRecord> abandonPomodoro(@PathVariable Long id) {
        return success(pomodoroRecordService.abandonPomodoro(id));
    }

    /**
     * 获取时间分配统计（饼图数据）
     */
    @GetMapping("/statistics/timeDistribution")
    public ApiResponse<TimeDistributionResponse> getTimeDistribution(
            @RequestParam Long startTime,
            @RequestParam Long endTime) {
        return success(pomodoroRecordService.getTimeDistribution(startTime, endTime));
    }

    /**
     * 获取专注时长趋势
     */
    @GetMapping("/statistics/focusTrend")
    public ApiResponse<FocusTrendResponse> getFocusTrend(
            @RequestParam Long startTime,
            @RequestParam Long endTime) {
        return success(pomodoroRecordService.getFocusTrend(startTime, endTime));
    }

    /**
     * 获取效率分析
     */
    @GetMapping("/statistics/efficiencyAnalysis")
    public ApiResponse<EfficiencyAnalysisResponse> getEfficiencyAnalysis(
            @RequestParam Long startTime,
            @RequestParam Long endTime) {
        return success(pomodoroRecordService.getEfficiencyAnalysis(startTime, endTime));
    }
}
