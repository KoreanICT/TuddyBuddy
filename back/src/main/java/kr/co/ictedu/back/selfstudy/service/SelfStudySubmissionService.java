package kr.co.ictedu.back.selfstudy.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.dto.QuizResponseDto;
import kr.co.ictedu.back.selfstudy.dto.QuizSubmitRequestDto;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
//답안 검증·채점·저장
@Service
@Transactional(readOnly = true)
public class SelfStudySubmissionService {
    private final SelfStudyDao selfStudyDao;

    public SelfStudySubmissionService(SelfStudyDao selfStudyDao) {
        this.selfStudyDao = selfStudyDao;
    }
    @Transactional
    public SelfStudyResultVO submitQuiz(
            QuizSubmitRequestDto request
    ) {

        if (request == null) {

            throw new IllegalArgumentException("제출 정보가 없습니다.");
        }

        if (request.getQuiz_sessionid() == null) {
        	throw new IllegalArgumentException("퀴즈 세션 정보가 없습니다.");
        }

        if (request.getMember_num() == null) {
            throw new IllegalArgumentException("회원 정보가 없습니다.");
        }

        Long quizTimeSeconds = request.getQuiz_time_seconds();
        if (quizTimeSeconds != null && (quizTimeSeconds < 0 || quizTimeSeconds > 14_400)) {
            throw new IllegalArgumentException("문제 풀이 시간은 0~240분 범위여야 합니다.");
        }

        if (request.getResponses() == null|| request.getResponses().isEmpty()) {
            throw new IllegalArgumentException("제출할 답안이 없습니다.");
        }

        // 세션 확인
        QuizSessionVO session =
                selfStudyDao.selectQuizSession(
                        request.getQuiz_sessionid());
        if (session == null) {
            throw new IllegalArgumentException("존재하지 않는 퀴즈 세션입니다.");
        }
        if (!Objects.equals(session.getMember_num(), request.getMember_num())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "본인의 학습 세션만 사용할 수 있습니다.");
        }

        var expectedQuizzes =
                selfStudyDao.selectQuizzes(
                        request.getQuiz_sessionid());
        Map<Long, QuizVO> quizzesById = new HashMap<>();
        expectedQuizzes.forEach(quiz ->
                quizzesById.putIfAbsent(quiz.getQuiz_id(), quiz));
        var answerIds = new HashSet<Long>();

        for (var answer : request.getResponses()) {

            if (answer == null
                    || answer.getQuiz_id() == null
                    || !answerIds.add(answer.getQuiz_id())
                    || answer.getQuiz_user_response() == null
                    || answer.getQuiz_user_response().isBlank()
                    || answer.getQuiz_user_response().length() > 1000) {

                throw new IllegalArgumentException("답안이 누락되거나 중복되었습니다.");
            }
        }

        var expectedIds = expectedQuizzes.stream()
                .map(QuizVO::getQuiz_id)
                .collect(Collectors.toSet());

        if (!answerIds.equals(expectedIds)) {
            throw new IllegalArgumentException("세션의 모든 문제에 답해주세요.");
        }

        // 채점
        int correctCount = 0;
        var responses = new ArrayList<QuizResponseVO>(request.getResponses().size());
        for (QuizResponseDto answer : request.getResponses()) {
            QuizVO quiz = quizzesById.get(answer.getQuiz_id());
            if (quiz == null) {
                throw new IllegalArgumentException("존재하지 않는 문제입니다. quizId="+ answer.getQuiz_id());
            }
            if (!quiz.getQuiz_session_id().equals(
                    request.getQuiz_sessionid()
            )) {
            	throw new IllegalArgumentException("해당 학습 세션의 문제가 아닙니다.");
            }

            boolean correct =
                    quiz.getQuiz_correct_answer() != null
                    && answer.getQuiz_user_response() != null
                    && quiz.getQuiz_correct_answer()
                            .trim()
                            .equalsIgnoreCase(
                                    answer.getQuiz_user_response().trim());
            if (correct) {
                correctCount++;
            }

            QuizResponseVO response = new QuizResponseVO();
            response.setQuiz_id(answer.getQuiz_id());
            response.setQuiz_user_response(answer.getQuiz_user_response());
            response.setQuiz_correct(correct ? "Y" : "N");
            responses.add(response);
        }

        // 점수 계산
        int totalQuestion = request.getResponses().size();
        int totalScore = (int) Math.round(
                correctCount * 100.0 / totalQuestion);

        // 학습 결과 저장
        SelfStudyResultVO result = new SelfStudyResultVO();
        result.setQuiz_session_id(
                request.getQuiz_sessionid());

        result.setMember_num(
                request.getMember_num());

        result.setSelfstudy_total_score(totalScore);
        result.setQuiz_time_seconds(quizTimeSeconds == null ? 0L : quizTimeSeconds);

        int insertResult =
                selfStudyDao.insertSelfStudyResult(result);

        if (insertResult != 1) {
            throw new IllegalStateException("학습 결과 저장에 실패했습니다.");
        }

        // 답안을 채점하면서 VO로 구성한 뒤 한 번의 Oracle PL/SQL 호출로 저장합니다.
        responses.forEach(response ->
                response.setSelfstudy_results_id(result.getSelfstudy_results_id()));
        selfStudyDao.insertQuizResponses(responses);

        return result;
    }
}
