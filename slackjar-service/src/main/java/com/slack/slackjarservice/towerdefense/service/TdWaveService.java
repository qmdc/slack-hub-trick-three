package com.slack.slackjarservice.towerdefense.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdWave;
import com.slack.slackjarservice.towerdefense.model.request.TdWavePageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdWaveSaveRequest;

import java.util.List;

/**
 * 波次配置服务接口
 *
 * @author zhn
 */
public interface TdWaveService extends IService<TdWave> {

    PageResult<TdWave> pageQuery(TdWavePageQuery query);

    TdWave saveWave(TdWaveSaveRequest request);

    void deleteWave(Long id);

    TdWave getWaveDetail(Long id);

    List<TdWave> getWavesByMapId(Long mapId);
}
