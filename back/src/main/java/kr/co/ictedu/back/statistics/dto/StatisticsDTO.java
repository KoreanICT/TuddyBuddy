package kr.co.ictedu.back.statistics.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/** Root response returned by FastAPI /statistics. */
@Getter
@Setter
public class StatisticsDTO {
    private List<CategoryAnalysisDTO> categoryAnalyses;

    @Getter
    @Setter
    public static class CategoryAnalysisDTO {
        private List<Long> categoryIds;
        private String categoryName;
        private String mentorComment;
        private List<String> weaknesses;
        private List<String> consultingPath;
    }
}
