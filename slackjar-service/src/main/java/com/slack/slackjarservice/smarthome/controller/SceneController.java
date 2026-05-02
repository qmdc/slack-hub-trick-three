package com.slack.slackjarservice.smarthome.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.smarthome.entity.Scene;
import com.slack.slackjarservice.smarthome.service.SceneService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/smart-home/scene")
public class SceneController extends BaseController {

    @Resource
    private SceneService sceneService;

    @GetMapping("/list")
    public ApiResponse<IPage<Scene>> listScenes(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String sceneName,
            @RequestParam(required = false) Integer status) {
        IPage<Scene> page = new Page<>(pageNo, pageSize);
        IPage<Scene> result = sceneService.pageQuery(page, sceneName, status);
        return success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Scene> getScene(@PathVariable Long id) {
        Scene scene = sceneService.getById(id);
        return success(scene);
    }

    @PostMapping("/save")
    public ApiResponse<Scene> saveScene(@RequestBody Map<String, Object> request) {
        Scene scene = new Scene();
        scene.setId(request.containsKey("id") ? ((Number) request.get("id")).longValue() : null);
        scene.setSceneName((String) request.get("sceneName"));
        scene.setDescription((String) request.get("description"));
        scene.setIcon((String) request.get("icon"));
        scene.setStatus(request.containsKey("status") ? ((Number) request.get("status")).intValue() : 1);
        scene.setIsDefault(request.containsKey("isDefault") ? ((Number) request.get("isDefault")).intValue() : 0);
        
        String triggersJson = request.containsKey("triggers") ? request.get("triggers").toString() : null;
        String actionsJson = request.containsKey("actions") ? request.get("actions").toString() : null;
        
        sceneService.saveSceneWithTriggersAndActions(scene, triggersJson, actionsJson);
        return success(scene);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteScene(@PathVariable Long id) {
        sceneService.removeById(id);
        return success();
    }

    @PostMapping("/{id}/execute")
    public ApiResponse<Void> executeScene(@PathVariable Long id) {
        sceneService.executeScene(id);
        return success();
    }
}