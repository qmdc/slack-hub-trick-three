package com.slack.slackjarservice.smarthome.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.smarthome.entity.LinkageRule;
import com.slack.slackjarservice.smarthome.service.LinkageRuleService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/smart-home/rule")
public class LinkageRuleController extends BaseController {

    @Resource
    private LinkageRuleService linkageRuleService;

    @GetMapping("/list")
    public ApiResponse<IPage<LinkageRule>> listRules(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String ruleName,
            @RequestParam(required = false) Integer status) {
        IPage<LinkageRule> page = new Page<>(pageNo, pageSize);
        IPage<LinkageRule> result = linkageRuleService.pageQuery(page, ruleName, status);
        return success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<LinkageRule> getRule(@PathVariable Long id) {
        LinkageRule rule = linkageRuleService.getById(id);
        return success(rule);
    }

    @PostMapping("/save")
    public ApiResponse<LinkageRule> saveRule(@RequestBody LinkageRule rule) {
        linkageRuleService.saveOrUpdate(rule);
        return success(rule);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRule(@PathVariable Long id) {
        linkageRuleService.removeById(id);
        return success();
    }

    @PostMapping("/{id}/enable")
    public ApiResponse<Void> enableRule(@PathVariable Long id) {
        LinkageRule rule = linkageRuleService.getById(id);
        if (rule != null) {
            rule.setStatus(1);
            linkageRuleService.updateById(rule);
        }
        return success();
    }

    @PostMapping("/{id}/disable")
    public ApiResponse<Void> disableRule(@PathVariable Long id) {
        LinkageRule rule = linkageRuleService.getById(id);
        if (rule != null) {
            rule.setStatus(0);
            linkageRuleService.updateById(rule);
        }
        return success();
    }
}