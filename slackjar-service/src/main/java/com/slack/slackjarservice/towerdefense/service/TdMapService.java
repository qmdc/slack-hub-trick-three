package com.slack.slackjarservice.towerdefense.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdMap;
import com.slack.slackjarservice.towerdefense.model.request.TdMapPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdMapSaveRequest;

import java.util.List;

/**
 * 地图配置服务接口
 *
 * @author zhn
 */
public interface TdMapService extends IService<TdMap> {

    PageResult<TdMap> pageQuery(TdMapPageQuery query);

    TdMap saveMap(TdMapSaveRequest request);

    void deleteMap(Long id);

    TdMap getMapDetail(Long id);

    List<TdMap> getAvailableMaps();
}
