package com.slack.slackjarservice.polls.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PollVoteRequest {

    private Long surveyId;

    private String shareCode;

    private String voterId;

    @NotEmpty(message = "至少需要一个投票选项")
    @Valid
    private List<VoteOption> votes;

    @Data
    public static class VoteOption {
        private Long questionId;
        private List<Long> optionIds;
    }
}