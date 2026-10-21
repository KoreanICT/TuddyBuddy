// 허승표

package kr.co.ictedu.back.activity.controller;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.ictedu.back.activity.dto.ActivityLogListResponse;
import kr.co.ictedu.back.activity.dto.ActivityLogSearchRequest;
import kr.co.ictedu.back.activity.service.ActivityLogAdminService;


@RestController
@RequestMapping("/api/admin/activity-logs")
@Tag(name = "관리자 활동 로그", description = "회원의 기능 실행 성공·실패 기록 조회")
public class ActivityLogAdminController {

	@Autowired
	private ActivityLogAdminService activityLogAdminService;

	@GetMapping
	@Operation(summary = "사용자 활동 로그 조회", description = "회원 번호, 카테고리, 성공·실패, 기간으로 검색합니다."
			+ "최신순으로 페이지당 10건을 반환합니다."
			+ "최고 관지라와 부관리자만 조회할 수 있습니다.")
	@ApiResponse(responseCode = "200", description = "조회 성공")
	@ApiResponse(responseCode = "400", description = "검색 조건 오류")
	@ApiResponse(responseCode = "401", description = "로그인 필요")
	@ApiResponse(responseCode = "403", description = "관리자 권한 필요")
	public ResponseEntity<ActivityLogListResponse> list(Authentication authentication,
			// 주소 뒤의 검색 조건을 DTO에 담습니다.
			@ParameterObject
			@ModelAttribute ActivityLogSearchRequest request) {
		ActivityLogListResponse response = activityLogAdminService.list(
					authentication,
					request
				);
		
		// 관리자 로그가 브라우저 캐시에 날지 않도록 설정합니다.
		return ResponseEntity.ok()
				.cacheControl(CacheControl.noStore())
				.body(response);
	}
}
