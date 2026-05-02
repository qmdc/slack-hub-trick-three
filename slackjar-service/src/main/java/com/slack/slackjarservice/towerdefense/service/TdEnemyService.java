package com.slack.slackjarservice.towerdefense.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdEnemy;
import com.slack.slackjarservice.towerdefense.model.request.TdEnemyPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdEnemySaveRequest;

import java.util.List;

/**
 * 敌人配置服务接口
 *
 * @author zhn
 */
public interface TdEnemyService extends IService<TdEnemy> {

    PageResult<TdEnemy> pageQuery(TdEnemyPageQuery query);

    TdEnemy saveEnemy(TdEnemySaveRequest request);

    void deleteEnemy(Long id);

    TdEnemy getEnemyDetail(Long id);

    List<TdEnemy> getAvailableEnemies();
}
