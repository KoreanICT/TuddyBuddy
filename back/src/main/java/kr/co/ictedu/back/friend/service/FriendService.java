package kr.co.ictedu.back.friend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.friend.dao.FriendDao;
import kr.co.ictedu.back.friend.vo.FriendVO;

@Service
public class FriendService {

	@Autowired
	private FriendDao friendDao;

	// 친구 요청
	public void add(FriendVO vo) {
		
        Long request_num = vo.getRequest_num();
        Long response_num = vo.getResponse_num();

        // null 방지
        if (request_num == null || response_num == null) throw new IllegalArgumentException("회원 정보가 올바르지 않습니다.");
        
        // 자기 자신에게 친구 요청 방지
        if (request_num.equals(response_num)) throw new IllegalArgumentException("자기 자신에게 친구 요청을 보낼 수 없습니다.");
        
        // 중복 친구 요청 확인
        int count = friendDao.checkDuplicate(request_num, response_num);
        if (count > 0) throw new IllegalArgumentException("이미 친구이거나 친구 요청이 진행 중입니다.");
        
        friendDao.add(vo);
	}

	// 받은 친구 요청 목록
	public List<FriendVO> requestList(Long response_num) {
		return friendDao.requestList(response_num);
	}

	// 보낸 친구 요청 목록
	public List<FriendVO> responseList(Long request_num) {
		return friendDao.responseList(request_num);
	}

	// 친구 요청 상세 조회
	public FriendVO detail(Long num) {
		return friendDao.detail(num);
	}

    // 친구 요청 수락
    public void accept(Long num) {
        int result = friendDao.accept(num);
        if (result == 0) throw new IllegalArgumentException("존재하지 않거나 이미 처리된 친구 요청입니다.");
    }

    // 친구 요청 거절
    public void reject(Long num) {
        int result = friendDao.reject(num);
        if (result == 0) throw new IllegalArgumentException("존재하지 않거나 이미 처리된 친구 요청입니다.");
    }

	// 친구 목록
	public List<FriendVO> friendList(Long member_num) {
		return friendDao.friendList(member_num);
	}

	// 친구 삭제
	public void del(Long num, Long member_num) {
	    int result = friendDao.del(num, member_num);
	    if (result == 0) throw new IllegalArgumentException("존재하지 않거나 삭제할 수 없는 친구입니다.");
	}
}
