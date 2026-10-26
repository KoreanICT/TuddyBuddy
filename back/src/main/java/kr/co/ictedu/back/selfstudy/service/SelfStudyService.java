// 최솔
package kr.co.ictedu.back.selfstudy.service;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

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
    public QuizGenerateResponseDto classifyImage(QuizGenerateRequestDto request) {
        var file = validateImage(request);
        byte[] bytes = readImage(file);
        String imageHash = sha256(bytes);

        QuizSessionVO saved = selfStudyDao.selectSessionByImageHash(imageHash);
        if (saved != null) {
            return classificationResponse(imageHash, saved, true);
        }

        if (request.getSubject_id() != null) {
            SubjectVO subject = selfStudyDao.selectSubject(request.getSubject_id());
            if (subject == null) {
                throw new IllegalArgumentException("존재하지 않는 과목입니다.");
            }
            CategoryVO category = selfStudyDao.selectCategoryById(subject.getCategory_id());
            if (category == null) {
                throw new IllegalStateException("선택한 과목의 카테고리를 조회하지 못했습니다.");
            }
            return new QuizGenerateResponseDto(imageHash, false, null,
                    category.getCategory_id(), category.getCategory_name(),
                    subject.getSubject_id(), subject.getSubject_name(), List.of());
        }

        var suggestion = aiClient.classify(request, bytes, catalogService.getAiCatalog());
        return new QuizGenerateResponseDto(imageHash, false, null, null,
                normalizeTaxonomyName(suggestion.categoryName()), null,
                normalizeTaxonomyName(suggestion.subjectName()), List.of());
    }

    private QuizGenerateResponseDto classificationResponse(
            String hash, QuizSessionVO session, boolean cached) {
        SubjectVO subject = selfStudyDao.selectSubject(session.getSubject_id());
        if (subject == null) throw new IllegalStateException("기존 세션의 과목을 조회하지 못했습니다.");
        CategoryVO category = selfStudyDao.selectCategoryById(subject.getCategory_id());
        if (category == null) throw new IllegalStateException("기존 세션의 카테고리를 조회하지 못했습니다.");
        return new QuizGenerateResponseDto(hash, cached, null,
                category.getCategory_id(), category.getCategory_name(),
                subject.getSubject_id(), subject.getSubject_name(), List.of());
    }

    private org.springframework.web.multipart.MultipartFile validateImage(QuizGenerateRequestDto request) {
        if (request == null || request.getFile() == null || request.getFile().isEmpty()
                || request.getFile().getSize() > 10 * 1024 * 1024
                || !Set.of("image/jpeg", "image/png", "image/webp")
                    .contains(Objects.toString(request.getFile().getContentType(), ""))) {
            throw new IllegalArgumentException("10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.");
        }
        return request.getFile();
    }

    private byte[] readImage(org.springframework.web.multipart.MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("이미지를 읽지 못했습니다. 다시 시도해주세요.", e);
        }
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("이미지 해시를 계산하지 못했습니다.", e);
        }
    }

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

        var file = validateImage(request);

        // -----------------------------------------------------
        // 1-2. 이미지 읽기
        // -----------------------------------------------------

        byte[] bytes = readImage(file);
        String imageHash = sha256(bytes);
        // AI 분류를 마친 요청은 전달된 해시를 검증하고, 수동 분류 요청은 서버에서 계산한 해시를 사용합니다.
        if (request.getImage_hash() != null
                && !request.getImage_hash().isBlank()
                && !imageHash.equalsIgnoreCase(request.getImage_hash())) {
            throw new IllegalArgumentException("분류 확인 후 이미지가 변경되었습니다. 다시 분류해주세요.");
        }

        QuizSessionVO cachedSession = selfStudyDao.selectSessionByImageHash(imageHash);
        SubjectVO cachedSubject = cachedSession == null
                ? null : selfStudyDao.selectSubject(cachedSession.getSubject_id());
        CategoryVO cachedCategory = cachedSubject == null
                ? null : selfStudyDao.selectCategoryById(cachedSubject.getCategory_id());
        if (cachedSession != null && (cachedSubject == null || cachedCategory == null)) {
            throw new IllegalStateException("기존 이미지 세션의 카테고리·과목을 조회하지 못했습니다.");
        }
        String requestedCategory = normalizeTaxonomyName(
                cachedSession == null ? request.getCategory_name() : cachedCategory.getCategory_name());
        String requestedSubject = normalizeTaxonomyName(
                cachedSession == null ? request.getSubject_name() : cachedSubject.getSubject_name());
        if (requestedCategory.isBlank() || requestedSubject.isBlank()) {
            throw new IllegalArgumentException("분류 결과를 확인하고 카테고리와 과목을 입력해주세요.");
        }
        // -----------------------------------------------------
        // 1-3. AI 문제 생성
        //
        // 실패 시 아래 저장 단계로 넘어가지 않습니다.
        // 현재 포인트 차감 코드가 없으므로 차감도 없습니다.
        // -----------------------------------------------------

        List<Map<String, Object>> catalog = catalogService.getAiCatalog();

        var generated = aiClient.generate(request, bytes, catalog, requestedCategory, requestedSubject);

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

        String filename = imageHash + extension;

        Path path = imageDirectory.resolve(filename);
        boolean imageCreated = !Files.exists(path);

        // -----------------------------------------------------
        // 1-6. 이미지 저장 + DB 트랜잭션
        // -----------------------------------------------------

        try {

            Files.createDirectories(imageDirectory);
            if (imageCreated) {
                Files.write(path, bytes);
            }

            QuizGenerateResponseDto result =
                    transactions.execute(status -> {

                String categoryName = requestedCategory;
                String subjectName = requestedSubject;
                if (categoryName.isBlank() || subjectName.isBlank()) {
                    throw new IllegalStateException("AI가 카테고리와 과목을 분류하지 못했습니다.");
                }

                // AI 생성과 응답 검증이 끝난 뒤에만 과금하고, 퀴즈 저장과 같은 트랜잭션으로 처리합니다.
                pointService.usePoint(
                        request.getMember_num(),
                        QUIZ_GENERATION_POINT_COST,
                        QUIZ_GENERATION_POINT_DESCRIPTION);

                // 문제 생성 중 동일 이미지 세션이 먼저 저장되었으면 그 세션의 분류를 우선합니다.
                QuizSessionVO concurrentlySaved = selfStudyDao.selectSessionByImageHash(imageHash);
                CategoryVO category;
                SubjectVO subject;
                if (concurrentlySaved != null) {
                    subject = selfStudyDao.selectSubject(concurrentlySaved.getSubject_id());
                    category = subject == null ? null
                            : selfStudyDao.selectCategoryById(subject.getCategory_id());
                    if (category != null) {
                        categoryName = category.getCategory_name();
                        subjectName = subject.getSubject_name();
                    }
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
                    if (category == null) throw new IllegalStateException("카테고리를 조회하지 못했습니다.");

                    subject = selfStudyDao.selectSubjectByName(category.getCategory_id(), subjectName);
                    if (subject == null) {
                        subject = new SubjectVO();
                        subject.setCategory_id(category.getCategory_id());
                        subject.setSubject_name(subjectName);
                        if (selfStudyDao.insertSubject(subject) != 1) {
                            throw new IllegalStateException("과목 자동 등록에 실패했습니다.");
                        }
                        subject = selfStudyDao.selectSubjectByName(category.getCategory_id(), subjectName);
                    }
                }
                if (category == null || subject == null
                        || !Objects.equals(subject.getCategory_id(), category.getCategory_id())) {
                    throw new IllegalStateException("저장된 이미지 분류 관계가 올바르지 않습니다.");
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
                        imageHash,
                        cachedSession != null || concurrentlySaved != null,
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

                if (imageCreated) {
                    Files.deleteIfExists(path);
                }

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
