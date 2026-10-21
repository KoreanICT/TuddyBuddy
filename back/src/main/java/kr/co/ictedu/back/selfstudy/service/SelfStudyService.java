// 최솔
package kr.co.ictedu.back.selfstudy.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

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
import kr.co.ictedu.back.selfstudy.dto.QuizSubmitRequestDto;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;
import kr.co.ictedu.back.point.service.PointService;
import tools.jackson.databind.json.JsonMapper;

//AI 문제 생성과 기존 호출 메서드 연결
@Service
@Transactional(readOnly = true)
public class SelfStudyService {

    private static final long QUIZ_GENERATION_POINT_COST = 1_000L;
    private static final String QUIZ_GENERATION_POINT_DESCRIPTION = "셀프스터디 AI 문제 생성";

    private final SelfStudyDao selfStudyDao;
    private final QuizAiClient aiClient;
    private final PointService pointService;
    private final TransactionTemplate transactions;
    private final JsonMapper json;
    private final Path imageDirectory;
    private final SelfStudySubmissionService submissionService;
    private final SelfStudyHistoryService historyService;
    private final SelfStudyCatalogService catalogService;
    private final QuizGenerationValidator quizGenerationValidator;
    public SelfStudyService(
            SelfStudyDao selfStudyDao,
            QuizAiClient aiClient,
            PointService pointService,
            PlatformTransactionManager transactionManager,
            JsonMapper json,
            @Value("${quiz.image.directory:./upload/quiz}") String directory,
            SelfStudySubmissionService submissionService,
            SelfStudyHistoryService historyService,
            SelfStudyCatalogService catalogService,
            QuizGenerationValidator quizGenerationValidator
    ) {
        this.selfStudyDao = selfStudyDao;
        this.aiClient = aiClient;
        this.pointService = pointService;
        this.transactions = new TransactionTemplate(transactionManager);
        this.json = json;
        this.imageDirectory = Path.of(directory).toAbsolutePath().normalize();
        this.submissionService = submissionService;
        this.historyService = historyService;
        this.catalogService = catalogService;
        this.quizGenerationValidator = quizGenerationValidator;
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
            throw new IllegalArgumentException("문제 생성 요청 정보가 없습니다.");
        }

        if (request.getMember_num() == null) {
            throw new IllegalArgumentException("로그인 정보가 필요합니다.");
        }

        if (request.getSubject_id() != null
                && request.getSubject_id() <= 0) {
            throw new IllegalArgumentException("과목 번호가 올바르지 않습니다.");
        }

        if (!Set.of("MULTIPLE_CHOICE","SHORT_ANSWER","OX")
        		.contains(Objects.toString(request.getQuiz_type(), "")
        )) {
            throw new IllegalArgumentException("문제 유형이 올바르지 않습니다.");
        }

        if (!Set.of("EASY","MEDIUM","HARD").contains(
                Objects.toString(request.getQuiz_difficulty(), ""))) 
        { 
        	throw new IllegalArgumentException("문제 난이도가 올바르지 않습니다.");
        }

        quizGenerationValidator.validateRequestedCount(
                request.getQuiz_count() == null ? 0 : request.getQuiz_count());

        if (request.getQuiz_prompt() != null
                && request.getQuiz_prompt().length() > 1000) {
            throw new IllegalArgumentException("추가 요청사항은 1000자 이내로 입력해주세요.");
        }

        var file = request.getFile();

        if (file == null
                || file.isEmpty()
                || file.getSize() > 10 * 1024 * 1024
                || !Set.of("image/jpeg","image/png","image/webp"
                ).contains(Objects.toString(file.getContentType(), "")
                )) {

            throw new IllegalArgumentException("10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.");
        }

        if (request.getSubject_id() != null
                && selfStudyDao.selectSubject(request.getSubject_id()) == null) {

            throw new IllegalArgumentException("존재하지 않는 과목입니다.");
        }

        // -----------------------------------------------------
        // 1-2. 이미지 읽기
        // -----------------------------------------------------

        byte[] bytes;

        try {
            bytes = file.getBytes();

        } catch (IOException e) {

            throw new IllegalStateException("이미지를 읽지 못했습니다. 다시 시도해주세요.", e);
        }

        // -----------------------------------------------------
        // 1-3. AI 문제 생성
        //
        // 실패 시 아래 저장 단계로 넘어가지 않습니다.
        // 현재 포인트 차감 코드가 없으므로 차감도 없습니다.
        // -----------------------------------------------------

        List<Map<String, Object>> catalog = catalogService.getAiCatalog();

        var generated = aiClient.generate(request, bytes, catalog);

        // -----------------------------------------------------
        // 1-4. AI 생성 결과 검증
        // -----------------------------------------------------

        quizGenerationValidator.validate(
                generated == null ? null : generated.quizzes(),
                request.getQuiz_count());

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

                String categoryName = normalizeTaxonomyName(generated.categoryName());
                String subjectName = normalizeTaxonomyName(generated.subjectName());
                if (categoryName.isBlank() || subjectName.isBlank()) {
                    throw new IllegalStateException("AI가 카테고리와 과목을 분류하지 못했습니다.");
                }

                // AI 생성과 응답 검증이 끝난 뒤에만 과금하고, 퀴즈 저장과 같은 트랜잭션으로 처리합니다.
                pointService.usePoint(
                        request.getMember_num(),
                        QUIZ_GENERATION_POINT_COST,
                        QUIZ_GENERATION_POINT_DESCRIPTION);

                CategoryVO category = null;
                SubjectVO subject;
                if (request.getSubject_id() == null) {
                    category = selfStudyDao.selectCategoryByName(categoryName);
                    subject = category == null
                            ? null
                            : selfStudyDao.selectSubjectByName(
                                    category.getCategory_id(), subjectName);
                    if (subject == null) {
                        subject = selfStudyDao.selectAnySubjectByName(subjectName);
                        if (subject != null) {
                            category = selfStudyDao.selectCategoryById(subject.getCategory_id());
                        }
                    }
                } else {
                    subject = selfStudyDao.selectSubject(request.getSubject_id());
                    category = subject == null
                            ? null
                            : selfStudyDao.selectCategoryById(subject.getCategory_id());
                }

                if (subject != null && category == null) {
                    throw new IllegalStateException("기존 과목의 카테고리를 조회하지 못했습니다.");
                }

                if (subject != null) {
                    categoryName = category.getCategory_name();
                    subjectName = subject.getSubject_name();
                } else {
                    category = selfStudyDao.selectCategoryByName(categoryName);
                    if (category == null) {
                        category = new CategoryVO();
                        category.setCategory_name(categoryName);
                        if (selfStudyDao.insertCategory(category) != 1) {
                            throw new IllegalStateException("카테고리 자동 등록에 실패했습니다.");
                        }
                        category = selfStudyDao.selectCategoryByName(categoryName);
                    }
                    if (category == null) {
                        throw new IllegalStateException("자동 등록한 카테고리를 조회하지 못했습니다.");
                    }
                }

                if (subject == null) {
                    subject = selfStudyDao.selectSubjectByName(
                            category.getCategory_id(), subjectName);
                }
                if (subject == null) {
                    subject = new SubjectVO();
                    subject.setCategory_id(category.getCategory_id());
                    subject.setSubject_name(subjectName);
                    if (selfStudyDao.insertSubject(subject) != 1) {
                        throw new IllegalStateException("과목 자동 등록에 실패했습니다.");
                    }
                    subject = selfStudyDao.selectSubjectByName(
                            category.getCategory_id(), subjectName);
                }
                if (subject == null) {
                    throw new IllegalStateException("자동 등록한 과목을 조회하지 못했습니다.");
                }
                request.setSubject_id(subject.getSubject_id());

                // 세션 저장
                QuizSessionVO session = new QuizSessionVO();

                session.setSubject_id(
                        request.getSubject_id()
                );

                session.setMember_num(
                        request.getMember_num()
                );

                session.setQuiz_image_url(
                        "/imgfile/quiz/" + filename
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
                        category.getCategory_id(),
                        category.getCategory_name(),
                        subject.getSubject_id(),
                        subject.getSubject_name(),
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

            if (hasInsufficientPointCause(e)) {
                throw new ResponseStatusException(
                        HttpStatus.PAYMENT_REQUIRED,
                        "포인트 잔액이 부족합니다.",
                        e);
            }

            throw new IllegalStateException(
                    "문제 생성 결과 저장에 실패했습니다. "
                    + "다시 시도해주세요.",
                    e
            );
        }
    }

    private String normalizeTaxonomyName(String value) {
        return value == null ? "" : value.strip().replaceAll("\\s+", " ");
    }

    private boolean hasInsufficientPointCause(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if ("포인트 잔액이 부족합니다.".equals(cause.getMessage())) {
                return true;
            }
        }
        return false;
    }

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
    public void requireSessionOwner(Long sessionId, Long memberNum) {
        historyService.requireSessionOwner(sessionId, memberNum);
    }

    public void requireResultOwner(Long resultId, Long memberNum) {
        historyService.requireResultOwner(resultId, memberNum);
    }

    public List<CategoryVO> getCategories() {
        return catalogService.getCategories();
    }

    public List<SubjectVO> getSubjects(Long categoryId) {
        return catalogService.getSubjects(categoryId);
    }

    public List<QuizSessionVO> getSessions(Long memberNum) {
        return historyService.getSessions(memberNum);
    }

    public QuizSessionVO getSession(Long quizSessionId) {
        return historyService.getSession(quizSessionId);
    }

    public List<QuizVO> getQuizzes(Long quizSessionId) {
        return historyService.getQuizzes(quizSessionId);
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public SelfStudyResultVO submitQuiz(QuizSubmitRequestDto request) {
        return submissionService.submitQuiz(request);
    }

    public List<SelfStudyResultVO> getResults(Long memberNum) {
        return historyService.getResults(memberNum);
    }

    public SelfStudyResultVO getResult(Long resultId) {
        return historyService.getResult(resultId);
    }

    public List<QuizResponseVO> getResponses(Long resultId) {
        return historyService.getResponses(resultId);
    }

    @Transactional
    public void deleteSession(Long quizSessionId) {
        historyService.deleteSession(quizSessionId);
    }
}
