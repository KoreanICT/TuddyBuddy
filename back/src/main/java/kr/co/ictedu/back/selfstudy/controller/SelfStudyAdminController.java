//최솔
package kr.co.ictedu.back.selfstudy.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.ictedu.back.selfstudy.service.SelfStudyAdminService;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@Tag(name = "셀프스터디 관리자", description = "카테고리 및 과목 관리 API")
@RestController
@RequestMapping("/api/selfstudy/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class SelfStudyAdminController {

    private final SelfStudyAdminService selfStudyAdminService;
    private final kr.co.ictedu.back.selfstudy.service.AuthenticatedMember authenticatedMember;

    public SelfStudyAdminController(SelfStudyAdminService selfStudyAdminService, kr.co.ictedu.back.selfstudy.service.AuthenticatedMember authenticatedMember) {
        this.authenticatedMember = authenticatedMember;
        this.selfStudyAdminService = selfStudyAdminService;
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

    @Operation(summary = "전체 과목 조회", description = "비활성 과목 포함")
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectVO>> getSubjects() {
        authenticatedMember.requireAdmin();
        return ResponseEntity.ok(selfStudyAdminService.getSubjects());
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