package com.slack.slackjarservice.schedulemant.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTimeBlock;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockBatchSaveRequest;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockPageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockSaveRequest;

import java.util.List;

/**
 * 时间块服务接口
 *
 * @author zhn
 */
public interface ScheduleTimeBlockService extends IService<ScheduleTimeBlock> {

    PageResult<ScheduleTimeBlock> pageQuery(TimeBlockPageQuery query);

    ScheduleTimeBlock saveTimeBlock(TimeBlockSaveRequest request);

    void deleteTimeBlock(Long id);

    ScheduleTimeBlock getTimeBlockDetail(Long id);

    List<ScheduleTimeBlock> getByDateRange(Long startTime, Long endTime);

    List<ScheduleTimeBlock> batchCreateFromTemplate(TimeBlockBatchSaveRequest request);
}
