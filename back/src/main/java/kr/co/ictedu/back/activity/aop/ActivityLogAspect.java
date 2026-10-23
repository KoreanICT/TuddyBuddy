// 허승표

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

//WebSocket 요청에 전달된 로그인 사용자 정보를 확인합니다.
import java.security.Principal;

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
	@Around("execution(* kr.co.ictedu.back.group.controller.GroupController.*(..))")
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
	@Around("execution(* kr.co.ictedu.back.group.controller.GroupDetailController.*(..))")
	public Object groupDetailActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "getHeader" -> "GROUP_DETAIL_VIEW";
			case "getUpdateData" -> "GROUP_EDIT_FORM_VIEW";
			case "getMembers" -> "GROUP_MEMBER_LIST";
			case "updateGroup" -> "GROUP_UPDATE";
			case "transferLeader" -> "GROUP_LEADER_TRANSFER";
			case "kickMember" -> "GROUP_MEMBER_KICK";
			case "groupQuit" -> "GROUP_LEAVE";
			case "deleteGroup" -> "GROUP_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}

	// =====================================================
	// 2-1. 그룹 일정 등록·조회·수정·삭제
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.group.controller.ScheduleController.*(..))")
	public Object scheduleActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "addSchedule" -> "SCHEDULE_CREATE";
			case "getEvents" -> "SCHEDULE_LIST";
			case "updateSchedule" -> "SCHEDULE_UPDATE";
			case "deleteSchedule" -> "SCHEDULE_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}

	// =====================================================
	// 2-2. 그룹 할 일 등록·조회·내용 수정·상태 변경
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.group.controller.TdlController.*(..))")
	public Object tdlActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
	        case "addTdl" -> "TDL_CREATE";
	        // 현재 할 일 목록 조회 메서드의 실제 이름입니다.
	        case "getMethodName" -> "TDL_LIST";
	        case "updateTdlStatus" -> "TDL_STATUS_CHANGE";
	        case "updateTdl" -> "TDL_UPDATE";
			default -> null;
		};
		return recordSelectedActivity(jp, "GROUP", action);
	}
	
	// =====================================================
	// 3. 문서
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.group.controller.DocumentController.*(..))")
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
	@Around("execution(* kr.co.ictedu.back.group.controller.MemoController.*(..))")
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
	@Around("execution(* kr.co.ictedu.back.group.controller.DiagramController.*(..))")
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
	@Around("execution(* kr.co.ictedu.back.selfstudy.controller.SelfStudyController.*(..))")
	public Object selfStudyActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "generateQuiz" -> "QUIZ_GENERATE";
			case "submitQuiz" -> "QUIZ_SUBMIT";
			case "getSessions" -> "QUIZ_SESSION_LIST";
			case "getSession" -> "QUIZ_SESSION_VIEW";
			case "getQuizzes" -> "QUIZ_LIST";
			case "getResults" -> "QUIZ_RESULT_LIST";
			case "getResult" -> "QUIZ_RESULT_VIEW";
			case "getResponses" -> "QUIZ_RESPONSE_LIST";
			case "deleteSession" -> "QUIZ_SESSION_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "SELFSTUDY", action);
	}

	// =====================================================
	// 7. 타이머
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.timer.controller.TimerController.*(..))")
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
	@Around("execution(* kr.co.ictedu.back.chatbot.controller.ChatController.*(..))")
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
	@Around("execution(* kr.co.ictedu.back.friend.controller.FriendController.*(..))")
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
			case "friendCancel" -> "FRIEND_REQUEST_CANCEL";
			default -> null;
		};
		return recordSelectedActivity(jp, "FRIEND", action);
	}

	// =====================================================
	// 10. 신고, 답변
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.report.controller.ReportController.*(..))")
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
			case "reportReplyDelete" -> "REPORT_REPLY_DELETE";
			case "reportStatistics" -> "REPORT_STATISTICS_VIEW";
			default -> null;
		};
		return recordSelectedActivity(jp, "REPORT", action);
	}

	// =====================================================
	// 11. 공지사항
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.notice.controller.NoticeController.*(..))")
	public Object noticeActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "upboardAdd" -> "NOTICE_CREATE";
			case "upBoardList" -> "NOTICE_LIST";
			case "boardDetail" -> "NOTICE_DETAIL";
			case "boardDelete" -> "NOTICE_DELETE";
			case "noticeUpdate" -> "NOTICE_UPDATE";
			default -> null;
		};
		return recordSelectedActivity(jp, "NOTICE", action);
	}

	// =====================================================
	// 12. 회원 정보·관리자 회원 관리
	// 로그인·로그아웃·가입·본인 탈퇴는 기록하지 않음
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.member.controller.MemberController.*(..))")
	public Object memberActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "getMyInfo" -> "MEMBER_INFO_VIEW";
			case "updateMyInfo" -> "MEMBER_PROFILE_UPDATE";
			case "changePassword" -> "MEMBER_PASSWORD_CHANGE";
			case "memberCodeSearch" -> "MEMBER_CODE_SEARCH";
			case "memberProfile" -> "MEMBER_PROFILE_VIEW";
			case "memberList" -> "ADMIN_MEMBER_LIST";
			case "withdrawManagedMember" -> "ADMIN_MEMBER_WITHDRAW";
			case "updateAuthority" -> "ADMIN_MEMBER_AUTHORITY_CHANGE";
			default -> null;
		};
		return recordSelectedActivity(jp, "MEMBER", action);
	}

	// =====================================================
	// 13. 통계 조회
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.statistics.controller.StatisticsController.getStatistics(..))")
	public Object statisticsView(ProceedingJoinPoint jp) throws Throwable {

		return recordActivity(jp, "STATISTICS", "STATISTICS_VIEW");
	}

	// =====================================================
	// 14. 관리자 학습 설정
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.selfstudy.controller.SelfStudyAdminController.*(..))")
	public Object selfStudyAdminActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
			case "createCategory" -> "ADMIN_CATEGORY_CREATE";
			case "updateCategory" -> "ADMIN_CATEGORY_UPDATE";
			case "updateCategoryStatus" -> "ADMIN_CATEGORY_STATUS_CHANGE";
			case "createSubject" -> "ADMIN_SUBJECT_CREATE";
			case "updateSubject" -> "ADMIN_SUBJECT_UPDATE";
			case "updateSubjectStatus" -> "ADMIN_SUBJECT_STATUS_CHANGE";
			case "getUsage" -> "ADMIN_SELFSTUDY_USAGE_VIEW";
			default -> null;
		};
		return recordSelectedActivity(jp, "SELFSTUDY", action);
	}

	// =====================================================
	// 15. 출석 체크·월별 출석 조회
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.attendance.controller.AttendanceController.*(..))")
	public Object attendanceActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
	        case "check" -> "ATTENDANCE_CHECK";
	        case "getMonth" -> "ATTENDANCE_MONTH_VIEW";
			default -> null;
		};
		return recordSelectedActivity(jp, "ATTENDANCE", action);
	}

	// =====================================================
	// 16. 커뮤니티
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.common.controller.CommunityController.*(..))")
	public Object communityActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
	        case "writePost" -> "COMMUNITY_POST_CREATE";
	        case "posts" -> "COMMUNITY_POST_LIST";
	        case "myPosts" -> "COMMUNITY_MY_POST_LIST";
	        case "updatePost" -> "COMMUNITY_POST_UPDATE";
	        case "deletePost" -> "COMMUNITY_POST_DELETE";
	        case "like" -> "COMMUNITY_POST_LIKE";
			default -> null;
		};
		return recordSelectedActivity(jp, "COMMUNITY", action);
	}

	// =====================================================
	// 17. 알림 조회·읽음 처리
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.notification.controller.NotificationController.*(..))")
	public Object notificationActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
	        case "getUnreadNotifications" -> "NOTIFICATION_UNREAD_LIST";
	        case "getAllNotification" -> "NOTIFICATION_LIST";
	        case "readNotification" -> "NOTIFICATION_READ";
	        case "readAll" -> "NOTIFICATION_READ_ALL";
			default -> null;
		};
		return recordSelectedActivity(jp, "NOTIFICATION", action);
	}
	
	// =====================================================
	// 18. 포인트
	// 현재 Controller가 실패도 문자열로 반환하므로 별도 판정
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.point.controller.PointContoller.pointAdd(..))")
	public Object pointPayment(ProceedingJoinPoint jp) throws Throwable {
		Long memberNum = findMemberNum();

		Object response;

		try {
			response = jp.proceed();
		} catch (Throwable e) {
			saveLog(memberNum, "POINT", "POINT_PAYMENT", "FAILURE");
			throw e;
		}

		String result = "FAILURE";

		if (response instanceof String text && text.endsWith(" 처리완료")) {
			result = "SUCCESS";
		}

		saveLog(memberNum, "POINT", "POINT_PAYMENT", result);

		return response;
	}

	// =====================================================
	// 19. 교육 뉴스 조회
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.educationnews.controller.EducationNewsController.getEducationNews(..))")
	public Object educationNewsActivities(ProceedingJoinPoint jp) throws Throwable {
		return recordActivity(jp, "EDUCATION_NEWS", "EDUCATION_NEWS_LIST");
	}

	// =====================================================
	// 20. 관리자 대시보드 조회
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.admin.controller.DashboardController.overview(..))")
	public Object dashboardActivities(ProceedingJoinPoint jp) throws Throwable {
		return recordActivity(jp, "ADMIN", "ADMIN_DASHBOARD_VIEW");
	}

	// =====================================================
	// 21. 커뮤니티 - 댓글
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.common.controller.CommentController.*(..))")
	public Object communityCommentActivities(ProceedingJoinPoint jp) throws Throwable {
		String action = switch (jp.getSignature().getName()) {
        case "getComments" -> "COMMUNITY_COMMENT_LIST";
        case "createComment" -> "COMMUNITY_COMMENT_CREATE";
        case "updateComment" -> "COMMUNITY_COMMENT_UPDATE";
        case "deleteComment" -> "COMMUNITY_COMMENT_DELETE";
			default -> null;
		};
		return recordSelectedActivity(jp, "COMMUNITY", action);
	}

	// =====================================================
	// 22. 그룹 개요
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.group.controller.OverviewController.getUpcomingSchedules(..))")
	public Object groupUpcomingScheduleActivity(ProceedingJoinPoint jp) throws Throwable {

		return recordSelectedActivity(jp, "GROUP", "GROUP_UPCOMING_SCHEDULE_VIEW");
	}	

	// =====================================================
	// 23. 그룹 채팅 이전 대화
	// 그룹 채팅의 이전 메시지를 조회하는 HTTP 요청입니다.
	// 내 닉네임 조회는 보조 요청이므로 기록하지 않습니다.
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.groupchat.controller.GroupChatRestController.getHistory(..))")
	public Object groupChatHistoryActivity(ProceedingJoinPoint jp) throws Throwable {

		return recordSelectedActivity(jp, "GROUP", "GROUP_CHAT_HISTORY_VIEW");
	}		
	
	// =====================================================
	// 24. 그룹 채팅 메시지 전송 처리
	// =====================================================
	@Around("execution(* kr.co.ictedu.back.groupchat.controller.GroupChatController.handleChatMessage(..))")
	public Object groupChatMessageActivity(ProceedingJoinPoint jp) throws Throwable {
		
		// WebSocket은 Controller에 전달된 Principal로 회원을 확인합니다.
		Long memberNum = findGroupChatMemberNum(jp);
		
		Object response;
		
		try {
			// 기존 채팅 Controller와 Service를 실행합니다.
			// Service가 메시지 저장을 완료하면 정상 반환합니다.
			response = jp.proceed();
		} catch (Throwable e) {
			// 채팅 처리에서 예외가 발생하면 실패 로그를 요청합니다.
			// 기존 saveLog()가 로그 전달 오류를 처리합니다.
			saveLog(memberNum, "GROUP", "GROUP_CHAT_MESSAGE_SEND", "FAILURE");
			// 기존 채팅의 예외 처리는 그대로 유지합니다.
			throw e;
		}
		
		// 메시지 저장 Service가 정상 반환한 경우 성공을 기록합니다.
		saveLog(memberNum, "GROUP", "GROUP_CHAT_MESSAGE_SEND", "SUCCESS");
		// 기존 채팅 메시지를 그대로 반환합니다.
		return response;
	}	
	
	
	// =====================================================
	// 공통 처리 1: 기록 대상 여부 확인
	// =====================================================
	private Object recordSelectedActivity(ProceedingJoinPoint jp, String category, String action) throws Throwable {
		// switch에 지정하지 않은 메서드는 로그 없이 원래 실행
		if (action == null) {
			return jp.proceed();
		}
		return recordActivity(jp, category, action);
	}

	// =====================================================
	// 공통 처리 2: 기존 기능 실행 및 성공·실패 판단
	// =====================================================
	private Object recordActivity(ProceedingJoinPoint jp, String category, String action) throws Throwable {
		Long memberNum = findMemberNum();

		Object response;

		try {
			// 기존 controller와 업무 service 실행
			response = jp.proceed();
		} catch (Throwable e) {
			saveLog(memberNum, category, action, "FAILURE");
			// 원래 업무 예외를 그대로 전달
			throw e;
		}

		String result = "SUCCESS";

		if (response instanceof ResponseEntity<?> entity && !entity.getStatusCode().is2xxSuccessful()) {
			result = "FAILURE";
		}
		saveLog(memberNum, category, action, result);

		// 원래 업무 응답 유지
		return response;
	}

	// =====================================================
	// 공통 처리 3: 인증된 회원 번호 확인
	// =====================================================
	private Long findMemberNum() {
		try {
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();

			if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
				return null;
			}

			MemberVO member = memberDAO.getMemberByEmail(auth.getName());

			return member == null ? null : member.getMember_num();
		} catch (Exception e) {
			// 회원 확인 실패가 기존 기능을 막지 않도록 처리
			log.warn("활동 로그 회원 확인 실패");
			return null;
		}
	}

	// =====================================================
	// 공통 처리 4: 그룹 채팅용 회원 번호 확인
	// =====================================================
	private Long findGroupChatMemberNum(ProceedingJoinPoint jp) {
		try {
			// Controller에 전달된 인수 중 Principal을 찾습니다.
			for (Object argument: jp.getArgs()) {
				if (argument instanceof Principal principal) {
					// 현재 프로젝트의 Principal 이름은 회원 이메일입니다.
					MemberVO member = memberDAO.getMemberByEmail(principal.getName());
					return member == null ? null : member.getMember_num();
				}
			}
		} catch (Exception e) {
			// 로그용 회원 조회 실패가 채팅 기능을 막지 않도록 합니다.
			log.warn("그룹 채팅 활동 로그 회원 확인 실패");
		}
		// 회원을 확인할 수 없으면 기존 saveLog()에서 저장을 생략합니다.
		return null;
	}

	
	// =====================================================
	// 공통 처리 5: VO 생성 및 비동기 저장 요청
	// =====================================================
	private void saveLog(Long memberNum, String category, String action, String result) {
		try {
			// 비회원, 회원 식별 불가 요청은 저장하지 않음
			if (memberNum == null || memberNum <= 0) {
				return;
			}

			ActivityLogVO vo = new ActivityLogVO();

			vo.setMember_num(memberNum);

			vo.setActivity_occurred_at(OffsetDateTime.now(ZoneOffset.UTC));

			vo.setActivity_category(category);
			vo.setActivity_action(action);
			vo.setActivity_result(result);

			// activity_log_num은 DB 시퀀스에서 생성
			activityLogService.save(vo);

		} catch (Exception e) {
			// 로그 작업 전달 실패가 기능에 영향을 주지 않음
			log.warn("활동 로그 전달 실패");
		}
	}
}