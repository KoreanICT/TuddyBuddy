package kr.co.ictedu.back.friend.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.friend.vo.FriendVO;

@Mapper
public interface FriendDao {
	// 친구 요청
    void add(FriendVO vo);
    
    // 친구 중복 요청 확인
    // request_num, response_num 두 값을 정확히 인식 시키기 위해 @Param
    int checkDuplicate(@Param("request_num") Long request_num, @Param("response_num") Long response_num);

    // 받은 친구 요청 목록
    List<FriendVO> requestList(Long response_num);

    // 보낸 친구 요청 목록
    List<FriendVO> responseList(Long request_num);

    // 친구 요청 상세 조회
    FriendVO detail(Long num);

    // 친구 요청 수락
    int accept(@Param("num") Long num, @Param("response_num") Long response_num);

    // 친구 요청 거절
    int reject(@Param("num") Long num, @Param("response_num") Long response_num);

    // 친구 목록
    List<FriendVO> friendList(Long member_num);

    // 친구 삭제
    int del(@Param("num") Long num, @Param("member_num") Long member_num);
}
