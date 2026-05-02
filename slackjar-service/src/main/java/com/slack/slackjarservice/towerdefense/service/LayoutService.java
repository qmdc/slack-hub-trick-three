package com.slack.slackjarservice.towerdefense.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdGameRecord;
import com.slack.slackjarservice.towerdefense.entity.TdLayout;
import com.slack.slackjarservice.towerdefense.model.request.*;
import com.slack.slackjarservice.towerdefense.model.response.*;

import java.util.List;

/**
 * 布局服务接口
 *
 * @author zhn
 */
public interface LayoutService extends IService<TdLayout> {

    SaveLayoutResponse saveLayout(SaveLayoutRequest request, Long userId);

    ImportLayoutResponse importLayout(ImportLayoutRequest request, Long userId);

    TdLayout getLayoutById(Long id);

    List<TdLayout> getUserLayouts(Long userId);

    void deleteLayout(Long id, Long userId);
}
