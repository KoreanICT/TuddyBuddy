package kr.co.ictedu.back.common.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("CommentVO")
@Setter
@Getter
public class CommentVO {

    private int commentNum;
    private int postId;
    private int memberNum;
    private String content;
    private String author;
    private String createdAt;

    public CommentVO() {
    }
}