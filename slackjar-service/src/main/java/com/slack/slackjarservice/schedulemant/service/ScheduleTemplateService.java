package com.slack.slackjarservice.schedulemant.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTemplate;
import com.slack.slackjarservice.schedulemant.model.request.TemplatePageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TemplateSaveRequest;

import java.util.List;

/**
 * 计划模板服务接口
 *
 * @author zhn
 */
public interface ScheduleTemplateService extends IService<ScheduleTemplate> {

    PageResult<ScheduleTemplate> pageQuery(TemplatePageQuery query);

    ScheduleTemplate saveTemplate(TemplateSaveRequest request);

    void deleteTemplate(Long id);

    ScheduleTemplate getTemplateDetail(Long id);

    List<ScheduleTemplate> getByType(Integer templateType);

    ScheduleTemplate getDefaultTemplate(Integer templateType);

    void setDefaultTemplate(Long id);
}
