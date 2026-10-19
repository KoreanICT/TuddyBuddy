//최솔
package kr.co.ictedu.back.selfstudy.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

import kr.co.ictedu.back.selfstudy.dto.SelfStudyUsageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyAdminDao;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyUsageVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@Service
@Transactional(readOnly = true)
public class SelfStudyAdminService {

    private final SelfStudyAdminDao selfStudyAdminDao;

    public SelfStudyAdminService(SelfStudyAdminDao selfStudyAdminDao) {
        this.selfStudyAdminDao = selfStudyAdminDao;
    }

    // 카테고리 전체 조회 (비활성 포함)
    public List<CategoryVO> getCategories() {
        return selfStudyAdminDao.selectAllCategories();
    }

    // 카테고리 등록
    @Transactional
    public void createCategory(CategoryVO vo) {
        if (vo == null || vo.getCategory_name() == null
                || vo.getCategory_name().isBlank()) {
            throw new IllegalArgumentException("카테고리 이름을 입력해주세요.");
        }

        vo.setCategory_name(vo.getCategory_name().trim());

        if (selfStudyAdminDao.insertCategory(vo) != 1) {
            throw new IllegalStateException("카테고리 등록에 실패했습니다.");
        }
    }

    // 카테고리 이름 수정
    @Transactional
    public void updateCategory(Long categoryId, CategoryVO vo) {
        if (vo == null || vo.getCategory_name() == null
                || vo.getCategory_name().isBlank()) {
            throw new IllegalArgumentException("카테고리 이름을 입력해주세요.");
        }

        vo.setCategory_id(categoryId);
        vo.setCategory_name(vo.getCategory_name().trim());

        if (selfStudyAdminDao.updateCategoryName(vo) != 1) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다.");
        }
    }

    // 카테고리 활성화 / 비활성화
    @Transactional
    public void updateCategoryStatus(Long categoryId, String status) {
        validateStatus(status);

        if (selfStudyAdminDao.updateCategoryStatus(categoryId, status) != 1) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다.");
        }
    }

    // 과목 전체 조회 (비활성 포함)
    public List<SubjectVO> getSubjects() {
        return selfStudyAdminDao.selectAllSubjects();
    }

    public SelfStudyUsageResponse getUsage(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null || toDate.isBefore(fromDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 기간을 확인해주세요.");
        }
        if (ChronoUnit.DAYS.between(fromDate, toDate) > 365) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 기간은 최대 366일까지 선택할 수 있습니다.");
        }

        var fromDateTime = fromDate.atStartOfDay();
        var toDateExclusive = toDate.plusDays(1).atStartOfDay();
        SelfStudyUsageVO.Summary summary = selfStudyAdminDao.selectUsageSummary(fromDateTime, toDateExclusive);

        return new SelfStudyUsageResponse(
                new SelfStudyUsageResponse.Summary(
                        value(summary.getGenerated_count()),
                        value(summary.getParticipant_count()),
                        value(summary.getSubmitted_count()),
                        summary.getAverage_score() == null ? 0 : summary.getAverage_score()),
                selfStudyAdminDao.selectDailyUsageTrend(fromDateTime, toDateExclusive).stream()
                        .map(day -> new SelfStudyUsageResponse.DailyTrend(
                                day.getUsage_date(), value(day.getGenerated_count()), value(day.getSubmitted_count())))
                        .toList(),
                selfStudyAdminDao.selectCategoryUsageRanking(fromDateTime, toDateExclusive).stream()
                        .map(category -> new SelfStudyUsageResponse.CategoryRanking(
                                category.getCategory_id(), category.getCategory_name(), value(category.getGenerated_count())))
                        .toList(),
                selfStudyAdminDao.selectSubjectUsageRanking(fromDateTime, toDateExclusive).stream()
                        .map(subject -> new SelfStudyUsageResponse.SubjectRanking(
                                subject.getSubject_id(), subject.getSubject_name(), subject.getCategory_name(),
                                value(subject.getGenerated_count())))
                        .toList());
    }

    private long value(Long value) {
        return Objects.requireNonNullElse(value, 0L);
    }

    // 과목 등록
    @Transactional
    public void createSubject(SubjectVO vo) {
        if (vo == null || vo.getCategory_id() == null
                || vo.getSubject_name() == null
                || vo.getSubject_name().isBlank()) {
            throw new IllegalArgumentException("카테고리와 과목 이름을 입력해주세요.");
        }

        vo.setSubject_name(vo.getSubject_name().trim());

        if (selfStudyAdminDao.insertSubject(vo) != 1) {
            throw new IllegalStateException("과목 등록에 실패했습니다.");
        }
    }

    // 과목 이름 수정
    @Transactional
    public void updateSubject(Long subjectId, SubjectVO vo) {
        if (vo == null || vo.getSubject_name() == null
                || vo.getSubject_name().isBlank()) {
            throw new IllegalArgumentException("과목 이름을 입력해주세요.");
        }

        vo.setSubject_id(subjectId);
        vo.setSubject_name(vo.getSubject_name().trim());

        if (selfStudyAdminDao.updateSubjectName(vo) != 1) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "과목을 찾을 수 없습니다.");
        }
    }

    // 과목 활성화 / 비활성화
    @Transactional
    public void updateSubjectStatus(Long subjectId, String status) {
        validateStatus(status);

        if (selfStudyAdminDao.updateSubjectStatus(subjectId, status) != 1) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "과목을 찾을 수 없습니다.");
        }
    }

    private void validateStatus(String status) {
        if (!"Y".equals(status) && !"N".equals(status)) {
            throw new IllegalArgumentException("상태값은 Y 또는 N이어야 합니다.");
        }
    }
}
