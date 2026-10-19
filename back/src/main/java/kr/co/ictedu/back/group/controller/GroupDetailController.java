//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;
import kr.co.ictedu.back.group.dto.GroupUpdateDTO;
import kr.co.ictedu.back.group.service.GroupDetailService;


@Tag(name = "스터디룹 상세 API", description = "스터디룸의 상세 정보 및 소속 멤버 조회, 수정, 삭제 API")
@RestController
@RequestMapping("/api/group/detail")
public class GroupDetailController {
	
	@Autowired
	private GroupDetailService service;
	
	@Operation(summary = "스터디룸 헤더 조회", description = "스터디룸의 헤더 영역의 데이터를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "헤더 데이터 조회 성공")
	@ApiResponse(responseCode = "500", description = "헤더 데이터 조회 실패")
	@GetMapping("/{groupNum}")
    public ResponseEntity<GroupDetailHeaderDTO> getHeader(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("groupNum") Long groupNum) {

        return ResponseEntity.ok(
                service.getHeader(memberNum, groupNum)
        );
    }
	
	@Operation(summary = "스터디룸 헤더 조회", description = "스터디룸의 헤더 영역의 데이터를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "헤더 데이터 조회 성공")
	@ApiResponse(responseCode = "500", description = "헤더 데이터 조회 실패")
	@GetMapping("/edit/{groupNum}") 
	public ResponseEntity<GroupUpdateDTO> getUpdateData(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("groupNum") Long groupNum) {

        // 현재 서비스에는 요청자 번호를 받는 인자가 없음
        return ResponseEntity.ok(
                service.getUpdateData(groupNum)
        );
    }
	
	@Operation(summary = "스터디룸 변경", description = "스터디룸의 데이터를 변경합니다.")
	@ApiResponse(responseCode = "200", description = "헤더 데이터 조회 성공")
	@ApiResponse(responseCode = "500", description = "헤더 데이터 조회 실패")
	@PatchMapping(value="/patchGroup/{groupNum}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, Object>> updateGroup(
			@PathVariable("groupNum") Long groupNum, 
			@RequestPart("groupData") GroupUpdateDTO request, 
			@RequestPart(value="thumbnail", required=false) MultipartFile thumbnail) {
		service.updateGroup(groupNum, request, thumbnail);
		Map<String, Object> result = new HashMap<>();
		
		result.put("message", "스터디룸 정보가 수정되었습니다.");
		return ResponseEntity.ok(result);
	}
	
	@Operation(summary = "스터디룸 멤버 조회", description = "스터디룸에 소속된 멤버들의 리스트를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "멤버 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "멤버 리스트 조회 실패")
	@GetMapping("/getMemberlist/{groupNum}")
	 public ResponseEntity<Map<String, Object>> getMembers(
	            @RequestHeader("memberNum") Long memberNum,
	            @PathVariable("groupNum") Long groupNum) {

	        return ResponseEntity.ok(
	                service.getMembers(groupNum, memberNum)
	        );
	    }
	
	@Operation(summary = "방장 위임", description = "자신이 방장일 경우 다른 멤버에게 방장을 위임합니다.")
	@ApiResponse(responseCode = "200", description = "위임 성공")
	@ApiResponse(responseCode = "500", description = "위임 실패")
	@PatchMapping("/transferLeader/{groupNum}/{memberNum}")
	public ResponseEntity<String> transferLeader(
            @RequestHeader("memberNum") Long currentMemberNum,
            @PathVariable("groupNum") Long groupNum,
            @PathVariable("memberNum") Long targetMemberNum) {

        service.transferLeader(
                groupNum,
                currentMemberNum,
                targetMemberNum
        );

        return ResponseEntity.ok("위임 완료.");
    }
	
	@Operation(summary = "멤버 강퇴", description = "자신이 방장일 경우 다른 멤버를 강퇴합니다.")
	@ApiResponse(responseCode = "200", description = "강퇴 성공")
	@ApiResponse(responseCode = "500", description = "강퇴 실패")
	@DeleteMapping("/kickMember/{groupNum}/{memberNum}")
	public ResponseEntity<String> kickMember(
            @RequestHeader("memberNum") Long currentMemberNum,
            @PathVariable("groupNum") Long groupNum,
            @PathVariable("memberNum") Long targetMemberNum) {

        service.kickMember(
                groupNum,
                currentMemberNum,
                targetMemberNum
        );

        return ResponseEntity.ok("강퇴 완료.");
    }
	
	@Operation(summary = "스터디룸 탈퇴", description = "현재 입장한 스터디룸을 탈퇴합니다.")
	@ApiResponse(responseCode = "200", description = "탈퇴 성공")
	@ApiResponse(responseCode = "500", description = "탈퇴 실패")
	@DeleteMapping("/groupQuit/{groupNum}")
	public ResponseEntity<String> groupQuit(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("groupNum") Long groupNum) {

        service.groupQuit(groupNum, memberNum);

        return ResponseEntity.ok("탈퇴 완료.");
    }
	
	@Operation(summary = "스터디룸 삭제", description = "자신이 방장이고 남은 인원이 본인 제외 0명인 경우 스터디룸을 삭제합니다.")
	@ApiResponse(responseCode = "200", description = "삭제 성공")
	@ApiResponse(responseCode = "500", description = "삭제 실패")
	@DeleteMapping("/deleteGroup/{groupNum}")
	public ResponseEntity<String> deleteGroup(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("groupNum") Long groupNum) {

        service.deleteGroup(groupNum, memberNum);

        return ResponseEntity.ok("탈퇴 완료.");
    }
}
