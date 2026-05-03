package com.slack.slackjarservice.polls.model.response;

import lombok.Data;

import java.util.List;

@Data
public class PollDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Integer status;
    private Long deadline;
    private String shareCode;
    private String shareUrl;
    private Integer totalVotes;
    private Long createdBy;
    private String createdByNickname;
    private Long createTime;
    private Long updateTime;
    private List<QuestionDetail> questions;

    @Data
    public static class QuestionDetail {
        private Long id;
        private String questionText;
        private Integer questionType;
        private String questionTypeName;
        private Integer sortOrder;
        private Integer isRequired;
        private List<OptionDetail> options;
    }

    @Data
    public static class OptionDetail {
        private Long id;
        private String optionText;
        private Integer voteCount;
        private Integer sortOrder;
        private Double percentage;
    }
}