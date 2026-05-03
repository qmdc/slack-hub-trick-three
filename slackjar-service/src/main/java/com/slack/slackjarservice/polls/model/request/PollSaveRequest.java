package com.slack.slackjarservice.polls.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class PollSaveRequest {

    private Long id;

    @NotBlank(message = "标题不能为空")
    @Size(max = 500, message = "标题长度不能超过500个字符")
    private String title;

    @Size(max = 2000, message = "描述长度不能超过2000个字符")
    private String description;

    private Integer status;

    private Long deadline;

    @NotEmpty(message = "至少需要一个问题")
    @Valid
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {
        private Long id;

        @NotBlank(message = "问题内容不能为空")
        @Size(max = 1000, message = "问题内容长度不能超过1000个字符")
        private String questionText;

        private Integer questionType;

        private Integer sortOrder;

        private Integer isRequired;

        @NotEmpty(message = "每个问题至少需要一个选项")
        @Valid
        private List<OptionRequest> options;
    }

    @Data
    public static class OptionRequest {
        private Long id;

        @NotBlank(message = "选项内容不能为空")
        @Size(max = 500, message = "选项内容长度不能超过500个字符")
        private String optionText;

        private Integer sortOrder;
    }
}