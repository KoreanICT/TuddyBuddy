package kr.co.ictedu.back.report.vo;

import org.apache.ibatis.type.Alias;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Alias("revo")
@Getter
@Setter
public class ReportVO {
    private Long num;
    private Long member_num;
    private Long target_num;
    private String type;
    private String category;
    private String content;
    private String status;
    private String created_date;
}
