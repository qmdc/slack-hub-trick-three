package com.slack.slackjarservice.smarthome.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.smarthome.entity.AlertRecord;
import com.slack.slackjarservice.smarthome.service.AlertService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/smart-home/alert")
public class AlertController extends BaseController {

    @Resource
    private AlertService alertService;

    @GetMapping("/list")
    public ApiResponse<IPage<AlertRecord>> listAlerts(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) Integer alertType,
            @RequestParam(required = false) Integer status) {
        IPage<AlertRecord> page = new Page<>(pageNo, pageSize);
        IPage<AlertRecord> result = alertService.pageQuery(page, deviceId, alertType, status);
        return success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<AlertRecord> getAlert(@PathVariable Long id) {
        AlertRecord alert = alertService.getById(id);
        return success(alert);
    }

    @PostMapping("/handle/{id}")
    public ApiResponse<Void> handleAlert(@PathVariable Long id, @RequestParam Integer status) {
        alertService.handleAlert(id, status);
        return success();
    }

    @PostMapping("/batch-handle")
    public ApiResponse<Void> batchHandleAlerts(@RequestBody Long[] alertIds, @RequestParam Integer status) {
        for (Long id : alertIds) {
            alertService.handleAlert(id, status);
        }
        return success();
    }
}