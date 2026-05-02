package com.slack.slackjarservice.towerdefense.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdTower;
import com.slack.slackjarservice.towerdefense.model.request.TdTowerPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdTowerSaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdTowerService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 塔配置控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/tower")
public class TdTowerController extends BaseController {

    @Resource
    private TdTowerService tdTowerService;

    /**
     * 分页查询塔列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<TdTower>> pageQuery(@RequestBody TdTowerPageQuery query) {
        return success(tdTowerService.pageQuery(query));
    }

    /**
     * 获取塔详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<TdTower> getDetail(@PathVariable Long id) {
        return success(tdTowerService.getTowerDetail(id));
    }

    /**
     * 获取可用塔列表
     */
    @GetMapping("/available")
    public ApiResponse<List<TdTower>> getAvailableTowers(
            @RequestParam(required = false) Integer currentWave) {
        return success(tdTowerService.getAvailableTowers(currentWave));
    }

    /**
     * 保存塔配置（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @PostMapping("/save")
    public ApiResponse<TdTower> save(@Valid @RequestBody TdTowerSaveRequest request) {
        return success(tdTowerService.saveTower(request));
    }

    /**
     * 删除塔配置（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tdTowerService.deleteTower(id);
        return success();
    }
}
