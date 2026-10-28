package kr.co.ictedu.back.groupchat.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.groupchat.service.GroupChatService;
import kr.co.ictedu.back.groupchat.vo.GroupChatVO;

@RestController
@RequestMapping("/api/groupchat")
public class GroupChatRestController {
	
	@Autowired
	private GroupChatService service;
	
	@GetMapping("/getMemberNick")
    public ResponseEntity<Map<String, Object>> getMemberNick(Principal principal) {
        // memberNum 요청 헤더 대신 JWT로 확인한 회원을 사용합니다.
        return ResponseEntity.ok(service.getMemberNick(principal));
    }
	
	@GetMapping("/history/{groupNum}")
	public ResponseEntity<List<GroupChatVO>> getHistory(@PathVariable("groupNum") Long groupNum, 
			@RequestParam(name = "beforeChatNum",required = false) Long beforeChatNum,
	        Principal principal) {
	    return ResponseEntity.ok(
	        service.getHistory(groupNum, beforeChatNum, principal)
	    );
	}
}
