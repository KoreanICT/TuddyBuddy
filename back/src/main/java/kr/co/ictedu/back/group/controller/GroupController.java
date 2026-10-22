//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.GroupCreateRequest;
import kr.co.ictedu.back.group.dto.GroupInviteRequest;
import kr.co.ictedu.back.group.dto.GroupListDTO;
import kr.co.ictedu.back.group.dto.PublicGroupListDTO;
import kr.co.ictedu.back.group.service.GroupService;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Tag(name = "그룹 API", description = "그룹 생성, 공개 및 비공개 그룹 조회, 초대코드로 그룹 참가 API")
@RestController
@RequestMapping("/api/group")
public class GroupController {

    @Autowired
    private GroupService service;
    
    @Operation(summary = "그룹 태그 조회", description = "그룹 태그 조회")
	@ApiResponse(responseCode = "200", description = "그룹 태그 조회 성공")
	@ApiResponse(responseCode = "500", description = "그룹 태그 조회 실패")
    @GetMapping("/tags/search")
    public ResponseEntity<List<TagVO>> searchTags(
            @RequestParam("keyword") String keyword) {

        return ResponseEntity.ok(
                service.searchTags(keyword)
        );
    }

    @Operation(summary = "자신의 그룹 리스트 조회", description = "자신이 소속된 그룹들의 리스트를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "그룹 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "그룹 리스트 조회 실패")
    @GetMapping("/getmyrooms")
    public ResponseEntity<List<GroupListDTO>> getMyGroups(
            @RequestHeader("memberNum") Long memberNum) {
    	
    	System.out.println("멤버 번호" + memberNum);
    	List<GroupListDTO> list = service.getMyGroups(memberNum);
    	System.out.println("응답 :" + list);
        return ResponseEntity.ok(
                list
        );
    }
    
    @Operation(summary = "공개된 그룹 리스트 조회", description = "공개된 그룹들의 리스트를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "그룹 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "그룹 리스트 조회 실패")
    @GetMapping("/getpublicrooms")
    public ResponseEntity<List<PublicGroupListDTO>> getPublicGroups(
            @RequestHeader(
                    value = "memberNum",
                    required = false
            ) Long memberNum) {

        // 비로그인 요청은 memberNum이 null
        return ResponseEntity.ok(
                service.getPublicGroups(memberNum)
        );
    }
    
    //스터디 그룹 생성
    @Operation(summary = "스터디그룹 생성", description = "스터디 그룹을 thumbnail과 데이터를 별개로 저장합니다.")
	@ApiResponse(responseCode = "200", description = "스터디그룹 생성 성공")
	@ApiResponse(responseCode = "500", description = "스터디그룹 생성 실패")
    @PostMapping(value="/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> addGroup(
            @RequestHeader("memberNum") Long memberNum,
            @RequestPart("groupData") GroupCreateRequest request,
            @RequestPart(
                    value = "thumbnail",
                    required = false
            ) MultipartFile thumbnail) {

        Long groupNum = service.addGroup(
                request,
                thumbnail,
                memberNum
        );

        Map<String, Object> result = new HashMap<>();
        result.put("group_num", groupNum);
        result.put("message", "스터디 그룹이 생성되었습니다.");

        return ResponseEntity.ok(result);
    }
    //코드로 그룹 참가 
    @Operation(summary = "초대 코드로 그룹 참가", description = "각 스터디 그룹에 배정된 초대 코드를 통해 그룹에 참가합니다.")
	@ApiResponse(responseCode = "200", description = "참가 성공")
	@ApiResponse(responseCode = "500", description = "참가 실패")
    @PostMapping("/join/invite")
    public ResponseEntity<Map<String, Object>> joinByInviteCode(
            @RequestHeader("memberNum") Long memberNum,
            @RequestBody GroupInviteRequest request) {

        Long groupNum = service.joinByInviteCode(
                request.getInviteCode(),
                memberNum
        );

        Map<String, Object> result = new HashMap<>();
        result.put("group_num", groupNum);
        result.put("message", "스터디룸에 가입되었습니다.");

        return ResponseEntity.ok(result);
    }
}