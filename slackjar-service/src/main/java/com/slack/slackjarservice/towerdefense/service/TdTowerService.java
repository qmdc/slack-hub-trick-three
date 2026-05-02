package com.slack.slackjarservice.towerdefense.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdTower;
import com.slack.slackjarservice.towerdefense.model.request.TdTowerPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdTowerSaveRequest;

import java.util.List;

/**
 * 塔配置服务接口
 *
 * @author zhn
 */
public interface TdTowerService extends IService<TdTower> {

    PageResult<TdTower> pageQuery(TdTowerPageQuery query);

    TdTower saveTower(TdTowerSaveRequest request);

    void deleteTower(Long id);

    TdTower getTowerDetail(Long id);

    List<TdTower> getAvailableTowers(Integer currentWave);
}
