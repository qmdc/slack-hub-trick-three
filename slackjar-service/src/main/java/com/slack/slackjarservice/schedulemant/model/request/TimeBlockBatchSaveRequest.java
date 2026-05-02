package com.slack.slackjarservice.schedulemant.model.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 时间块批量保存请求（从模板创建）
 *
 * @author zhn
 */
@Data
public class TimeBlockBatchSaveRequest {

    @NotEmpty(message = "时间块列表不能为空")
    private List<TimeBlockSaveRequest> timeBlocks;

    private Long targetDate;
}
