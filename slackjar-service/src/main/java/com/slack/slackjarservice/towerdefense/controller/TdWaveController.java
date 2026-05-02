package com.slack.slackjarservice.towerdefense.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdWave;
import com.slack.slackjarservice.towerdefense.model.request.TdWavePageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdWaveSaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdWaveService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 波次配置控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/wave")
public class TdWaveController extends BaseController {

    @Resource
    private TdWaveService tdWaveService;

    /**
     * 分页查询波次列表
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<TdWave>> pageQuery(@RequestBody TdWavePageQuery query) {
        return success(tdWaveService.pageQuery(query));
    }

    /**
     * 获取波次详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<TdWave> getDetail(@PathVariable Long id) {
        return success(tdWaveService.getWaveDetail(id));
    }

    /**
     * 获取地图的所有波次
     */
    @GetMapping("/byMap/{mapId}")
    public ApiResponse<List<TdWave>> getWavesByMapId(@PathVariable Long mapId) {
        return success(tdWaveService.getWavesByMapId(mapId));
    }

    /**
     * 保存波次配置（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @PostMapping("/save")
    public ApiResponse<TdWave> save(@Valid @RequestBody TdWaveSaveRequest request) {
        return success(tdWaveService.saveWave(request));
    }

    /**
     * 删除波次配置（管理员权限）
     */
    @SaCheckRole(value = {"ROLE_SUPER_ADMIN"}, mode = cn.dev33.satoken.annotation.SaMode.OR)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tdWaveService.deleteWave(id);
        return success();
    }
}
