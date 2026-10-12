package kr.co.ictedu.back.selfstudy.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.dto.QuizResponseDto;
import kr.co.ictedu.back.selfstudy.dto.QuizSubmitRequestDto;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;
import kr.co.ictedu.back.selfstudy.dto.QuizGenerateRequestDto;

@Service
@Transactional(readOnly = true)
public class SelfStudyService {

    private final SelfStudyDao selfStudyDao;
    private final QuizAiClient aiClient;
    private final org.springframework.transaction.support.TransactionTemplate transactions;
    private final tools.jackson.databind.json.JsonMapper json = tools.jackson.databind.json.JsonMapper.builder().build();
    private final java.nio.file.Path imageDirectory;

    public SelfStudyService(SelfStudyDao selfStudyDao, QuizAiClient aiClient,
            org.springframework.transaction.PlatformTransactionManager transactionManager,
            @org.springframework.beans.factory.annotation.Value("${quiz.image.directory:./upload/quiz}") String directory) {
        this.selfStudyDao = selfStudyDao;
        this.aiClient = aiClient;
        this.transactions = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        this.imageDirectory = java.nio.file.Path.of(directory).toAbsolutePath().normalize();
    }

    // AI HTTP 호출 동안 DB 트랜잭션을 유지하지 않음. 저장 부분만 원자적으로 처리.
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public kr.co.ictedu.back.selfstudy.dto.QuizGenerateResponseDto generateQuiz(QuizGenerateRequestDto request) {
        if (request.getSubject_id() == null || request.getSubject_id() <= 0 || request.getMember_num() == null)
            throw new IllegalArgumentException("과목과 로그인 정보가 필요합니다.");
        if (!java.util.Set.of("MULTIPLE_CHOICE", "SHORT_ANSWER", "OX").contains(java.util.Objects.toString(request.getQuiz_type(), ""))
                || !java.util.Set.of("EASY", "MEDIUM", "HARD").contains(java.util.Objects.toString(request.getQuiz_difficulty(), "")))
            throw new IllegalArgumentException("문제 유형 또는 난이도가 올바르지 않습니다.");
        if (request.getQuiz_count() == null || request.getQuiz_count() < 1 || request.getQuiz_count() > 10)
            throw new IllegalArgumentException("문항 수는 1~10개여야 합니다.");
        if (request.getQuiz_prompt() != null && request.getQuiz_prompt().length() > 1000)
            throw new IllegalArgumentException("추가 요청사항은 1000자 이내로 입력해주세요.");
        var file = request.getFile();
        if (file == null || file.isEmpty() || file.getSize() > 10 * 1024 * 1024
                || !java.util.Set.of("image/jpeg", "image/png", "image/webp").contains(java.util.Objects.toString(file.getContentType(), "")))
            throw new IllegalArgumentException("10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.");
        if (selfStudyDao.selectSubject(request.getSubject_id()) == null) {
            throw new IllegalArgumentException("존재하지 않는 과목입니다.");
        }
        byte[] bytes;
        try { bytes = file.getBytes(); }
        catch (java.io.IOException e) { throw new IllegalStateException("이미지를 읽지 못했습니다.", e); }
        var generated = aiClient.generate(request, bytes);
        String extension = switch (file.getContentType()) { case "image/jpeg" -> ".jpg"; case "image/png" -> ".png"; default -> ".webp"; };
        String filename = java.util.UUID.randomUUID() + extension;
        var path = imageDirectory.resolve(filename);
        try {
            java.nio.file.Files.createDirectories(imageDirectory);
            java.nio.file.Files.write(path, bytes);
            return transactions.execute(status -> {
                var session = new QuizSessionVO();
                session.setSubject_id(request.getSubject_id());
                session.setMember_num(request.getMember_num());
                session.setQuiz_image_url("/quiz-images/" + filename);
                session.setQuiz_type(request.getQuiz_type());
                session.setQuiz_difficulty(request.getQuiz_difficulty());
                session.setQuiz_count(request.getQuiz_count());
                session.setQuiz_prompt(request.getQuiz_prompt());
                if (selfStudyDao.insertQuizSession(session) != 1) throw new IllegalStateException("세션 저장 실패");
                var items = new java.util.ArrayList<kr.co.ictedu.back.selfstudy.dto.QuizGenerateResponseDto.QuizItem>();
                for (var q : generated.quizzes()) {
                    var quiz = new QuizVO();
                    quiz.setQuiz_session_id(session.getQuiz_session_id());
                    quiz.setQuiz_question(q.quizQuestion());
                    quiz.setQuiz_selections(json.writeValueAsString(q.quizSelections()));
                    quiz.setQuiz_correct_answer(q.quizCorrectAnswer());
                    quiz.setQuiz_explanation(q.quizExplanation());
                    if (selfStudyDao.insertQuiz(quiz) != 1) throw new IllegalStateException("문제 저장 실패");
                    items.add(new kr.co.ictedu.back.selfstudy.dto.QuizGenerateResponseDto.QuizItem(
                        quiz.getQuiz_id(), session.getQuiz_session_id(), q.quizQuestion(), q.quizSelections(), q.quizCorrectAnswer(), q.quizExplanation()));
                }
                return new kr.co.ictedu.back.selfstudy.dto.QuizGenerateResponseDto(session.getQuiz_session_id(), items);
            });
        } catch (java.io.IOException | RuntimeException e) {
            try { java.nio.file.Files.deleteIfExists(path); } catch (java.io.IOException cleanup) { e.addSuppressed(cleanup); }
            throw new IllegalStateException("문제 저장에 실패했습니다.", e);
        }
    }
    public void requireSessionOwner(Long sessionId, Long memberNum) {
        if (!java.util.Objects.equals(getSession(sessionId).getMember_num(), memberNum))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "본인의 학습 세션만 사용할 수 있습니다.");
    }
    public void requireResultOwner(Long resultId, Long memberNum) {
        if (!java.util.Objects.equals(getResult(resultId).getMember_num(), memberNum))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "본인의 학습 결과만 사용할 수 있습니다.");
    }

    // Category 조회
    public List<CategoryVO> getCategories() {
        return selfStudyDao.selectCategories();
    }

    // Subject 조회
    public List<SubjectVO> getSubjects(Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException(
                    "카테고리 정보가 없습니다."
            );
        }
        return selfStudyDao.selectSubjects(categoryId);
    }

    // QuizSession 저장
    @Transactional
    public QuizSessionVO saveQuizSession(
            QuizSessionVO session) {

        if (session == null) {
            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        if (session.getSubject_id() == null) {
            throw new IllegalArgumentException(
                    "과목 정보가 없습니다."
            );
        }

        if (session.getMember_num() == null) {
            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        int result =
                selfStudyDao.insertQuizSession(session);

        if (result != 1) {
            throw new IllegalStateException(
                    "퀴즈 세션 저장에 실패했습니다."
            );
        }
        return session;
    }


    // 문제 저장
    @Transactional
    public QuizVO saveQuiz(QuizVO quiz) {
        if (quiz == null) {
            throw new IllegalArgumentException(
                    "문제 정보가 없습니다."
            );
        }
        if (quiz.getQuiz_session_id() == null) {
            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        int result =
                selfStudyDao.insertQuiz(quiz);

        if (result != 1) {
            throw new IllegalStateException(
                    "문제 저장에 실패했습니다."
            );
        }
        return quiz;
    }


    // 회원별 세션 목록
    public List<QuizSessionVO> getSessions(
            Long memberNum) {
        if (memberNum == null) {
            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }
        return selfStudyDao.selectQuizSessions(
                memberNum
        );
    }

    // 세션 상세
    public QuizSessionVO getSession(
            Long quizSessionId) {
        if (quizSessionId == null) {
            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        QuizSessionVO session =
                selfStudyDao.selectQuizSession(
                        quizSessionId
                );

        if (session == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 학습 세션입니다."
            );
        }
        return session;
    }


    // 세션에 속한 문제 조회
    public List<QuizVO> getQuizzes(
            Long quizSessionId) {
        if (quizSessionId == null) {
            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }
        return selfStudyDao.selectQuizzes(
                quizSessionId
        );
    }

    // 퀴즈 제출, 채점
    @Transactional
    public SelfStudyResultVO submitQuiz(
            QuizSubmitRequestDto request) {

        // 요청 검증
        if (request == null) {
            throw new IllegalArgumentException(
                    "제출 정보가 없습니다."
            );
        }

        if (request.getQuiz_sessionid() == null) {
            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        if (request.getMember_num() == null) {
            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        if (request.getResponses() == null ||
                request.getResponses().isEmpty()) {

            throw new IllegalArgumentException(
                    "제출할 답안이 없습니다."
            );
        }

        // 세션 존재 확인
        QuizSessionVO session =
                selfStudyDao.selectQuizSession(
                        request.getQuiz_sessionid()
                );

        if (session == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 퀴즈 세션입니다."
            );
        }

        requireSessionOwner(request.getQuiz_sessionid(), request.getMember_num());
        var expectedQuizzes = selfStudyDao.selectQuizzes(request.getQuiz_sessionid());
        var answerIds = new java.util.HashSet<Long>();
        for (var answer : request.getResponses()) {
            if (answer == null || answer.getQuiz_id() == null || !answerIds.add(answer.getQuiz_id())
                    || answer.getQuiz_user_response() == null || answer.getQuiz_user_response().isBlank()
                    || answer.getQuiz_user_response().length() > 1000)
                throw new IllegalArgumentException("답안이 누락되거나 중복되었습니다.");
        }
        var expectedIds = expectedQuizzes.stream().map(QuizVO::getQuiz_id).collect(java.util.stream.Collectors.toSet());
        if (!answerIds.equals(expectedIds)) throw new IllegalArgumentException("세션의 모든 문제에 답해주세요.");

        // 채점
        int correctCount = 0;


        for (QuizResponseDto answer
                : request.getResponses()) {


            QuizVO quiz =
                    selfStudyDao.selectQuiz(
                            answer.getQuiz_id()
                    );

            if (quiz == null) {
                throw new IllegalArgumentException(
                        "존재하지 않는 문제입니다. quizId="
                                + answer.getQuiz_id()
                );
            }

            // 해당 세션의 문제인지 확인
            if (!quiz.getQuiz_session_id()
                    .equals(request.getQuiz_sessionid())) {

                throw new IllegalArgumentException(
                        "해당 학습 세션의 문제가 아닙니다."
                );
            }

            boolean correct =
                    quiz.getQuiz_correct_answer() != null
                    &&
                    answer.getQuiz_user_response() != null
                    &&
                    quiz.getQuiz_correct_answer()
                            .trim().equalsIgnoreCase(
                                    answer.getQuiz_user_response().trim()
                            );

            if (correct) {
                correctCount++;
            }
        }

        // 점수 계산
        int totalQuestion =
                request.getResponses().size();


        int totalScore =
                (int) Math.round(
                        correctCount * 100.0
                                / totalQuestion
                );

        // selfstudy_results 저장
        SelfStudyResultVO result =
                new SelfStudyResultVO();


        result.setQuiz_session_id(
                request.getQuiz_sessionid()
        );

        result.setMember_num(
                request.getMember_num()
        );

        result.setSelfstudy_total_score(
                totalScore
        ); 
        
        int insertResult =
                selfStudyDao.insertSelfStudyResult(
                        result
                );
        if (insertResult != 1) {
            throw new IllegalStateException(
                    "학습 결과 저장에 실패했습니다."
            );
        }

        // 문제별 사용자 답안 저장
        for (QuizResponseDto answer
                : request.getResponses()) {
            QuizVO quiz =
                    selfStudyDao.selectQuiz(
                            answer.getQuiz_id()
                    );
            boolean correct =
                    quiz.getQuiz_correct_answer() != null
                    &&
                    answer.getQuiz_user_response() != null
                    &&
                    quiz.getQuiz_correct_answer()
                            .trim().equalsIgnoreCase(
                                    answer.getQuiz_user_response().trim()
                            );
            QuizResponseVO response =
                    new QuizResponseVO();

            response.setSelfstudy_results_id(
                    result.getSelfstudy_results_id()
            );
            response.setQuiz_id(
                    answer.getQuiz_id()
            );
            response.setQuiz_user_response(
                    answer.getQuiz_user_response()
            );
            response.setQuiz_correct(
                    correct ? "Y" : "N"
            );
            int insertResponse =
                    selfStudyDao.insertQuizResponse(
                            response
                    );
            if (insertResponse != 1) {
                throw new IllegalStateException(
                        "문제 답안 저장에 실패했습니다."
                );
            }
        }
        return result;
    }

    // 회원별 학습 결과 목록
    public List<SelfStudyResultVO> getResults(
            Long memberNum) {
        if (memberNum == null) {
            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        return selfStudyDao.selectResults(
                memberNum
        );
    }

    // 학습 결과 상세
    public SelfStudyResultVO getResult(
            Long resultId) {
        if (resultId == null) {
            throw new IllegalArgumentException(
                    "결과 정보가 없습니다."
            );
        }
        SelfStudyResultVO result =
                selfStudyDao.selectResult(
                        resultId
                );

        if (result == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 결과입니다."
            );
        }
        return result;
    }

    // 결과별 사용자 답안 조회
    public List<QuizResponseVO> getResponses(
            Long resultId) {
        if (resultId == null) {
            throw new IllegalArgumentException(
                    "결과 정보가 없습니다."
            );
        }
        return selfStudyDao.selectQuizResponses(
                resultId
        );
    }

    // 학습 세션 삭제
    @Transactional
    public void deleteSession(
            Long quizSessionId) {
        QuizSessionVO session =
                selfStudyDao.selectQuizSession(
                        quizSessionId
                );
        if (session == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 학습 세션입니다."
            );
        }
        // 1. 사용자 답안
        selfStudyDao.deleteQuizResponsesBySession(
                quizSessionId
        );
        // 2. 학습 결과
        selfStudyDao.deleteResultsBySession(
                quizSessionId
        );
        // 3. 문제
        selfStudyDao.deleteQuizzesBySession(
                quizSessionId
        );
        // 4. 세션
        int deleteResult =
                selfStudyDao.deleteQuizSession(
                        quizSessionId
                );
        if (deleteResult != 1) {
            throw new IllegalStateException(
                    "학습 세션 삭제에 실패했습니다."
            );
        }
    }
}