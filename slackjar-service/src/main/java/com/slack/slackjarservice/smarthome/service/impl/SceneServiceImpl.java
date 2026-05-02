package com.slack.slackjarservice.smarthome.service.impl;

import com.alibaba.csp.sentinel.util.StringUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.smarthome.dao.SceneActionDao;
import com.slack.slackjarservice.smarthome.dao.SceneDao;
import com.slack.slackjarservice.smarthome.dao.SceneTriggerDao;
import com.slack.slackjarservice.smarthome.entity.Scene;
import com.slack.slackjarservice.smarthome.entity.SceneAction;
import com.slack.slackjarservice.smarthome.entity.SceneTrigger;
import com.slack.slackjarservice.smarthome.service.IotDeviceService;
import com.slack.slackjarservice.smarthome.service.SceneService;
import jakarta.annotation.Resource;

import static cn.hutool.core.util.StrUtil.isNotBlank;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class SceneServiceImpl extends ServiceImpl<SceneDao, Scene> implements SceneService {

    @Resource
    private SceneTriggerDao sceneTriggerDao;

    @Resource
    private SceneActionDao sceneActionDao;

    @Resource
    private IotDeviceService iotDeviceService;

    @Override
    public IPage<Scene> pageQuery(IPage<Scene> page, String sceneName, Integer status) {
        return baseMapper.selectPage(page, Wrappers.lambdaQuery(Scene.class)
                .like(StringUtil.isNotBlank(sceneName), Scene::getSceneName, sceneName)
                .eq(status != null, Scene::getStatus, status));
    }

    @Override
    public void executeScene(Long sceneId) {
        List<SceneAction> actions = sceneActionDao.selectList(Wrappers.lambdaQuery(SceneAction.class)
                .eq(SceneAction::getSceneId, sceneId)
                .orderByAsc(SceneAction::getActionOrder));

        for (SceneAction action : actions) {
            executeAction(action);
        }
    }

    private void executeAction(SceneAction action) {
        if (action.getActionType() == 1 && action.getTargetDeviceId() != null) {
            JSONObject params = JSON.parseObject(action.getActionParams());
            Integer powerStatus = params.getInteger("powerStatus");
            Integer brightness = params.getInteger("brightness");
            Double temperature = params.getDouble("temperature");
            iotDeviceService.controlDevice(action.getTargetDeviceId(), powerStatus, brightness, temperature);
        }
        log.info("执行场景动作: sceneId={}, actionType={}, targetDeviceId={}",
                action.getSceneId(), action.getActionType(), action.getTargetDeviceId());
    }

    @Override
    @Transactional
    public void saveSceneWithTriggersAndActions(Scene scene, String triggersJson, String actionsJson) {
        saveOrUpdate(scene);

        Long sceneId = scene.getId();
        sceneTriggerDao.delete(Wrappers.lambdaQuery(SceneTrigger.class).eq(SceneTrigger::getSceneId, sceneId));
        sceneActionDao.delete(Wrappers.lambdaQuery(SceneAction.class).eq(SceneAction::getSceneId, sceneId));

        if (StringUtil.isNotBlank(triggersJson)) {
            JSONArray triggers = JSON.parseArray(triggersJson);
            int order = 0;
            for (Object obj : triggers) {
                JSONObject triggerJson = (JSONObject) obj;
                SceneTrigger trigger = new SceneTrigger();
                trigger.setSceneId(sceneId);
                trigger.setTriggerType(triggerJson.getInteger("triggerType"));
                trigger.setTriggerCondition(triggerJson.getString("triggerCondition"));
                trigger.setTriggerOrder(order++);
                sceneTriggerDao.insert(trigger);
            }
        }

        if (StringUtil.isNotBlank(actionsJson)) {
            JSONArray actions = JSON.parseArray(actionsJson);
            int order = 0;
            for (Object obj : actions) {
                JSONObject actionJson = (JSONObject) obj;
                SceneAction action = new SceneAction();
                action.setSceneId(sceneId);
                action.setActionType(actionJson.getInteger("actionType"));
                action.setTargetDeviceId(actionJson.getLong("targetDeviceId"));
                action.setActionParams(actionJson.getString("actionParams"));
                action.setActionDelay(actionJson.getInteger("actionDelay"));
                action.setActionOrder(order++);
                sceneActionDao.insert(action);
            }
        }
    }
}