package com.slack.slackjarservice.polls.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.exception.BusinessException;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.foundation.entity.SysUser;
import com.slack.slackjarservice.foundation.service.SysUserService;
import com.slack.slackjarservice.polls.dao.PollOptionDao;
import com.slack.slackjarservice.polls.dao.PollQuestionDao;
import com.slack.slackjarservice.polls.dao.PollSurveyDao;
import com.slack.slackjarservice.polls.dao.PollVoteRecordDao;
import com.slack.slackjarservice.polls.entity.PollOption;
import com.slack.slackjarservice.polls.entity.PollQuestion;
import com.slack.slackjarservice.polls.entity.PollSurvey;
import com.slack.slackjarservice.polls.entity.PollVoteRecord;
import com.slack.slackjarservice.polls.model.request.PollPageQuery;
import com.slack.slackjarservice.polls.model.request.PollSaveRequest;
import com.slack.slackjarservice.polls.model.request.PollVoteRequest;
import com.slack.slackjarservice.polls.model.response.PollDetailResponse;
import com.slack.slackjarservice.polls.model.response.PollStatisticsResponse;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PollSurveyServiceImpl extends ServiceImpl<PollSurveyDao, PollSurvey> implements com.slack.slackjarservice.polls.service.PollSurveyService {

    @Resource
    private PollQuestionDao pollQuestionDao;

    @Resource
    private PollOptionDao pollOptionDao;

    @Resource
    private PollVoteRecordDao pollVoteRecordDao;

    @Resource
    private SysUserService sysUserService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PollDetailResponse savePoll(PollSaveRequest request, Long userId) {
        PollSurvey survey;
        if (request.getId() != null) {
            survey = getById(request.getId());
            if (survey == null) {
                throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
            }
        } else {
            survey = new PollSurvey();
            survey.setShareCode(generateShareCode());
            survey.setStatus(1);
            survey.setTotalVotes(0);
            survey.setCreatedBy(userId);
        }

        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setDeadline(request.getDeadline());
        if (request.getStatus() != null) {
            survey.setStatus(request.getStatus());
        }
        save(survey);

        List<PollQuestion> existingQuestions = pollQuestionDao.selectBySurveyId(survey.getId());
        Set<Long> existingQuestionIds = existingQuestions.stream()
                .map(PollQuestion::getId)
                .collect(Collectors.toSet());

        int sortOrder = 0;
        for (PollSaveRequest.QuestionRequest qReq : request.getQuestions()) {
            PollQuestion question;
            if (qReq.getId() != null && existingQuestionIds.contains(qReq.getId())) {
                question = pollQuestionDao.selectById(qReq.getId());
            } else {
                question = new PollQuestion();
                question.setSurveyId(survey.getId());
            }

            question.setQuestionText(qReq.getQuestionText());
            question.setQuestionType(qReq.getQuestionType() != null ? qReq.getQuestionType() : 1);
            question.setSortOrder(sortOrder++);
            question.setIsRequired(qReq.getIsRequired() != null ? qReq.getIsRequired() : 1);
            pollQuestionDao.insertOrUpdate(question);

            List<PollOption> existingOptions = pollOptionDao.selectByQuestionId(question.getId());
            Set<Long> existingOptionIds = existingOptions.stream()
                    .map(PollOption::getId)
                    .collect(Collectors.toSet());

            int optionSortOrder = 0;
            for (PollSaveRequest.OptionRequest oReq : qReq.getOptions()) {
                PollOption option;
                if (oReq.getId() != null && existingOptionIds.contains(oReq.getId())) {
                    option = pollOptionDao.selectById(oReq.getId());
                } else {
                    option = new PollOption();
                    option.setQuestionId(question.getId());
                    option.setVoteCount(0);
                }
                option.setOptionText(oReq.getOptionText());
                option.setSortOrder(optionSortOrder++);
                pollOptionDao.insertOrUpdate(option);
            }
        }

        return getByIdWithDetail(survey.getId());
    }

    @Override
    public PollDetailResponse getByIdWithDetail(Long id) {
        PollSurvey survey = getById(id);
        if (survey == null) {
            throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
        }
        return buildDetailResponse(survey);
    }

    @Override
    public PollDetailResponse getByShareCode(String shareCode) {
        PollSurvey survey = getBaseMapper().selectByShareCode(shareCode);
        if (survey == null) {
            throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
        }
        return buildDetailResponse(survey);
    }

    @Override
    public IPage<PollSurvey> pageQuery(PollPageQuery query) {
        LambdaQueryWrapper<PollSurvey> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(query.getTitle())) {
            wrapper.like(PollSurvey::getTitle, query.getTitle());
        }
        if (query.getStatus() != null) {
            wrapper.eq(PollSurvey::getStatus, query.getStatus());
        }
        if (query.getCreatedBy() != null) {
            wrapper.eq(PollSurvey::getCreatedBy, query.getCreatedBy());
        }
        wrapper.orderByDesc(PollSurvey::getCreateTime);
        return page(new Page<>(query.getPageNo(), query.getPageSize()), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(Long id) {
        PollSurvey survey = getById(id);
        if (survey == null) {
            throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
        }

        pollOptionDao.deleteBySurveyId(id);
        pollQuestionDao.deleteBySurveyId(id);
        return super.removeById(id);
    }

    @Override
    public boolean updateStatus(Long id, Integer status) {
        PollSurvey survey = getById(id);
        if (survey == null) {
            throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
        }
        survey.setStatus(status);
        return updateById(survey);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitVote(PollVoteRequest request, String ipAddress) {
        Long surveyId = request.getSurveyId();
        String shareCode = request.getShareCode();

        PollSurvey survey;
        if (surveyId != null) {
            survey = getById(surveyId);
        } else if (StringUtils.isNotBlank(shareCode)) {
            survey = getBaseMapper().selectByShareCode(shareCode);
        } else {
            throw new BusinessException(ResponseEnum.PARAM_ERROR);
        }

        if (survey == null) {
            throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
        }

        if (survey.getStatus() != 1) {
            throw new BusinessException(ResponseEnum.POLL_CLOSED);
        }

        long now = System.currentTimeMillis();
        if (survey.getDeadline() != null && now > survey.getDeadline()) {
            throw new BusinessException(ResponseEnum.POLL_EXPIRED);
        }

        String voterId = request.getVoterId();
        if (StringUtils.isBlank(voterId)) {
            voterId = UUID.randomUUID().toString();
        }

        int existingVoteCount = pollVoteRecordDao.countBySurveyAndVoter(survey.getId(), voterId);
        if (existingVoteCount > 0) {
            throw new BusinessException(ResponseEnum.POLL_ALREADY_VOTED);
        }

        List<PollQuestion> questions = pollQuestionDao.selectBySurveyId(survey.getId());
        Map<Long, PollQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(PollQuestion::getId, q -> q));

        for (PollVoteRequest.VoteOption voteOption : request.getVotes()) {
            Long questionId = voteOption.getQuestionId();
            PollQuestion question = questionMap.get(questionId);
            if (question == null) {
                continue;
            }

            List<Long> optionIds = voteOption.getOptionIds();
            if (optionIds == null || optionIds.isEmpty()) {
                if (question.getIsRequired() == 1) {
                    throw new BusinessException(ResponseEnum.PARAM_ERROR.getCode(), "问题" + question.getQuestionText() + "为必填项");
                }
                continue;
            }

            if (question.getQuestionType() == 1 && optionIds.size() > 1) {
                throw new BusinessException(ResponseEnum.PARAM_ERROR.getCode(), "单选题只能选择一个选项");
            }

            for (Long optionId : optionIds) {
                PollOption option = pollOptionDao.selectById(optionId);
                if (option != null && option.getQuestionId().equals(questionId)) {
                    pollOptionDao.incrementVoteCount(optionId);

                    PollVoteRecord record = new PollVoteRecord();
                    record.setSurveyId(survey.getId());
                    record.setQuestionId(questionId);
                    record.setOptionId(optionId);
                    record.setVoterId(voterId);
                    record.setVoterIp(ipAddress);
                    record.setVoteTime(now);
                    pollVoteRecordDao.insert(record);
                }
            }
        }

        getBaseMapper().incrementVoteCount(survey.getId());
    }

    @Override
    public PollStatisticsResponse getStatistics(Long id) {
        PollSurvey survey = getById(id);
        if (survey == null) {
            throw new BusinessException(ResponseEnum.DATA_NOT_FOUND);
        }

        List<PollQuestion> questions = pollQuestionDao.selectBySurveyId(id);
        List<PollStatisticsResponse.QuestionStatistics> questionStatsList = new ArrayList<>();

        for (PollQuestion question : questions) {
            List<PollOption> options = pollOptionDao.selectByQuestionId(question.getId());

            int totalVotes = options.stream().mapToInt(PollOption::getVoteCount).sum();

            List<PollStatisticsResponse.OptionStatistics> optionStatsList = new ArrayList<>();
            for (PollOption option : options) {
                PollStatisticsResponse.OptionStatistics optionStats = new PollStatisticsResponse.OptionStatistics();
                optionStats.setOptionId(option.getId());
                optionStats.setOptionText(option.getOptionText());
                optionStats.setVoteCount(option.getVoteCount());
                optionStats.setPercentage(totalVotes > 0 ? (option.getVoteCount() * 100.0 / totalVotes) : 0);
                optionStatsList.add(optionStats);
            }

            PollStatisticsResponse.QuestionStatistics questionStats = new PollStatisticsResponse.QuestionStatistics();
            questionStats.setQuestionId(question.getId());
            questionStats.setQuestionText(question.getQuestionText());
            questionStats.setQuestionType(question.getQuestionType());
            questionStats.setQuestionTypeName(question.getQuestionType() == 1 ? "单选" : "多选");
            questionStats.setTotalVotes(totalVotes);
            questionStats.setOptionStatistics(optionStatsList);
            questionStatsList.add(questionStats);
        }

        PollStatisticsResponse response = new PollStatisticsResponse();
        response.setSurveyId(id);
        response.setTitle(survey.getTitle());
        response.setTotalVotes(survey.getTotalVotes());
        response.setStartTime(survey.getCreateTime());
        response.setDeadline(survey.getDeadline());
        response.setIsExpired(survey.getDeadline() != null && System.currentTimeMillis() > survey.getDeadline());
        response.setQuestionStatistics(questionStatsList);
        return response;
    }

    private PollDetailResponse buildDetailResponse(PollSurvey survey) {
        PollDetailResponse response = new PollDetailResponse();
        response.setId(survey.getId());
        response.setTitle(survey.getTitle());
        response.setDescription(survey.getDescription());
        response.setStatus(survey.getStatus());
        response.setDeadline(survey.getDeadline());
        response.setShareCode(survey.getShareCode());
        response.setShareUrl("http://localhost:8028/slack/polls/share/" + survey.getShareCode());
        response.setTotalVotes(survey.getTotalVotes());
        response.setCreatedBy(survey.getCreatedBy());
        response.setCreateTime(survey.getCreateTime());
        response.setUpdateTime(survey.getUpdateTime());

        if (survey.getCreatedBy() != null) {
            try {
                SysUser user = sysUserService.getById(survey.getCreatedBy());
                if (user != null) {
                    response.setCreatedByNickname(user.getNickname() != null ? user.getNickname() : user.getUsername());
                }
            } catch (Exception e) {
                log.warn("Failed to get user info for creator {}", survey.getCreatedBy());
            }
        }

        List<PollQuestion> questions = pollQuestionDao.selectBySurveyId(survey.getId());
        List<PollDetailResponse.QuestionDetail> questionDetails = new ArrayList<>();

        for (PollQuestion question : questions) {
            List<PollOption> options = pollOptionDao.selectByQuestionId(question.getId());
            int totalVotes = options.stream().mapToInt(PollOption::getVoteCount).sum();

            List<PollDetailResponse.OptionDetail> optionDetails = new ArrayList<>();
            for (PollOption option : options) {
                PollDetailResponse.OptionDetail optionDetail = new PollDetailResponse.OptionDetail();
                optionDetail.setId(option.getId());
                optionDetail.setOptionText(option.getOptionText());
                optionDetail.setVoteCount(option.getVoteCount());
                optionDetail.setSortOrder(option.getSortOrder());
                optionDetail.setPercentage(totalVotes > 0 ? (option.getVoteCount() * 100.0 / totalVotes) : 0);
                optionDetails.add(optionDetail);
            }

            PollDetailResponse.QuestionDetail questionDetail = new PollDetailResponse.QuestionDetail();
            questionDetail.setId(question.getId());
            questionDetail.setQuestionText(question.getQuestionText());
            questionDetail.setQuestionType(question.getQuestionType());
            questionDetail.setQuestionTypeName(question.getQuestionType() == 1 ? "单选" : "多选");
            questionDetail.setSortOrder(question.getSortOrder());
            questionDetail.setIsRequired(question.getIsRequired());
            questionDetail.setOptions(optionDetails);
            questionDetails.add(questionDetail);
        }

        response.setQuestions(questionDetails);
        return response;
    }

    private String generateShareCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        } while (getBaseMapper().selectByShareCode(code) != null);
        return code;
    }
}