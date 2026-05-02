package com.slack.slackjarservice.schedulemant.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTemplate;
import com.slack.slackjarservice.schedulemant.model.request.TemplatePageQuery;
import com.slack.slackjarservice.schedulemant.model.request.TemplateSaveRequest;
import com.slack.slackjarservice.schedulemant.service.ScheduleTemplateService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 计划模板控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/schedule/template")
public class ScheduleTemplateController extends BaseController {

    @Resource
    private ScheduleTemplateService scheduleTemplateService;

    /**
     * 分页查询模板列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<ScheduleTemplate>> pageQuery(@RequestBody TemplatePageQuery query) {
        return success(scheduleTemplateService.pageQuery(query));
    }

    /**
     * 获取模板详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<ScheduleTemplate> getDetail(@PathVariable Long id) {
        return success(scheduleTemplateService.getTemplateDetail(id));
    }

    /**
     * 按类型获取模板
     */
    @GetMapping("/byType/{templateType}")
    public ApiResponse<List<ScheduleTemplate>> getByType(@PathVariable Integer templateType) {
        return success(scheduleTemplateService.getByType(templateType));
    }

    /**
     * 获取默认模板
     */
    @GetMapping("/default/{templateType}")
    public ApiResponse<ScheduleTemplate> getDefaultTemplate(@PathVariable Integer templateType) {
        return success(scheduleTemplateService.getDefaultTemplate(templateType));
    }

    /**
     * 保存模板
     */
    @PostMapping("/save")
    public ApiResponse<ScheduleTemplate> save(@Valid @RequestBody TemplateSaveRequest request) {
        return success(scheduleTemplateService.saveTemplate(request));
    }

    /**
     * 设置默认模板
     */
    @PutMapping("/setDefault/{id}")
    public ApiResponse<Void> setDefaultTemplate(@PathVariable Long id) {
        scheduleTemplateService.setDefaultTemplate(id);
        return success();
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        scheduleTemplateService.deleteTemplate(id);
        return success();
    }
}
