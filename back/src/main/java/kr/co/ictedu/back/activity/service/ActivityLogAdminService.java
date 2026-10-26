// 허승표

package kr.co.ictedu.back.activity.service;

import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.activity.dao.ActivityLogDAO;
import kr.co.ictedu.back.activity.dto.ActivityLogListResponse;
import kr.co.ictedu.back.activity.dto.ActivityLogSearchRequest;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityauth.MemberRoles;

@Service
public class ActivityLogAdminService {
	
	private static final ZoneId KOREA = ZoneId.of("Asia/Seoul");
	
	@Autowired
	private ActivityLogDAO activityLogDao;
	
	@Autowired
	private MemberDAO memberDao;
	
	@Autowired
	private PagingService pagingService;

	@Transactional(readOnly = true)
	public ActivityLogListResponse list(Authentication authentication, 
			ActivityLogSearchRequest request) {
		
		// 1. 서버에서 관리자 권한을 확인합니다.
		requireManager(authentication);
		
		// 2. 검색 조건을 확인합니다.
		validate(request);
		
		// 3. Mapper로 전달할 검색 조건을 만듭니다.
		Map<String, Object> params = new HashMap<>();
		
		params.put("memberNum", request.getMemberNum());
		params.put("category", request.getCategory());
		params.put("result", request.getResult());
		
		// 시작일 00:00 이상
		if (request.getStartDate() != null) {
			params.put("startAt", request.getStartDate().atStartOfDay(KOREA).toOffsetDateTime());
		}
		
		// 종료일 다음날 00:00 미만
		if (request.getEndDate() != null) {
			params.put("endBefore", request.getEndDate().plusDays(1).atStartOfDay(KOREA).toOffsetDateTime());
		}
		
		// 4. 검색 결과 전체 건수를 조회합니다.
		int totalCount = activityLogDao.countActivityLogs(params);
		
		// 5. 기존 프로젝트의 페이지 계산 기능을 사용합니다.
		PageVO page = pagingService.makePage(totalCount, String.valueOf(request.getCPage()));
		
		// 삭제 등으로 마지막 페이지가 줄어들었을 때 보정합니다.
		int lastPage = Math.max(1, page.getTotalPage());
		
		if (page.getNowPage() > lastPage) {
			page = pagingService.makePage(totalCount, String.valueOf(lastPage));
		}
		
		// 6. 조회할 행 번호 범위를 추가합니다.
		params.put("begin", page.getBeginPerPage());
		params.put("end", page.getEndPerPage());
		
		// 7. 목록과 페이지 정보를 응답에 담습니다.
		ActivityLogListResponse response = new ActivityLogListResponse();
		response.setLogs(activityLogDao.selectActivityLogs(params));
		response.setPage(page);
		
		return response;
	}

	private void requireManager(Authentication auth) {
		if (auth == null
				|| !auth.isAuthenticated()
				|| auth instanceof AnonymousAuthenticationToken) {
			throw new ResponseStatusException(
					HttpStatus.UNAUTHORIZED,
					"로그인이 필요합니다."
			);
		}
	
		// 토큰의 사용자 이름으로 실제 회원을 조회합니다.
		MemberVO member = memberDao.getMemberByEmail(auth.getName());
		if (member == null) {
			throw new ResponseStatusException(
					HttpStatus.UNAUTHORIZED,
					"회원 정보를 확인할 수 없습니다."
			);
		}
		
		// 기존 프로젝트 기준: ADMIN 또는 SUB_ADMIN
		if (!MemberRoles.isManager(member.getAuthority())) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN,
					"관리자 권한이 필요합니다."
			);
		}
	}
	
	private void validate(ActivityLogSearchRequest request) {
		// 기존 PagingService는 페이지당 10건이며 int로 계산합니다.
		if (request.getCPage() < 1
				|| request.getCPage() > Integer.MAX_VALUE / 10) {
			throw badRequest("페이지 번호를 확인해주세요.");
		}
		
		if (request.getMemberNum() != null
				&& request.getMemberNum() <= 0) {
			throw badRequest("회원 번호를 확인해주세요.");
		}
		
		String category = emptyToNull(request.getCategory());
		String result = emptyToNull(request.getResult());
		
		if (category != null
				&& (category.length() > 40
						|| !category.matches("[A-Z][A-Z0-9_]*"))) {
			throw badRequest("카테고리 코드를 확인해주세요.");
		}
		
		if (result != null
				&& !"SUCCESS".equals(result)
				&& !"FAILURE".equals(result)) {
			throw badRequest("결과는 SUCCESS 또는 FAILURE여야 합니다.");
		}
		
		request.setCategory(category);
		request.setResult(result);
		
		if (request.getStartDate() != null
				&& request.getEndDate() != null
				&& request.getStartDate().isAfter(request.getEndDate())) {
			throw badRequest("시작일은 종료일보다 늦을 수 없습니다.");
		}
		
		// Oracle 날짜 범위와 종료일 + 1일 계산을 보호합니다.
		if (request.getStartDate() != null
				&& (request.getStartDate().getYear() < 1
						|| request.getStartDate().getYear() > 9999)) {
			throw badRequest("시작일을 확인해주세요.");
		}
		
		if (request.getEndDate() != null
				&& (request.getEndDate().getYear() < 1
						|| request.getEndDate().getYear() > 9998)) {
			throw badRequest("종료일을 확인해주세요.");
		}
	}

	private String emptyToNull(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private ResponseStatusException badRequest(String message) {
		return new ResponseStatusException(
				HttpStatus.BAD_REQUEST,
				message
		);
	}
}
