package com.slack.slackjarservice.schedulemant.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.schedulemant.entity.PomodoroRecord;
import com.slack.slackjarservice.schedulemant.model.request.PomodoroStartRequest;
import com.slack.slackjarservice.schedulemant.model.response.EfficiencyAnalysisResponse;
import com.slack.slackjarservice.schedulemant.model.response.FocusTrendResponse;
import com.slack.slackjarservice.schedulemant.model.response.TimeDistributionResponse;

import java.util.List;

/**
 * 番茄钟记录服务接口
 *
 * @author zhn
 */
public interface PomodoroRecordService extends IService<PomodoroRecord> {

    PomodoroRecord startPomodoro(PomodoroStartRequest request);

    PomodoroRecord completePomodoro(Long id);

    PomodoroRecord interruptPomodoro(Long id, String reason);

    PomodoroRecord abandonPomodoro(Long id);

    PomodoroRecord getCurrentPomodoro();

    List<PomodoroRecord> getByDateRange(Long startTime, Long endTime);

    TimeDistributionResponse getTimeDistribution(Long startTime, Long endTime);

    FocusTrendResponse getFocusTrend(Long startTime, Long endTime);

    EfficiencyAnalysisResponse getEfficiencyAnalysis(Long startTime, Long endTime);
}
