package com.slack.slackjarservice.smarthome.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.smarthome.entity.IotDevice;
import com.slack.slackjarservice.smarthome.service.IotDeviceService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/smart-home/device")
public class IotDeviceController extends BaseController {

    @Resource
    private IotDeviceService iotDeviceService;

    @GetMapping("/list")
    public ApiResponse<List<IotDevice>> listDevices() {
        List<IotDevice> devices = iotDeviceService.list();
        return success(devices);
    }

    @GetMapping("/page")
    public ApiResponse<IPage<IotDevice>> pageDevices(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String deviceName,
            @RequestParam(required = false) Integer deviceType,
            @RequestParam(required = false) Integer status) {
        IPage<IotDevice> page = new Page<>(pageNo, pageSize);
        IPage<IotDevice> result = iotDeviceService.pageQuery(page, deviceName, deviceType, status);
        return success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<IotDevice> getDevice(@PathVariable Long id) {
        IotDevice device = iotDeviceService.getById(id);
        return success(device);
    }

    @PostMapping("/save")
    public ApiResponse<IotDevice> saveDevice(@RequestBody IotDevice device) {
        iotDeviceService.saveOrUpdate(device);
        return success(device);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDevice(@PathVariable Long id) {
        iotDeviceService.removeById(id);
        return success();
    }

    @PostMapping("/{id}/control")
    public ApiResponse<Void> controlDevice(
            @PathVariable Long id,
            @RequestParam(required = false) Integer powerStatus,
            @RequestParam(required = false) Integer brightness,
            @RequestParam(required = false) Double temperature) {
        iotDeviceService.controlDevice(id, powerStatus, brightness, temperature);
        return success();
    }

    @PostMapping("/{id}/status")
    public ApiResponse<Void> updateDeviceStatus(@PathVariable Long id, @RequestParam Integer status) {
        iotDeviceService.updateDeviceStatus(id, status);
        return success();
    }
}