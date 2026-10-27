// back/src/main/java/kr/co/ictedu/back/roomchat/RoomChatService.java

package kr.co.ictedu.back.groupchat.service;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.groupchat.dao.GroupChatDao;
import kr.co.ictedu.back.groupchat.vo.GroupChatVO;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class GroupChatService {

	@Autowired
    private GroupChatDao dao;
	
	@Autowired
    private MemberDAO memberDAO;

	@Transactional
	public GroupChatVO saveMessage(
	        Long groupNum,
	        GroupChatVO request,
	        Principal principal) {

	    MemberVO member = requireGroupMember(groupNum, principal);

	    if (request == null || request.getValue() == null) {
	        throw new IllegalArgumentException("메시지를 입력하세요.");
	    }

	    String value = request.getValue().trim();

	    if (value.isEmpty() || value.length() > 1000) {
	        throw new IllegalArgumentException(
	            "메시지는 1~1000자로 입력하세요."
	        );
	    }

	    GroupChatVO message = new GroupChatVO();
	    message.setGroup_num(groupNum);
	    message.setMember_num(member.getMember_num());
	    message.setMember_nick(member.getMember_nick());
	    message.setState(1);
	    message.setValue(value);

	    if (dao.insertMessage(message) != 1) {
	        throw new IllegalStateException("메시지 저장에 실패했습니다.");
	    }

	    // DB가 생성한 시각과 메시지 번호를 포함해 반환합니다.
	    GroupChatVO saved = dao.getMessage(message.getChat_num());

	    if (saved == null) {
	        throw new IllegalStateException("저장한 메시지를 확인할 수 없습니다.");
	    }

	    return saved;
	}
	
	public List<GroupChatVO> getHistory(Long groupNum, Long beforeChatNum, Principal principal) {

	    // 기록 조회도 반드시 소속 멤버인지 검사합니다.
	    requireGroupMember(groupNum, principal);

	    if (beforeChatNum != null && beforeChatNum <= 0) {
	        throw new IllegalArgumentException(
	            "올바르지 않은 메시지 번호입니다."
	        );
	    }

	    return dao.getHistory(groupNum, beforeChatNum);
	}
	
    public MemberVO requireMember(Principal principal) {
        if (principal == null) {
            throw new AccessDeniedException("로그인이 필요합니다.");
        }

        // 기존 프로젝트의 JWT subject는 회원 이메일입니다.
        MemberVO member = memberDAO.getMemberByEmail(principal.getName());

        if (member == null || member.getMember_num() == null) {
            throw new AccessDeniedException("회원 정보를 확인할 수 없습니다.");
        }

        return member;
    }

    public MemberVO requireGroupMember(Long groupNum, Principal principal) {
        MemberVO member = requireMember(principal);

        if (groupNum == null || groupNum <= 0
                || dao.countGroupMember(groupNum, member.getMember_num()) == 0) {
            throw new AccessDeniedException("해당 스터디룸 멤버만 이용할 수 있습니다.");
        }

        return member;
    }

    public Map<String, Object> getMemberNick(Principal principal) {
        MemberVO member = requireMember(principal);

        Map<String, Object> result = new HashMap<>();
        result.put("memberNum", member.getMember_num());
        result.put("memberNick", dao.getMemberNick(member.getMember_num()));
        return result;
    }
}