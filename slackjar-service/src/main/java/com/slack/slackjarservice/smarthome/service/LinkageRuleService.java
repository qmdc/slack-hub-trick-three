package com.slack.slackjarservice.smarthome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.smarthome.entity.LinkageRule;

public interface LinkageRuleService extends IService<LinkageRule> {

    IPage<LinkageRule> pageQuery(IPage<LinkageRule> page, String ruleName, Integer status);

    void checkAndExecuteRule(Long deviceId);
}