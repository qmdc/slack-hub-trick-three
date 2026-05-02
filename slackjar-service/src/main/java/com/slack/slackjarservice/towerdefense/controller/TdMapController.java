package com.slack.slackjarservice.towerdefense.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdMap;
import com.slack.slackjarservice.towerdefense.model.request.TdMapPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdMapSaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdMapService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 地图配置控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/map")
public class TdMapController extends BaseController {

    @Resource
    private TdMapService tdMapService;

    /**
     * 分页查询地图列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<TdMap>> pageQuery(@RequestBody TdMapPageQuery query) {
        return success(tdMapService.pageQuery(query));
    }

    /**
     * 获取地图详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<TdMap> getDetail(@PathVariable Long id) {
        return success(tdMapService.getMapDetail(id));
    }

    /**
     * 获取可用地图列表
     */
    @GetMapping("/available")
    public ApiResponse<List<TdMap>> getAvailableMaps() {
        return success(tdMapService.getAvailableMaps());
    }

    /**
     * 保存地图（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @PostMapping("/save")
    public ApiResponse<TdMap> save(@Valid @RequestBody TdMapSaveRequest request) {
        return success(tdMapService.saveMap(request));
    }

    /**
     * 删除地图（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tdMapService.deleteMap(id);
        return success();
    }
}
