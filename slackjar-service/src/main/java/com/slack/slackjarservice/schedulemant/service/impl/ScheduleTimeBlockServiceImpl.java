package com.slack.slackjarservice.schedulemant.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.enumtype.schedulemant.TimeBlockTypeEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.schedulemant.dao.ScheduleTimeBlockDao;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTimeBlock;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockBatchSaveRequest;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockPageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TimeBlockSaveRequest;
import com.slack.slackjarservice.schedulemant.service.ScheduleTimeBlockService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 时间块服务实现类
 *
 * @author zhn
 */
@Service("scheduleTimeBlockService")
public class ScheduleTimeBlockServiceImpl extends ServiceImpl<ScheduleTimeBlockDao, ScheduleTimeBlock> implements ScheduleTimeBlockService {

    @Override
    public PageResult<ScheduleTimeBlock> pageQuery(TimeBlockPageQuery query) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTimeBlock> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTimeBlock::getUserId, userId);

        if (Objects.nonNull(query.getStartTime())) {
            queryWrapper.ge(ScheduleTimeBlock::getStartTime, query.getStartTime());
        }
        if (Objects.nonNull(query.getEndTime())) {
            queryWrapper.le(ScheduleTimeBlock::getEndTime, query.getEndTime());
        }
        if (Objects.nonNull(query.getBlockType())) {
            queryWrapper.eq(ScheduleTimeBlock::getBlockType, query.getBlockType());
        }
        if (Objects.nonNull(query.getPriority())) {
            queryWrapper.eq(ScheduleTimeBlock::getPriority, query.getPriority());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(ScheduleTimeBlock::getStatus, query.getStatus());
        }

        queryWrapper.orderByAsc(ScheduleTimeBlock::getStartTime);

        Page<ScheduleTimeBlock> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    public ScheduleTimeBlock saveTimeBlock(TimeBlockSaveRequest request) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTimeBlock timeBlock;
        if (Objects.nonNull(request.getId())) {
            timeBlock = this.getById(request.getId());
            AssertUtil.notNull(timeBlock, ResponseEnum.DATA_NOT_EXISTS);
            AssertUtil.isTrue(timeBlock.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);
        } else {
            timeBlock = new ScheduleTimeBlock();
            timeBlock.setUserId(userId);
            timeBlock.setStatus(EnableStatusEnum.ENABLE.getCode());
        }

        BeanUtils.copyProperties(request, timeBlock);

        if (Objects.isNull(timeBlock.getColor())) {
            TimeBlockTypeEnum typeEnum = TimeBlockTypeEnum.getByCode(request.getBlockType());
            timeBlock.setColor(typeEnum.getColor());
        }

        if (Objects.nonNull(request.getStartTime()) && Objects.isNull(timeBlock.getDayOfWeek())) {
            LocalDateTime dateTime = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(request.getStartTime()),
                    ZoneId.systemDefault()
            );
            DayOfWeek dayOfWeek = dateTime.getDayOfWeek();
            timeBlock.setDayOfWeek(dayOfWeek.getValue());
        }

        if (Objects.nonNull(request.getStatus())) {
            timeBlock.setStatus(request.getStatus());
        }

        this.saveOrUpdate(timeBlock);
        return this.getById(timeBlock.getId());
    }

    @Override
    public void deleteTimeBlock(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTimeBlock timeBlock = this.getById(id);
        AssertUtil.notNull(timeBlock, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(timeBlock.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        this.removeById(id);
    }

    @Override
    public ScheduleTimeBlock getTimeBlockDetail(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTimeBlock timeBlock = this.getById(id);
        AssertUtil.notNull(timeBlock, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(timeBlock.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        return timeBlock;
    }

    @Override
    public List<ScheduleTimeBlock> getByDateRange(Long startTime, Long endTime) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTimeBlock> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTimeBlock::getUserId, userId)
                .ge(ScheduleTimeBlock::getStartTime, startTime)
                .le(ScheduleTimeBlock::getEndTime, endTime)
                .orderByAsc(ScheduleTimeBlock::getStartTime);

        return this.list(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ScheduleTimeBlock> batchCreateFromTemplate(TimeBlockBatchSaveRequest request) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());
        List<ScheduleTimeBlock> result = new ArrayList<>();

        Long targetDate = request.getTargetDate();
        if (Objects.isNull(targetDate)) {
            targetDate = System.currentTimeMillis();
        }

        LocalDateTime targetDateTime = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(targetDate),
                ZoneId.systemDefault()
        );

        for (TimeBlockSaveRequest blockRequest : request.getTimeBlocks()) {
            ScheduleTimeBlock timeBlock = new ScheduleTimeBlock();
            timeBlock.setUserId(userId);
            timeBlock.setTaskId(blockRequest.getTaskId());
            timeBlock.setBlockType(blockRequest.getBlockType());
            timeBlock.setTitle(blockRequest.getTitle());
            timeBlock.setDescription(blockRequest.getDescription());

            LocalDateTime originalStart = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(blockRequest.getStartTime()),
                    ZoneId.systemDefault()
            );

            LocalDateTime newStart = LocalDateTime.of(
                    targetDateTime.getYear(),
                    targetDateTime.getMonth(),
                    targetDateTime.getDayOfMonth(),
                    originalStart.getHour(),
                    originalStart.getMinute()
            );

            long duration = blockRequest.getEndTime() - blockRequest.getStartTime();

            timeBlock.setStartTime(newStart.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            timeBlock.setEndTime(timeBlock.getStartTime() + duration);
            timeBlock.setDayOfWeek(targetDateTime.getDayOfWeek().getValue());

            if (Objects.nonNull(blockRequest.getColor())) {
                timeBlock.setColor(blockRequest.getColor());
            } else {
                TimeBlockTypeEnum typeEnum = TimeBlockTypeEnum.getByCode(blockRequest.getBlockType());
                timeBlock.setColor(typeEnum.getColor());
            }

            timeBlock.setPriority(blockRequest.getPriority());
            timeBlock.setStatus(EnableStatusEnum.ENABLE.getCode());
            timeBlock.setRemark(blockRequest.getRemark());

            this.save(timeBlock);
            result.add(timeBlock);
        }

        return result;
    }
}
