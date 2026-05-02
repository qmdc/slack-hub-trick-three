package com.slack.slackjarservice.towerdefense.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.towerdefense.entity.TdLayout;
import com.slack.slackjarservice.towerdefense.model.request.ImportLayoutRequest;
import com.slack.slackjarservice.towerdefense.model.request.SaveLayoutRequest;
import com.slack.slackjarservice.towerdefense.model.response.ImportLayoutResponse;
import com.slack.slackjarservice.towerdefense.model.response.SaveLayoutResponse;
import com.slack.slackjarservice.towerdefense.service.LayoutService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 布局控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/layout")
public class LayoutController extends BaseController {

    @Resource
    private LayoutService layoutService;

    /**
     * 保存布局
     */
    @PostMapping("/save")
    public ApiResponse<SaveLayoutResponse> saveLayout(@Valid @RequestBody SaveLayoutRequest request) {
        Long userId = getLoginUserId();
        return success(layoutService.saveLayout(request, userId));
    }

    /**
     * 导入布局（通过分享码）
     */
    @PostMapping("/import")
    public ApiResponse<ImportLayoutResponse> importLayout(@Valid @RequestBody ImportLayoutRequest request) {
        Long userId = getLoginUserId();
        return success(layoutService.importLayout(request, userId));
    }

    /**
     * 获取用户的布局列表
     */
    @GetMapping("/my")
    public ApiResponse<List<TdLayout>> getMyLayouts() {
        Long userId = getLoginUserId();
        return success(layoutService.getUserLayouts(userId));
    }

    /**
     * 获取布局详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<TdLayout> getLayoutDetail(@PathVariable Long id) {
        return success(layoutService.getLayoutById(id));
    }

    /**
     * 删除布局
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLayout(@PathVariable Long id) {
        Long userId = getLoginUserId();
        layoutService.deleteLayout(id, userId);
        return success();
    }
}
