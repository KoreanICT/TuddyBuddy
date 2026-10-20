package kr.co.ictedu.back.activity.aop;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import kr.co.ictedu.back.activity.service.ActivityLogService;
import kr.co.ictedu.back.activity.vo.ActivityLogVO;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Aspect
@Component
public class ActivityLogAspect {

	private static final Logger log = LoggerFactory.getLogger(ActivityLogAspect.class);

	@Autowired
	private ActivityLogService activityLogService;

	@Autowired
	private MemberDAO memberDAO;

	
    // =====================================================
    // 1. 그룹: 생성·가입·목록
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.group.controller.GroupController.*(..))"
	)
	public Object groupActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "addGroup" -> "GROUP_CREATE";
			case "joinByInviteCode" -> "GROUP_JOIN";
			case "getMyGroups" -> "GROUP_MY_LIST";
			case "getPublicGroups" -> "GROUP_PUBLIC_LIST";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}

    // =====================================================
    // 2. 그룹 상세·수정·관리
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.group.controller.GroupDetailController.*(..))"
	)
	public Object groupDetailActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "getHeader" -> "GROUP_DETAIL_VIEW";
			case "getUpdateData" -> "GROUP_EDIT_FORM_VIEW";
			case "getMembers" -> "GROUP_MEMBER_LIST";
			case "updateGroup" -> "GROUP_UPDATE";
			case "transferLeader" -> "GROUP_LEADER_TRANSFER";
			case "kickMember" -> "GROUP_LEAVE";
			case "groupQuit" -> "GROUP_LEAVE";
			case "deleteGroup" -> "GROUP_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}
	
    // =====================================================
    // 3. 문서
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.group.controller.DocumentController.*(..))"
	)
	public Object documentActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "addDocument" -> "DOCUMENT_UPLOAD";
			case "getDocuments" -> "DOCUMENT_LIST";
			case "downloadDocument" -> "DOCUMENT_DOWNLOAD_REQUEST";
			case "getPatchDocument" -> "DOCUMENT_EDIT_FORM_VIEW";
			case "patchDocument" -> "DOCUMENT_UPDATE";
			case "deleteDocument" -> "DOCUMENT_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}
	
    // =====================================================
    // 4. 메모
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.group.controller.MemoController.*(..))"
	)
	public Object memoActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "addMemo" -> "MEMO_CREATE";
			case "getMemos" -> "MEMO_LIST";
			case "patchMemo" -> "MEMO_UPDATE";
			case "deleteMemo" -> "MEMO_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}
	
    // =====================================================
    // 5. 다이어그램
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.group.controller.DiagramController.*(..))"
	)
	public Object diagramActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "addDiagram" -> "DIAGRAM_SAVE";
			case "getDiagram" -> "DIAGRAM_VIEW";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}
	
    // =====================================================
    // 6. 학습: AI 생성, 답안 제출, 이력, 삭제
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.selfstudy.controller.SelfStudyController.*(..))"
	)
	public Object selfStudyActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "generateQuiz" -> "QUIZ_GENERATE";
			case "submitQuiz" -> "QUIZ_SUBMIT";
			case "getSessions" -> "QUIZ_SESSION_LIST";
			case "getSession" -> "QUIZ_SESSION_VIEW";
			case "getQuizzes" -> "QUIZ_LIST";
			case "getResults" -> "QUIZ_RESULT_LIST";
			case "getResult" -> "QUIZ_RESULT_VIEW";
			case "getResponses" -> "QUIZ_RESULT_VIEW";
			case "deleteSession" -> "QUIZ_SESSION_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "SELFSTUDY", action);
	}
	
    // =====================================================
    // 7. 타이머
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.timer.controller.TimerController.*(..))"
	)
	public Object timerActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "create" -> "TIMER_SESSION_CREATE";
			case "save" -> "TIMER_SESSION_SAVE";
			case "summary" -> "TIMER_SUMMARY_VIEW";
			default -> null;
		};
		return recordSelectedActivity(jp, "TIMER", action);
	}
	
    // =====================================================
    // 8. 챗봇: 질문 처리, 대화 생성, 이력 조회
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.chatbot.controller.ChatController.*(..))"
	)
	public Object chatActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "askAI" -> "CHAT_MESSAGE_PROCESS";
			case "addSession" -> "CHAT_SESSION_CREATE";
			case "detailSession" -> "CHAT_SESSION_VIEW";
			case "listSession" -> "CHAT_SESSION_LIST";
			case "messageList" -> "CHAT_MESSAGE_LIST";
			case "memberMessageList" -> "CHAT_MEMBER_MESSAGE_LIST";
			default -> null;
		};
		return recordSelectedActivity(jp, "CHATBOT", action);
	}
	
    // =====================================================
    // 9. 친구
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.friend.controller.FriendController.*(..))"
	)
	public Object friendActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "friendAdd" -> "FRIEND_REQUEST";
			case "friendAccept" -> "FRIEND_ACCEPT";
			case "friendReject" -> "FRIEND_REJECT";
			case "friendDelete" -> "FRIEND_DELETE";
			case "friendList" -> "FRIEND_LIST";
			case "friendRequestList" -> "FRIEND_RECEIVED_LIST";
			case "friendResponseList" -> "FRIEND_SENT_LIST";
			case "friendDetail" -> "FRIEND_DETAIL_VIEW";
			default -> null;
		};
		return recordSelectedActivity(jp, "FRIEND", action);
	}
	
    // =====================================================
    // 10. 신고, 답변
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.report.controller.ReportController.*(..))"
	)
	public Object reportActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "reportAdd" -> "REPORT_CREATE";
			case "myReportList" -> "REPORT_MY_LIST";
			case "reportList" -> "REPORT_ADMIN_LIST";
			case "reportDetail" -> "REPORT_DETAIL_VIEW";
			case "reportTargetDetail" -> "REPORT_TARGET_VIEW";
			case "reportUpdate" -> "REPORT_UPDATE";
			case "reportDelete" -> "REPORT_DELETE";
			case "reportStatusUpdate" -> "REPORT_STATES_CHANGE";
			case "reportReplyAdd" -> "REPORT_REPLY_CREATE";
			case "reportReplyList" -> "REPORT_REPLY_LIST";
			case "reportReplyDetail" -> "REPORT_REPLY_VIEW";
			case "reportReplyUpdate" -> "REPORT_REPLY_UPDATE";
			case "reportReplyDelte" -> "REPORT_REPLY_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "REPORT", action);
	}
	
    // =====================================================
    // 11. 공지사항
    // =====================================================	
	@Around(
			"execution(* kr.co.ictedu.back.notice.controller.NoticeController.*(..))"
	)
	public Object noticeActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "upboardAdd" -> "NOTICE_CREATE";
			case "upboardList" -> "NOTICE_LIST";
			case "upboardDetail" -> "NOTICE_DETAIL";
			case "upboardDelete" -> "NOTICE_DELETE";
			case "upboardUpdate" -> "NOTICE_UPDATE";
			default -> null;
		};
		return recordSelectedActivity(jp, "NOTICE", action);
	}

	
	private Object recordSelectedActivity(ProceedingJoinPoint jp, String string, String action) {
		// TODO Auto-generated method stub
		return null;
	}

	// 공통 실행 처리
	private Object recordActivity(ProceedingJoinPoint jp, String category, String action) throws Throwable {
		Long memberNum = findMemberNum();

		Object response;

		try {
			// 기존 Controller와 업무 Service 실행
			response = jp.proceed();

		} catch (Throwable e) {
			saveLog(memberNum, category, action, "FAILURE");

			// 원래 업무 응답 유지
			throw e;
		}

		// 정상 반환한 응답도 HTTP 상태를 확인
		String result = "SUCCESS";

		if (response instanceof ResponseEntity<?> entity && !entity.getStatusCode().is2xxSuccessful()) {
			result = "FAILURE";
		}

		saveLog(memberNum, category, action, result);

		// 원래 업무 응답 유지
		return response;
	}
	
	// 서버 인증 정보에서 회원 번호 조회
	private Long findMemberNum() {
		try {
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			
			if (auth == null
					|| !auth.isAuthenticated()
					|| auth instanceof AnonymousAuthenticationToken) {
				return null;
			}
			
			MemberVO member = memberDAO.getMemberByEmail(auth.getName());
			
			return member == null
					? null : member.getMember_num();
		} catch (Exception e) {
			log.warn("활동 로그 회원 확인 실패");
			return null;
		}
	}
	
	// 로그 데이터 구성 및 비동기 전달
	private void saveLog(Long memberNum, String category, String action, String result) {
		try {
			if (memberNum == null || memberNum <= 0) {
				return;
			}
			
			ActivityLogVO vo = new ActivityLogVO();
			
			vo.setMember_num(memberNum);
			
			vo.setActivity_occurred_at(OffsetDateTime.now(ZoneOffset.UTC));
			
			vo.setActivity_category(category);
			vo.setActivity_action(action);
			vo.setActivity_result(result);
			
			activityLogService.save(vo);
			
		} catch (Exception e) {
			// 작업 전달 실패도 원래 업무에 전파하지 않음
			log.warn("활동 로그 전달 실패");
		}
	}
}
