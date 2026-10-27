// 주용현

package kr.co.ictedu.back.friend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.notification.NotificationPublisher;
import kr.co.ictedu.back.notification.NotificationEvent.Category;

import kr.co.ictedu.back.friend.dao.FriendDao;
import kr.co.ictedu.back.friend.vo.FriendVO;

@Service
public class FriendService {

	@Autowired
	private FriendDao friendDao;

    @Autowired
    private NotificationPublisher notifications;

	// 친구 요청
    @Transactional
	public void add(FriendVO vo) {

		Long request_num = vo.getRequest_num();
		Long response_num = vo.getResponse_num();

		// null 방지
		if (request_num == null || response_num == null)
			throw new IllegalArgumentException("회원 정보가 올바르지 않습니다.");

		// 자기 자신에게 친구 요청 방지
		if (request_num.equals(response_num))
			throw new IllegalArgumentException("자기 자신에게 친구 요청을 보낼 수 없습니다.");

		// 중복 친구 요청 확인
		int count = friendDao.checkDuplicate(request_num, response_num);
		if (count > 0)
			throw new IllegalArgumentException("이미 친구이거나 친구 요청이 진행 중입니다.");

		friendDao.add(vo);
        notifications.send(response_num, Category.FRIEND_REQUEST, "새로운 친구 요청",
                "새로운 친구 요청이 도착했습니다. 받은 요청에서 확인해주세요.", "/friend/request");
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
    @Transactional
	public void accept(Long num, Long response_num) {
		int result = friendDao.accept(num, response_num);
		if (result != 1)
			throw new IllegalArgumentException("존재하지 않거나 수락할 수 없는 친구 요청입니다.");
        FriendVO accepted = friendDao.detail(num);
        if (accepted == null || accepted.getRequest_num() == null
                || !response_num.equals(accepted.getResponse_num())) {
            throw new IllegalStateException("수락한 친구 요청을 확인할 수 없습니다.");
        }
        notifications.send(accepted.getRequest_num(), Category.FRIEND_ACCEPTED, "친구 요청이 수락되었습니다",
                "보낸 친구 요청이 수락되었습니다. 내 친구 목록에서 확인해주세요.", "/friend/list");
	}

	// 친구 요청 거절
	public void reject(Long num, Long response_num) {
		int result = friendDao.reject(num, response_num);
		if (result == 0)
			throw new IllegalArgumentException("존재하지 않거나 거절할 수 없는 친구 요청입니다.");
	}

	// 보낸 대기 요청 취소
	public void cancel(Long num, Long requestNum) {
		if (num == null || num <= 0 || requestNum == null || friendDao.cancel(num, requestNum) != 1) {
			throw new IllegalArgumentException("본인이 보낸 대기 중 요청만 취소할 수 있습니다. 요청 상태를 새로 확인해주세요.");
		}
	}

	// 친구 목록
	public List<FriendVO> friendList(Long member_num) {
		return friendDao.friendList(member_num);
	}

	// 친구 삭제
	public void del(Long num, Long member_num) {
		int result = friendDao.del(num, member_num);
		if (result == 0)
			throw new IllegalArgumentException("존재하지 않거나 삭제할 수 없는 친구입니다.");
	}
}
