package kr.co.ictedu.back.report.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportCountVO {
    private String type;
    private String category;
    private long count;
}
