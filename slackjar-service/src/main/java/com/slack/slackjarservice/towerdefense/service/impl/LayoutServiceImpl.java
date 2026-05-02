package com.slack.slackjarservice.towerdefense.service.impl;

import cn.hutool.core.util.IdUtil;
import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.towerdefense.dao.TdLayoutDao;
import com.slack.slackjarservice.towerdefense.entity.TdLayout;
import com.slack.slackjarservice.towerdefense.model.request.ImportLayoutRequest;
import com.slack.slackjarservice.towerdefense.model.request.SaveLayoutRequest;
import com.slack.slackjarservice.towerdefense.model.response.ImportLayoutResponse;
import com.slack.slackjarservice.towerdefense.model.response.SaveLayoutResponse;
import com.slack.slackjarservice.towerdefense.service.LayoutService;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 布局服务实现类
 *
 * @author zhn
 */
@Service("layoutService")
public class LayoutServiceImpl extends ServiceImpl<TdLayoutDao, TdLayout> implements LayoutService {

    @Override
    public SaveLayoutResponse saveLayout(SaveLayoutRequest request, Long userId) {
        SaveLayoutResponse response = new SaveLayoutResponse();

        TdLayout layout = new TdLayout();
        layout.setUserId(userId);
        layout.setMapId(request.getMapId());
        layout.setName(request.getName());
        layout.setLayoutData(request.getLayoutData());
        layout.setShareCode(generateShareCode());
        layout.setDownloadCount(0);
        layout.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : 0);
        layout.setStatus(EnableStatusEnum.ENABLE.getCode());

        this.save(layout);

        response.setSuccess(true);
        response.setMessage("保存成功");
        response.setLayoutId(layout.getId());
        response.setShareCode(layout.getShareCode());

        return response;
    }

    @Override
    public ImportLayoutResponse importLayout(ImportLayoutRequest request, Long userId) {
        ImportLayoutResponse response = new ImportLayoutResponse();

        List<TdLayout> layouts = this.list(
                new LambdaQueryWrapper<TdLayout>()
                        .eq(TdLayout::getShareCode, request.getShareCode())
                        .eq(TdLayout::getIsPublic, 1)
                        .eq(TdLayout::getStatus, EnableStatusEnum.ENABLE.getCode())
        );

        if (CollectionUtils.isEmpty(layouts)) {
            response.setSuccess(false);
            response.setMessage("布局不存在或不是公开布局");
            return response;
        }

        TdLayout sourceLayout = layouts.get(0);

        TdLayout newLayout = new TdLayout();
        newLayout.setUserId(userId);
        newLayout.setMapId(sourceLayout.getMapId());
        newLayout.setName("导入-" + sourceLayout.getName());
        newLayout.setLayoutData(sourceLayout.getLayoutData());
        newLayout.setShareCode(generateShareCode());
        newLayout.setDownloadCount(0);
        newLayout.setIsPublic(0);
        newLayout.setStatus(EnableStatusEnum.ENABLE.getCode());

        this.save(newLayout);

        sourceLayout.setDownloadCount(sourceLayout.getDownloadCount() + 1);
        this.updateById(sourceLayout);

        response.setSuccess(true);
        response.setMessage("导入成功");
        response.setLayoutId(newLayout.getId());
        response.setLayoutName(newLayout.getName());
        response.setMapId(newLayout.getMapId());
        response.setLayoutData(newLayout.getLayoutData());

        try {
            List<ImportLayoutResponse.TowerPlacement> placements = new ArrayList<>();
            com.alibaba.fastjson2.JSONArray towerArray = JSON.parseArray(newLayout.getLayoutData());
            if (towerArray != null) {
                for (int i = 0; i < towerArray.size(); i++) {
                    com.alibaba.fastjson2.JSONObject towerObj = towerArray.getJSONObject(i);
                    ImportLayoutResponse.TowerPlacement placement = new ImportLayoutResponse.TowerPlacement();
                    placement.setTowerId(towerObj.getLong("towerId"));
                    placement.setGridX(towerObj.getInteger("gridX"));
                    placement.setGridY(towerObj.getInteger("gridY"));
                    placement.setLevel(towerObj.getInteger("level") == null ? 1 : towerObj.getInteger("level"));
                    placements.add(placement);
                }
            }
            response.setTowerPlacements(placements);
        } catch (Exception e) {
            // 解析失败则忽略
        }

        return response;
    }

    @Override
    public TdLayout getLayoutById(Long id) {
        return this.getById(id);
    }

    @Override
    public List<TdLayout> getUserLayouts(Long userId) {
        return this.list(
                new LambdaQueryWrapper<TdLayout>()
                        .eq(TdLayout::getUserId, userId)
                        .eq(TdLayout::getStatus, EnableStatusEnum.ENABLE.getCode())
                        .orderByDesc(TdLayout::getCreateTime)
        );
    }

    @Override
    public void deleteLayout(Long id, Long userId) {
        TdLayout layout = this.getById(id);
        AssertUtil.notNull(layout, ResponseEnum.DATA_NOT_EXISTS);
        AssertUtil.isTrue(Objects.equals(layout.getUserId(), userId), ResponseEnum.NO_PERMISSION);

        this.removeById(id);
    }

    private String generateShareCode() {
        return IdUtil.simpleUUID().substring(0, 8).toUpperCase();
    }
}
