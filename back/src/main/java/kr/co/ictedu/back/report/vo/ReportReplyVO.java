package kr.co.ictedu.back.report.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("rerevo")
@Getter
@Setter
public class ReportReplyVO {
    private Long num;
    private String content;
    private String created_date;
    private Long report_num;
    private Long admin_num;

}
