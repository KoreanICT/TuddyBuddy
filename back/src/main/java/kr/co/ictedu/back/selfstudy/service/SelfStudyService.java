// 최솔
package kr.co.ictedu.back.selfstudy.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.dto.QuizGenerateRequestDto;
import kr.co.ictedu.back.selfstudy.dto.QuizGenerateResponseDto;
import kr.co.ictedu.back.selfstudy.dto.QuizResponseDto;
import kr.co.ictedu.back.selfstudy.dto.QuizSubmitRequestDto;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;
import tools.jackson.databind.json.JsonMapper;
@Service
@Transactional(readOnly = true)
public class SelfStudyService {

    private final SelfStudyDao selfStudyDao;
    private final QuizAiClient aiClient;
    private final TransactionTemplate transactions;
    private final JsonMapper json;
    private final Path imageDirectory;

    public SelfStudyService(
            SelfStudyDao selfStudyDao,
            QuizAiClient aiClient,
            PlatformTransactionManager transactionManager,
            JsonMapper json,
            @Value("${quiz.image.directory:./upload/quiz}") String directory
    ) {
        this.selfStudyDao = selfStudyDao;
        this.aiClient = aiClient;
        this.transactions =
                new TransactionTemplate(transactionManager);
        this.json = json;
        this.imageDirectory =
                Path.of(directory).toAbsolutePath().normalize();
    }

    // =========================================================
    // 1. AI 문제 생성
    //
    // AI HTTP 호출 중에는 DB 트랜잭션을 유지하지 않습니다.
    // AI 검증 성공 후에만 DB 저장을 시작합니다.
    // DB 저장 중 오류가 발생하면 전체 저장을 롤백합니다.
    // =========================================================

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public QuizGenerateResponseDto generateQuiz(
            QuizGenerateRequestDto request
    ) {

        // -----------------------------------------------------
        // 1-1. 요청 검증
        // -----------------------------------------------------

        if (request == null) {
            throw new IllegalArgumentException(
                    "문제 생성 요청 정보가 없습니다."
            );
        }

        if (request.getSubject_id() == null
                || request.getSubject_id() <= 0
                || request.getMember_num() == null) {

            throw new IllegalArgumentException(
                    "과목과 로그인 정보가 필요합니다."
            );
        }

        if (!Set.of(
                "MULTIPLE_CHOICE",
                "SHORT_ANSWER",
                "OX"
        ).contains(
                Objects.toString(request.getQuiz_type(), "")
        )) {

            throw new IllegalArgumentException(
                    "문제 유형이 올바르지 않습니다."
            );
        }

        if (!Set.of(
                "EASY",
                "MEDIUM",
                "HARD"
        ).contains(
                Objects.toString(request.getQuiz_difficulty(), "")
        )) {

            throw new IllegalArgumentException(
                    "문제 난이도가 올바르지 않습니다."
            );
        }

        if (request.getQuiz_count() == null
                || request.getQuiz_count() < 1
                || request.getQuiz_count() > 10) {

            throw new IllegalArgumentException(
                    "문항 수는 1~10개여야 합니다."
            );
        }

        if (request.getQuiz_prompt() != null
                && request.getQuiz_prompt().length() > 1000) {

            throw new IllegalArgumentException(
                    "추가 요청사항은 1000자 이내로 입력해주세요."
            );
        }

        var file = request.getFile();

        if (file == null
                || file.isEmpty()
                || file.getSize() > 10 * 1024 * 1024
                || !Set.of(
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                ).contains(
                        Objects.toString(
                                file.getContentType(), ""
                        )
                )) {

            throw new IllegalArgumentException(
                    "10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요."
            );
        }

        if (selfStudyDao.selectSubject(
                request.getSubject_id()
        ) == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 과목입니다."
            );
        }

        // -----------------------------------------------------
        // 1-2. 이미지 읽기
        // -----------------------------------------------------

        byte[] bytes;

        try {
            bytes = file.getBytes();

        } catch (IOException e) {

            throw new IllegalStateException(
                    "이미지를 읽지 못했습니다. 다시 시도해주세요.",
                    e
            );
        }

        // -----------------------------------------------------
        // 1-3. AI 문제 생성
        //
        // 실패 시 아래 저장 단계로 넘어가지 않습니다.
        // 현재 포인트 차감 코드가 없으므로 차감도 없습니다.
        // -----------------------------------------------------

        var generated = aiClient.generate(request, bytes);

        // -----------------------------------------------------
        // 1-4. AI 생성 결과 검증
        // -----------------------------------------------------

        if (generated == null
                || generated.quizzes() == null
                || generated.quizzes().isEmpty()) {

            throw new IllegalStateException(
                    "AI 문제 생성에 실패했습니다. 다시 시도해주세요."
            );
        }

        if (generated.quizzes().size()
                != request.getQuiz_count()) {

            throw new IllegalStateException(
                    "요청한 개수만큼 문제가 생성되지 않았습니다. "
                    + "다시 시도해주세요."
            );
        }

        for (var quiz : generated.quizzes()) {

            if (quiz == null
                    || quiz.quizQuestion() == null
                    || quiz.quizQuestion().isBlank()
                    || quiz.quizCorrectAnswer() == null
                    || quiz.quizCorrectAnswer().isBlank()
                    || quiz.quizExplanation() == null
                    || quiz.quizExplanation().isBlank()
                    || quiz.quizSelections() == null) {

                throw new IllegalStateException(
                        "AI가 올바르지 않은 문제를 생성했습니다. "
                        + "다시 시도해주세요."
                );
            }

            // 객관식 / OX는 선택지가 반드시 있어야 합니다.
            if (!"SHORT_ANSWER".equals(request.getQuiz_type())
                    && quiz.quizSelections().isEmpty()) {

                throw new IllegalStateException(
                        "AI가 문제의 선택지를 생성하지 못했습니다. "
                        + "다시 시도해주세요."
                );
            }

            // 선택지에 비어 있는 항목이 있는지 확인합니다.
            for (String selection : quiz.quizSelections()) {

                if (selection == null || selection.isBlank()) {

                    throw new IllegalStateException(
                            "AI가 올바르지 않은 선택지를 생성했습니다. "
                            + "다시 시도해주세요."
                    );
                }
            }
        }

        // -----------------------------------------------------
        // 1-5. 원본 이미지 저장 준비
        // -----------------------------------------------------

        String extension = switch (file.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            default -> ".webp";
        };

        String filename = UUID.randomUUID() + extension;

        Path path = imageDirectory.resolve(filename);

        // -----------------------------------------------------
        // 1-6. 이미지 저장 + DB 트랜잭션
        // -----------------------------------------------------

        try {

            Files.createDirectories(imageDirectory);
            Files.write(path, bytes);

            QuizGenerateResponseDto result =
                    transactions.execute(status -> {

                // 세션 저장
                QuizSessionVO session = new QuizSessionVO();

                session.setSubject_id(
                        request.getSubject_id()
                );

                session.setMember_num(
                        request.getMember_num()
                );

                session.setQuiz_image_url(
                        "/quiz-images/" + filename
                );

                session.setQuiz_type(
                        request.getQuiz_type()
                );

                session.setQuiz_difficulty(
                        request.getQuiz_difficulty()
                );

                session.setQuiz_count(
                        request.getQuiz_count()
                );

                session.setQuiz_prompt(
                        request.getQuiz_prompt()
                );

                if (selfStudyDao.insertQuizSession(session) != 1) {

                    throw new IllegalStateException(
                            "학습 세션 저장에 실패했습니다."
                    );
                }

                // 생성된 문제 저장
                var items =
                        new ArrayList<
                                QuizGenerateResponseDto.QuizItem
                        >();

                for (var q : generated.quizzes()) {

                    QuizVO quiz = new QuizVO();

                    quiz.setQuiz_session_id(
                            session.getQuiz_session_id()
                    );

                    quiz.setQuiz_question(
                            q.quizQuestion()
                    );

                    quiz.setQuiz_selections(
                            json.writeValueAsString(
                                    q.quizSelections()
                            )
                    );

                    quiz.setQuiz_correct_answer(
                            q.quizCorrectAnswer()
                    );

                    quiz.setQuiz_explanation(
                            q.quizExplanation()
                    );

                    if (selfStudyDao.insertQuiz(quiz) != 1) {

                        throw new IllegalStateException(
                                "생성된 문제 저장에 실패했습니다."
                        );
                    }

                    items.add(
                            new QuizGenerateResponseDto.QuizItem(
                                    quiz.getQuiz_id(),
                                    session.getQuiz_session_id(),
                                    q.quizQuestion(),
                                    q.quizSelections(),
                                    q.quizCorrectAnswer(),
                                    q.quizExplanation()
                            )
                    );
                }

                // 모든 문제 저장 여부 확인
                if (items.size() != request.getQuiz_count()) {

                    throw new IllegalStateException(
                            "문제 저장 개수가 일치하지 않습니다."
                    );
                }

                // 모든 DB 저장이 성공해야 정상 반환
                return new QuizGenerateResponseDto(
                        session.getQuiz_session_id(),
                        items
                );
            });

            if (result == null) {
                throw new IllegalStateException(
                        "문제 생성 결과를 저장하지 못했습니다."
                );
            }

            return result;

        } catch (IOException | RuntimeException e) {

            // DB 저장이 실패했다면 이미지 파일도 삭제
            try {

                Files.deleteIfExists(path);

            } catch (IOException cleanup) {

                e.addSuppressed(cleanup);
            }

            throw new IllegalStateException(
                    "문제 생성 결과 저장에 실패했습니다. "
                    + "다시 시도해주세요.",
                    e
            );
        }
    }

    // =========================================================
    // 2. 학습 세션 소유자 검증
    // =========================================================

    public void requireSessionOwner(
            Long sessionId,
            Long memberNum
    ) {

        if (!Objects.equals(
                getSession(sessionId).getMember_num(),
                memberNum
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "본인의 학습 세션만 사용할 수 있습니다."
            );
        }
    }

    // =========================================================
    // 3. 학습 결과 소유자 검증
    // =========================================================

    public void requireResultOwner(
            Long resultId,
            Long memberNum
    ) {

        if (!Objects.equals(
                getResult(resultId).getMember_num(),
                memberNum
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "본인의 학습 결과만 사용할 수 있습니다."
            );
        }
    }

    // =========================================================
    // 4. 카테고리 조회
    // =========================================================

    public List<CategoryVO> getCategories() {

        return selfStudyDao.selectCategories();
    }

    // =========================================================
    // 5. 과목 조회
    // =========================================================

    public List<SubjectVO> getSubjects(Long categoryId) {

        if (categoryId == null) {

            throw new IllegalArgumentException(
                    "카테고리 정보가 없습니다."
            );
        }

        return selfStudyDao.selectSubjects(categoryId);
    }

    // =========================================================
    // 6. 퀴즈 세션 저장
    // =========================================================

    @Transactional
    public QuizSessionVO saveQuizSession(
            QuizSessionVO session
    ) {

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

        int result = selfStudyDao.insertQuizSession(session);

        if (result != 1) {

            throw new IllegalStateException(
                    "퀴즈 세션 저장에 실패했습니다."
            );
        }

        return session;
    }

    // =========================================================
    // 7. 문제 저장
    // =========================================================

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

        int result = selfStudyDao.insertQuiz(quiz);

        if (result != 1) {

            throw new IllegalStateException(
                    "문제 저장에 실패했습니다."
            );
        }

        return quiz;
    }

    // =========================================================
    // 8. 회원별 학습 세션 목록
    // =========================================================

    public List<QuizSessionVO> getSessions(
            Long memberNum
    ) {

        if (memberNum == null) {

            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        return selfStudyDao.selectQuizSessions(memberNum);
    }

    // =========================================================
    // 9. 학습 세션 상세
    // =========================================================

    public QuizSessionVO getSession(
            Long quizSessionId
    ) {

        if (quizSessionId == null) {

            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        QuizSessionVO session =
                selfStudyDao.selectQuizSession(quizSessionId);

        if (session == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 학습 세션입니다."
            );
        }

        return session;
    }

    // =========================================================
    // 10. 학습 세션의 문제 목록
    // =========================================================

    public List<QuizVO> getQuizzes(
            Long quizSessionId
    ) {

        if (quizSessionId == null) {

            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        return selfStudyDao.selectQuizzes(quizSessionId);
    }

    // =========================================================
    // 11. 답안 제출 및 채점
    // =========================================================

    @Transactional
    public SelfStudyResultVO submitQuiz(
            QuizSubmitRequestDto request
    ) {

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

        if (request.getResponses() == null
                || request.getResponses().isEmpty()) {

            throw new IllegalArgumentException(
                    "제출할 답안이 없습니다."
            );
        }

        // 세션 확인
        QuizSessionVO session =
                selfStudyDao.selectQuizSession(
                        request.getQuiz_sessionid()
                );

        if (session == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 퀴즈 세션입니다."
            );
        }

        requireSessionOwner(
                request.getQuiz_sessionid(),
                request.getMember_num()
        );

        var expectedQuizzes =
                selfStudyDao.selectQuizzes(
                        request.getQuiz_sessionid()
                );

        var answerIds = new HashSet<Long>();

        for (var answer : request.getResponses()) {

            if (answer == null
                    || answer.getQuiz_id() == null
                    || !answerIds.add(answer.getQuiz_id())
                    || answer.getQuiz_user_response() == null
                    || answer.getQuiz_user_response().isBlank()
                    || answer.getQuiz_user_response().length() > 1000) {

                throw new IllegalArgumentException(
                        "답안이 누락되거나 중복되었습니다."
                );
            }
        }

        var expectedIds = expectedQuizzes.stream()
                .map(QuizVO::getQuiz_id)
                .collect(Collectors.toSet());

        if (!answerIds.equals(expectedIds)) {

            throw new IllegalArgumentException(
                    "세션의 모든 문제에 답해주세요."
            );
        }

        // 채점
        int correctCount = 0;

        for (QuizResponseDto answer : request.getResponses()) {

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

            if (!quiz.getQuiz_session_id().equals(
                    request.getQuiz_sessionid()
            )) {

                throw new IllegalArgumentException(
                        "해당 학습 세션의 문제가 아닙니다."
                );
            }

            boolean correct =
                    quiz.getQuiz_correct_answer() != null
                    && answer.getQuiz_user_response() != null
                    && quiz.getQuiz_correct_answer()
                            .trim()
                            .equalsIgnoreCase(
                                    answer.getQuiz_user_response().trim()
                            );

            if (correct) {
                correctCount++;
            }
        }

        // 점수 계산
        int totalQuestion = request.getResponses().size();

        int totalScore = (int) Math.round(
                correctCount * 100.0 / totalQuestion
        );

        // 학습 결과 저장
        SelfStudyResultVO result = new SelfStudyResultVO();

        result.setQuiz_session_id(
                request.getQuiz_sessionid()
        );

        result.setMember_num(
                request.getMember_num()
        );

        result.setSelfstudy_total_score(totalScore);

        int insertResult =
                selfStudyDao.insertSelfStudyResult(result);

        if (insertResult != 1) {

            throw new IllegalStateException(
                    "학습 결과 저장에 실패했습니다."
            );
        }

        // 문제별 답안 저장
        for (QuizResponseDto answer : request.getResponses()) {

            QuizVO quiz =
                    selfStudyDao.selectQuiz(
                            answer.getQuiz_id()
                    );

            boolean correct =
                    quiz.getQuiz_correct_answer() != null
                    && answer.getQuiz_user_response() != null
                    && quiz.getQuiz_correct_answer()
                            .trim()
                            .equalsIgnoreCase(
                                    answer.getQuiz_user_response().trim()
                            );

            QuizResponseVO response = new QuizResponseVO();

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
                    selfStudyDao.insertQuizResponse(response);

            if (insertResponse != 1) {

                throw new IllegalStateException(
                        "문제 답안 저장에 실패했습니다."
                );
            }
        }

        return result;
    }

    // =========================================================
    // 12. 회원별 학습 결과 목록
    // =========================================================

    public List<SelfStudyResultVO> getResults(
            Long memberNum
    ) {

        if (memberNum == null) {

            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        return selfStudyDao.selectResults(memberNum);
    }

    // =========================================================
    // 13. 학습 결과 상세
    // =========================================================

    public SelfStudyResultVO getResult(
            Long resultId
    ) {

        if (resultId == null) {

            throw new IllegalArgumentException(
                    "결과 정보가 없습니다."
            );
        }

        SelfStudyResultVO result =
                selfStudyDao.selectResult(resultId);

        if (result == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 결과입니다."
            );
        }

        return result;
    }

    // =========================================================
    // 14. 학습 결과별 답안 조회
    // =========================================================

    public List<QuizResponseVO> getResponses(
            Long resultId
    ) {

        if (resultId == null) {

            throw new IllegalArgumentException(
                    "결과 정보가 없습니다."
            );
        }

        return selfStudyDao.selectQuizResponses(resultId);
    }

    // =========================================================
    // 15. 학습 세션 삭제
    // =========================================================

    @Transactional
    public void deleteSession(
            Long quizSessionId
    ) {

        QuizSessionVO session =
                selfStudyDao.selectQuizSession(quizSessionId);

        if (session == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 학습 세션입니다."
            );
        }

        // 1. 사용자 답안 삭제
        selfStudyDao.deleteQuizResponsesBySession(
                quizSessionId
        );

        // 2. 학습 결과 삭제
        selfStudyDao.deleteResultsBySession(
                quizSessionId
        );

        // 3. 문제 삭제
        selfStudyDao.deleteQuizzesBySession(
                quizSessionId
        );

        // 4. 세션 삭제
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