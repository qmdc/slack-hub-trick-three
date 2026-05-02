package com.slack.slackjarservice.towerdefense.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdEnemy;
import com.slack.slackjarservice.towerdefense.model.request.TdEnemyPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdEnemySaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdEnemyService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 敌人配置控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/enemy")
public class TdEnemyController extends BaseController {

    @Resource
    private TdEnemyService tdEnemyService;

    /**
     * 分页查询敌人列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<TdEnemy>> pageQuery(@RequestBody TdEnemyPageQuery query) {
        return success(tdEnemyService.pageQuery(query));
    }

    /**
     * 获取敌人详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<TdEnemy> getDetail(@PathVariable Long id) {
        return success(tdEnemyService.getEnemyDetail(id));
    }

    /**
     * 获取可用敌人列表
     */
    @GetMapping("/available")
    public ApiResponse<List<TdEnemy>> getAvailableEnemies() {
        return success(tdEnemyService.getAvailableEnemies());
    }

    /**
     * 保存敌人配置（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @PostMapping("/save")
    public ApiResponse<TdEnemy> save(@Valid @RequestBody TdEnemySaveRequest request) {
        return success(tdEnemyService.saveEnemy(request));
    }

    /**
     * 删除敌人配置（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tdEnemyService.deleteEnemy(id);
        return success();
    }
}
