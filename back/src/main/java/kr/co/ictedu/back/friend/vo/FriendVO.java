package kr.co.ictedu.back.friend.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("frvo")
@Setter
@Getter
public class FriendVO {
    private Long num;
    private String status;
    private String requested_date;
    private String responsed_date;
    private Long request_num;
    private Long response_num;
}
