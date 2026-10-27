//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.GroupCreateRequest;
import kr.co.ictedu.back.group.dto.GroupInviteRequest;
import kr.co.ictedu.back.group.dto.GroupListDTO;
import kr.co.ictedu.back.group.dto.PublicGroupListDTO;
import kr.co.ictedu.back.group.service.GroupService;
import kr.co.ictedu.back.group.vo.TagVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@Tag(name = "그룹 API", description = "그룹 생성, 공개 및 비공개 그룹 조회, 초대코드로 그룹 참가 API")
@RestController
@RequestMapping("/api/group")
public class GroupController {

    @Autowired
    private GroupService service;
    
    @Autowired
    private MemberService memberService;
    
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
    
    @PostMapping("/joingroup/{groupNum}")
    public ResponseEntity<String> joinGroup(@PathVariable("groupNum") Long groupNum, Authentication authentication) {
    	MemberVO member = getMember(authentication);
    	
    	service.joinGroup(groupNum, member.getMember_num());
    	return ResponseEntity.ok("참가 완료");
    }

    @Operation(summary = "자신의 그룹 리스트 조회", description = "자신이 소속된 그룹들의 리스트를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "그룹 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "그룹 리스트 조회 실패")
    @GetMapping("/getmyrooms")
    public ResponseEntity<List<GroupListDTO>> getMyGroups(
    		Authentication authentication) {
    	
    	MemberVO member = getMember(authentication);
    	
    	List<GroupListDTO> list = service.getMyGroups(member.getMember_num());
    	
        return ResponseEntity.ok(list);
    }
    
    @Operation(summary = "공개된 그룹 리스트 조회", description = "공개된 그룹들의 리스트를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "그룹 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "그룹 리스트 조회 실패")
    @GetMapping("/getpublicrooms")
    public ResponseEntity<List<PublicGroupListDTO>> getPublicGroups(
    		Authentication authentication) {

    	MemberVO member = getMember(authentication);
        // 비로그인 요청은 memberNum이 null
        return ResponseEntity.ok(
                service.getPublicGroups(member.getMember_num())
        );
    }
    
    //스터디 그룹 생성
    @Operation(summary = "스터디그룹 생성", description = "스터디 그룹을 thumbnail과 데이터를 별개로 저장합니다.")
	@ApiResponse(responseCode = "200", description = "스터디그룹 생성 성공")
	@ApiResponse(responseCode = "500", description = "스터디그룹 생성 실패")
    @PostMapping(value="/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> addGroup(
            Authentication authentication,
            @RequestPart("groupData") GroupCreateRequest request,
            @RequestPart(
                    value = "thumbnail",
                    required = false
            ) MultipartFile thumbnail) {

    	MemberVO member = getMember(authentication);
        
        Long groupNum = service.addGroup(request,thumbnail,member.getMember_num()
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
    		Authentication authentication,
            @RequestBody GroupInviteRequest request) {

    	MemberVO member = getMember(authentication);
    	
        Long groupNum = service.joinByInviteCode(
                request.getInviteCode(),
                member.getMember_num()
        );

        Map<String, Object> result = new HashMap<>();
        result.put("group_num", groupNum);
        result.put("message", "스터디룸에 가입되었습니다.");

        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/requestJoin/{groupNum}")
    public ResponseEntity<String> requestJoin(
            @PathVariable("groupNum") Long groupNum,
            Authentication authentication) {

    	MemberVO member = getMember(authentication);

        service.requestJoin(groupNum, member.getMember_num());

        return ResponseEntity.ok("방장에게 참여 요청을 보냈습니다.");
    }

    @PostMapping("/answerJoin/{notificationNum}")
    public ResponseEntity<String> answerJoin(
            @PathVariable("notificationNum") Long notificationNum,
            @RequestParam("accept") boolean accept,
            Authentication authentication) {

        MemberVO member = getMember(authentication);

        return ResponseEntity.ok(
            service.answerJoin(member.getMember_num(),notificationNum,accept)
        );
    }
    
    private MemberVO getMember(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}

		MemberVO member = memberService.getMemberByEmail(authentication.getName());

		if (member == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		return member;
	} 
}