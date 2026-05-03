package com.slack.slackjarservice.polls.model.response;

import lombok.Data;

import java.util.List;

@Data
public class PollStatisticsResponse {
    private Long surveyId;
    private String title;
    private Integer totalVotes;
    private Long startTime;
    private Long deadline;
    private Boolean isExpired;
    private List<QuestionStatistics> questionStatistics;

    @Data
    public static class QuestionStatistics {
        private Long questionId;
        private String questionText;
        private Integer questionType;
        private String questionTypeName;
        private Integer totalVotes;
        private List<OptionStatistics> optionStatistics;
    }

    @Data
    public static class OptionStatistics {
        private Long optionId;
        private String optionText;
        private Integer voteCount;
        private Double percentage;
    }
}