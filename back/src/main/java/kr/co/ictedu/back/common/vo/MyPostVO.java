package kr.co.ictedu.back.common.vo;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyPostVO {
	
    private int postNum;
    private String title;
    private String category;
    private String content;
    private String author;
    private int likeCount;      
    private Date communityDate;
    private int viewCount;
    
}