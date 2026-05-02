package com.slack.slackjarservice.smarthome.service.impl;

import com.alibaba.csp.sentinel.util.StringUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.smarthome.dao.IotDeviceDao;
import com.slack.slackjarservice.smarthome.entity.IotDevice;
import com.slack.slackjarservice.smarthome.service.IotDeviceService;
import org.springframework.stereotype.Service;

import static cn.hutool.core.util.StrUtil.isNotBlank;

import java.math.BigDecimal;

@Service
public class IotDeviceServiceImpl extends ServiceImpl<IotDeviceDao, IotDevice> implements IotDeviceService {

    @Override
    public IPage<IotDevice> pageQuery(IPage<IotDevice> page, String deviceName, Integer deviceType, Integer status) {
        return baseMapper.selectPage(page, Wrappers.lambdaQuery(IotDevice.class)
                .like(StringUtil.isNotBlank(deviceName), IotDevice::getDeviceName, deviceName)
                .eq(deviceType != null, IotDevice::getDeviceType, deviceType)
                .eq(status != null, IotDevice::getStatus, status));
    }

    @Override
    public void controlDevice(Long deviceId, Integer powerStatus, Integer brightness, Double temperature) {
        IotDevice device = getById(deviceId);
        if (device != null) {
            if (powerStatus != null) {
                device.setPowerStatus(powerStatus);
            }
            if (brightness != null) {
                device.setBrightness(brightness);
            }
            if (temperature != null) {
                device.setTemperature(BigDecimal.valueOf(temperature));
            }
            updateById(device);
        }
    }

    @Override
    public void updateDeviceStatus(Long deviceId, Integer status) {
        IotDevice device = getById(deviceId);
        if (device != null) {
            device.setStatus(status);
            updateById(device);
        }
    }
}