package kr.co.ictedu.back.statistics.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/** Root response returned by FastAPI /prediction. */
@Getter
@Setter
public class PredictionDTO {
    private List<CategoryPredictionDTO> categoryPredictions;

    @Getter
    @Setter
    public static class CategoryPredictionDTO {
        private List<Long> categoryIds;
        private String categoryName;
        private List<PredictionItemDTO> prediction;
        private String mentorComment;
    }

    @Getter
    @Setter
    public static class PredictionItemDTO {
        private String name;
        private Double score;
        private String type;
    }
}
