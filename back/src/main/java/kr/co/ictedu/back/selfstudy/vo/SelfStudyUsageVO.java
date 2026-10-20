//최솔
package kr.co.ictedu.back.selfstudy.vo;

import lombok.Getter;
import lombok.Setter;

public class SelfStudyUsageVO {

    @Getter
    @Setter
    public static class Summary {
        private Long generated_count;
        private Long participant_count;
        private Long submitted_count;
        private Double average_score;
    }

    @Getter
    @Setter
    public static class DailyTrend {
        private String usage_date;
        private Long generated_count;
        private Long submitted_count;
    }

    @Getter
    @Setter
    public static class CategoryRanking {
        private Long category_id;
        private String category_name;
        private Long generated_count;
    }

    @Getter
    @Setter
    public static class SubjectRanking {
        private Long subject_id;
        private String subject_name;
        private String category_name;
        private Long generated_count;
    }
}
