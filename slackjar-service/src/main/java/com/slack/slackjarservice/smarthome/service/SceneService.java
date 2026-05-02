package com.slack.slackjarservice.smarthome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.smarthome.entity.Scene;

public interface SceneService extends IService<Scene> {

    IPage<Scene> pageQuery(IPage<Scene> page, String sceneName, Integer status);

    void executeScene(Long sceneId);

    void saveSceneWithTriggersAndActions(Scene scene, String triggersJson, String actionsJson);
}