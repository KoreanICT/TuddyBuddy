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
		friendDao.accept(num);
	}

	// 친구 요청 거절
	public void reject(Long num) {
		friendDao.reject(num);
	}

	// 친구 목록
	public List<FriendVO> friendList(Long member_num) {
		return friendDao.friendList(member_num);
	}

	// 친구 삭제
	public void del(Long num) {
		friendDao.del(num);
	}
}
