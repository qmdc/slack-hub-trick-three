package com.slack.slackjarservice.smarthome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.smarthome.entity.IotDevice;

public interface IotDeviceService extends IService<IotDevice> {

    IPage<IotDevice> pageQuery(IPage<IotDevice> page, String deviceName, Integer deviceType, Integer status);

    void controlDevice(Long deviceId, Integer powerStatus, Integer brightness, Double temperature);

    void updateDeviceStatus(Long deviceId, Integer status);
}