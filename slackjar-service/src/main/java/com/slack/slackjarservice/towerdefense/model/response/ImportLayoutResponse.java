package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;
import java.util.List;

/**
 * 导入布局响应
 *
 * @author zhn
 */
@Data
public class ImportLayoutResponse {

    private Boolean success;

    private String message;

    private Long layoutId;

    private String layoutName;

    private Long mapId;

    private String layoutData;

    private List<TowerPlacement> towerPlacements;

    @Data
    public static class TowerPlacement {
        private Long towerId;
        private Integer gridX;
        private Integer gridY;
        private Integer level;
    }
}
