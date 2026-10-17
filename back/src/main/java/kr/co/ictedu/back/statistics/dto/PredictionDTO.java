package kr.co.ictedu.back.statistics.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PredictionDTO {

    private List<PredictionItemDTO> prediction;
    private String mentorComment;

    @Getter
    @Setter
    public static class PredictionItemDTO {
        private String name;
        private double score;
        private String type;
    }
}
