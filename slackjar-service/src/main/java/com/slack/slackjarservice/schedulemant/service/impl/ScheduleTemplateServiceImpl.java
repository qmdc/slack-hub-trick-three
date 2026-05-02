package com.slack.slackjarservice.schedulemant.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.schedulemant.dao.ScheduleTemplateDao;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTemplate;
import com.slack.slackjarservice.schedulemant.model.request.TemplatePageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TemplateSaveRequest;
import com.slack.slackjarservice.schedulemant.service.ScheduleTemplateService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * 计划模板服务实现类
 *
 * @author zhn
 */
@Service("scheduleTemplateService")
public class ScheduleTemplateServiceImpl extends ServiceImpl<ScheduleTemplateDao, ScheduleTemplate> implements ScheduleTemplateService {

    @Override
    public PageResult<ScheduleTemplate> pageQuery(TemplatePageQuery query) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTemplate> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTemplate::getUserId, userId);

        if (Objects.nonNull(query.getName()) && !query.getName().isEmpty()) {
            queryWrapper.like(ScheduleTemplate::getName, query.getName());
        }
        if (Objects.nonNull(query.getTemplateType())) {
            queryWrapper.eq(ScheduleTemplate::getTemplateType, query.getTemplateType());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(ScheduleTemplate::getStatus, query.getStatus());
        }

        queryWrapper.orderByDesc(ScheduleTemplate::getIsDefault)
                .orderByDesc(ScheduleTemplate::getCreateTime);

        Page<ScheduleTemplate> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ScheduleTemplate saveTemplate(TemplateSaveRequest request) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTemplate template;
        if (Objects.nonNull(request.getId())) {
            template = this.getById(request.getId());
            AssertUtil.notNull(template, ResponseEnum.DATA_NOT_EXISTS);
            AssertUtil.isTrue(template.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);
        } else {
            template = new ScheduleTemplate();
            template.setUserId(userId);
            template.setStatus(EnableStatusEnum.ENABLE.getCode());
            template.setIsDefault(0);
        }

        BeanUtils.copyProperties(request, template);

        if (Objects.nonNull(request.getStatus())) {
            template.setStatus(request.getStatus());
        }

        if (Objects.nonNull(request.getIsDefault()) && request.getIsDefault() == 1) {
            LambdaUpdateWrapper<ScheduleTemplate> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(ScheduleTemplate::getUserId, userId)
                    .eq(ScheduleTemplate::getTemplateType, template.getTemplateType())
                    .set(ScheduleTemplate::getIsDefault, 0);
            this.update(updateWrapper);
            template.setIsDefault(1);
        }

        this.saveOrUpdate(template);
        return this.getById(template.getId());
    }

    @Override
    public void deleteTemplate(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTemplate template = this.getById(id);
        AssertUtil.notNull(template, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(template.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        this.removeById(id);
    }

    @Override
    public ScheduleTemplate getTemplateDetail(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTemplate template = this.getById(id);
        AssertUtil.notNull(template, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(template.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        return template;
    }

    @Override
    public List<ScheduleTemplate> getByType(Integer templateType) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTemplate> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTemplate::getUserId, userId)
                .eq(ScheduleTemplate::getTemplateType, templateType)
                .eq(ScheduleTemplate::getStatus, EnableStatusEnum.ENABLE.getCode())
                .orderByDesc(ScheduleTemplate::getIsDefault)
                .orderByDesc(ScheduleTemplate::getCreateTime);

        return this.list(queryWrapper);
    }

    @Override
    public ScheduleTemplate getDefaultTemplate(Integer templateType) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        LambdaQueryWrapper<ScheduleTemplate> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ScheduleTemplate::getUserId, userId)
                .eq(ScheduleTemplate::getTemplateType, templateType)
                .eq(ScheduleTemplate::getIsDefault, 1)
                .eq(ScheduleTemplate::getStatus, EnableStatusEnum.ENABLE.getCode());

        return this.getOne(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefaultTemplate(Long id) {
        Long userId = Long.valueOf(StpUtil.getLoginId().toString());

        ScheduleTemplate template = this.getById(id);
        AssertUtil.notNull(template, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(template.getUserId().equals(userId), ResponseEnum.NO_PERMISSION);

        LambdaUpdateWrapper<ScheduleTemplate> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ScheduleTemplate::getUserId, userId)
                .eq(ScheduleTemplate::getTemplateType, template.getTemplateType())
                .set(ScheduleTemplate::getIsDefault, 0);
        this.update(updateWrapper);

        template.setIsDefault(1);
        this.updateById(template);
    }
}
