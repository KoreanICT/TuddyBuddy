package kr.co.ictedu.back.group.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.GroupCreateRequest;
import kr.co.ictedu.back.group.service.GroupService;
import kr.co.ictedu.back.group.vo.TagVO;


@RestController
@RequestMapping("/api/group")
public class GroupController {

    @Autowired
    private GroupService service;
    /*
     * ============================
     * 태그 검색
     *
     * GET
     * /api/group/tags/search
     * ?keyword=React
     * ============================
     */

    @GetMapping("/tags/search")
    public ResponseEntity<List<TagVO>> searchTags(@RequestParam("keyword") String keyword) {
        List<TagVO> tags = service.searchTags(keyword);
        return ResponseEntity.ok(tags);
    }
    /*
     * ============================
     * 스터디 그룹 생성
     *
     * POST
     * /api/group/add
     * ============================
     */

    @PostMapping(value="/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> addGroup(
    		@RequestPart("groupData") GroupCreateRequest request, 
    		@RequestPart(value="thumbnail", required=false) MultipartFile thumbnail) {
    	
//    	System.out.println("thumbnaill = " + thumbnail);
        Long groupNum = service.addGroup(request,thumbnail);
        Map<String, Object> result = new HashMap<>();
        result.put("group_num",groupNum);
        result.put("message","스터디 그룹이 생성되었습니다.");

        return ResponseEntity.ok(result);
    }
}