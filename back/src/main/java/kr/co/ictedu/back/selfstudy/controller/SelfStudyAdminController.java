//최솔
package kr.co.ictedu.back.selfstudy.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.ictedu.back.selfstudy.service.SelfStudyAdminService;
import kr.co.ictedu.back.selfstudy.dto.SelfStudyUsageResponse;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;
import kr.co.ictedu.back.selfstudy.service.AuthenticatedMember;

@Tag(name = "셀프스터디 관리자", description = "카테고리·과목 관리 및 셀프스터디 이용 현황 API")
@RestController
@RequestMapping("/api/selfstudy/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class SelfStudyAdminController {

    private final SelfStudyAdminService selfStudyAdminService;
    private final AuthenticatedMember authenticatedMember;

    public SelfStudyAdminController(
            SelfStudyAdminService selfStudyAdminService,
            AuthenticatedMember authenticatedMember
    ) {
        this.selfStudyAdminService = selfStudyAdminService;
        this.authenticatedMember = authenticatedMember;
    }

    @Operation(summary = "전체 카테고리 조회", description = "비활성 카테고리 포함")
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryVO>> getCategories() {
        authenticatedMember.requireAdmin();
        return ResponseEntity.ok(selfStudyAdminService.getCategories());
    }

    @Operation(summary = "카테고리 등록")
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CategoryVO vo) {
        authenticatedMember.requireAdmin();
        selfStudyAdminService.createCategory(vo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "카테고리가 등록되었습니다."));
    }

    @Operation(summary = "카테고리 이름 수정")
    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<?> updateCategory(
            @PathVariable("categoryId") Long categoryId,
            @RequestBody CategoryVO vo) {
        authenticatedMember.requireAdmin();

        selfStudyAdminService.updateCategory(categoryId, vo);
        return ResponseEntity.ok(Map.of("message", "카테고리가 수정되었습니다."));
    }

    @Operation(summary = "카테고리 활성화 및 비활성화")
    @PatchMapping("/categories/{categoryId}/status")
    public ResponseEntity<?> updateCategoryStatus(
            @PathVariable("categoryId") Long categoryId,
            @RequestBody Map<String, String> request) {
        authenticatedMember.requireAdmin();

        selfStudyAdminService.updateCategoryStatus(
                categoryId, request.get("status"));

        return ResponseEntity.ok(Map.of("message", "카테고리 상태가 변경되었습니다."));
    }

    @Operation(summary = "비활성 카테고리 완전 삭제", description = "연결된 과목이 없는 비활성 카테고리만 삭제합니다.")
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> permanentlyDeleteCategory(@PathVariable("categoryId") Long categoryId) {
        authenticatedMember.requireAdmin();
        selfStudyAdminService.permanentlyDeleteCategory(categoryId);
        return ResponseEntity.ok(Map.of("message", "카테고리가 완전히 삭제되었습니다."));
    }

    @Operation(summary = "전체 과목 조회", description = "비활성 과목 포함")
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectVO>> getSubjects() {
        authenticatedMember.requireAdmin();
        return ResponseEntity.ok(selfStudyAdminService.getSubjects());
    }

    @Operation(summary = "셀프스터디 이용 현황 조회", description = "선택 기간의 생성, 제출, 날짜별 추이와 카테고리·과목별 순위를 조회합니다.")
    @GetMapping("/usage")
    public ResponseEntity<SelfStudyUsageResponse> getUsage(
            @Parameter(description = "조회 시작일(포함)", example = "2026-10-01", required = true)
            @RequestParam(name = "from") LocalDate fromDate,
            @Parameter(description = "조회 종료일(포함)", example = "2026-10-19", required = true)
            @RequestParam(name = "to") LocalDate toDate) {
        authenticatedMember.requireAdmin();
        return ResponseEntity.ok(selfStudyAdminService.getUsage(fromDate, toDate));
    }

    @Operation(summary = "과목 등록")
    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody SubjectVO vo) {
        authenticatedMember.requireAdmin();
        selfStudyAdminService.createSubject(vo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "과목이 등록되었습니다."));
    }

    @Operation(summary = "과목 이름 수정")
    @PutMapping("/subjects/{subjectId}")
    public ResponseEntity<?> updateSubject(
            @PathVariable("subjectId") Long subjectId,
            @RequestBody SubjectVO vo) {
        authenticatedMember.requireAdmin();

        selfStudyAdminService.updateSubject(subjectId, vo);
        return ResponseEntity.ok(Map.of("message", "과목이 수정되었습니다."));
    }

    @Operation(summary = "과목 활성화 및 비활성화")
    @PatchMapping("/subjects/{subjectId}/status")
    public ResponseEntity<?> updateSubjectStatus(
            @PathVariable("subjectId") Long subjectId,
            @RequestBody Map<String, String> request) {
        authenticatedMember.requireAdmin();

        selfStudyAdminService.updateSubjectStatus(
                subjectId, request.get("status"));

        return ResponseEntity.ok(Map.of("message", "과목 상태가 변경되었습니다."));
    }
}
