//최솔
package kr.co.ictedu.back.selfstudy.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "셀프스터디 이용 현황 조회 응답")
public record SelfStudyUsageResponse(
        @Schema(description = "선택 기간의 이용 요약") Summary summary,
        @Schema(description = "날짜별 문제 생성 및 결과 제출 건수") List<DailyTrend> dailyTrend,
        @Schema(description = "카테고리별 문제 생성 세션 순위") List<CategoryRanking> categoryRanking,
        @Schema(description = "과목별 문제 생성 세션 상위 10개") List<SubjectRanking> subjectRanking) {

    @Schema(description = "선택 기간 이용 요약")
    public record Summary(
            @Schema(description = "문제 생성 세션 수", example = "120") long generatedCount,
            @Schema(description = "문제를 생성한 고유 회원 수", example = "35") long participantCount,
            @Schema(description = "학습 결과 제출 수", example = "82") long submittedCount,
            @Schema(description = "제출 결과 평균 점수(0~100점)", example = "78.5") double averageScore) {}

    @Schema(description = "하루의 셀프스터디 이용 건수")
    public record DailyTrend(
            @Schema(description = "집계 날짜", example = "2026-10-19") String date,
            @Schema(description = "문제 생성 세션 수", example = "12") long generatedCount,
            @Schema(description = "학습 결과 제출 수", example = "8") long submittedCount) {}

    @Schema(description = "카테고리별 문제 생성 세션 순위")
    public record CategoryRanking(
            @Schema(description = "카테고리 번호", example = "1") long categoryId,
            @Schema(description = "카테고리명", example = "프로그래밍") String categoryName,
            @Schema(description = "문제 생성 세션 수", example = "42") long generatedCount) {}

    @Schema(description = "과목별 문제 생성 세션 순위")
    public record SubjectRanking(
            @Schema(description = "과목 번호", example = "3") long subjectId,
            @Schema(description = "과목명", example = "자바") String subjectName,
            @Schema(description = "카테고리명", example = "프로그래밍") String categoryName,
            @Schema(description = "문제 생성 세션 수", example = "18") long generatedCount) {}
}
