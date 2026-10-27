// 주용현
package kr.co.ictedu.back.notice.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.notice.service.NoticeService;
import kr.co.ictedu.back.notice.vo.NoticeVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityauth.MemberRoles;

@Tag(name = "공지사항 API", description = "공지사항 등록, 목록, 상세, 수정, 삭제 API")
@RestController
@RequestMapping("/api/notice")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private PagingService pagingService;

    @Autowired
    private MemberService memberService;

    private MemberVO requireManager(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberService.getMemberByEmail(authentication.getName());
        if (member == null || member.getMember_num() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 회원 정보를 찾을 수 없습니다.");
        }
        if (!MemberRoles.isManager(member.getAuthority())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
        }
        return member;
    }

    @Value("${spring.servlet.multipart.location}")
    private String filePath;

    // 파일 업로드 경로 확인
    @Operation(
        summary = "파일 업로드 경로 확인",
        description = "application.properties에 설정된 파일 업로드 경로를 확인합니다."
    )
    @ApiResponse(responseCode = "200", description = "경로 조회 성공")
    @GetMapping("/getPath")
    public String getMethodName() {
        System.out.println("Path : " + filePath);
        return filePath;
    }

    // 공지사항 등록
    @Operation(
        summary = "공지사항 등록",
        description = "공지사항 정보와 이미지 파일을 multipart/form-data 형식으로 등록합니다."
    )
    @ApiResponse(responseCode = "200", description = "공지사항 등록 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 파일명")
    @ApiResponse(responseCode = "500", description = "공지사항 등록 실패")
    @PostMapping(value = "/noticeAdd", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upboardAdd(
            @Parameter(description = "공지사항 등록 정보 및 첨부 이미지")
            @ModelAttribute NoticeVO vo,
            HttpServletRequest request, Authentication authentication) {

        vo.setMember_num(requireManager(authentication).getMember_num());
        MultipartFile mf = vo.getMfile();
        Path uploadDir = Paths.get(filePath);

        try {
            if (mf != null && !mf.isEmpty()) {
                String oriFn = mf.getOriginalFilename();

                if (oriFn == null || oriFn.isBlank()) {
                    return ResponseEntity.badRequest().body("파일명이 올바르지 않습니다.");
                }

                System.out.println("파일 이름 : " + oriFn);

                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }

                Path savePath = uploadDir.resolve(oriFn);
                mf.transferTo(savePath);
                vo.setImgn(oriFn);
            }

            noticeService.add(vo);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("업로드 실패");
        }

        return ResponseEntity.ok("공지 등록 성공!");
    }

    // 공지사항 목록
    @Operation(
        summary = "공지사항 목록 조회",
        description = "페이지 번호 및 검색 조건으로 공지사항 목록을 조회합니다.",
        parameters = {
            @Parameter(name = "cPage", description = "현재 페이지 번호", in = ParameterIn.QUERY, example = "1"),
            @Parameter(name = "searchType", description = "검색 유형", in = ParameterIn.QUERY),
            @Parameter(name = "searchValue", description = "검색어", in = ParameterIn.QUERY)
        }
    )
    @ApiResponse(responseCode = "200", description = "공지사항 목록 조회 성공")
    @GetMapping("/noticeList")
    public Map<String, Object> upBoardList(
            @RequestParam Map<String, String> paramMap,
            HttpServletRequest request) {

        String cPage = paramMap.get("cPage");

        System.out.println("searchType : " + paramMap.get("searchType"));
        System.out.println("searchValue : " + paramMap.get("searchValue"));
        System.out.println("*************************");

        int totalCnt = noticeService.totalCount(paramMap);
        PageVO pageVO = pagingService.makePage(totalCnt, cPage);

        Map<String, String> map = new HashMap<>(paramMap);
        map.put("begin", String.valueOf(pageVO.getBeginPerPage()));
        map.put("end", String.valueOf(pageVO.getEndPerPage()));

        List<NoticeVO> list = noticeService.list(map);

        Map<String, Object> response = new HashMap<>();
        response.put("data", list);
        response.put("totalItems", pageVO.getTotalRecord());
        response.put("totalPages", pageVO.getTotalPage());
        response.put("currentPage", pageVO.getNowPage());
        response.put("startPage", pageVO.getStartPage());
        response.put("endPage", pageVO.getEndPage());

        return response;
    }

    // 공지사항 상세 조회
    @Operation(
        summary = "공지사항 상세 조회",
        description = "공지사항 번호(num)를 이용해 상세 정보를 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "공지사항 상세 조회 성공")
    @GetMapping("/noticeDetail")
    public NoticeVO boardDetail(
            @Parameter(description = "공지사항 번호", required = true, example = "1")
            @RequestParam("num") Long num) {

        return noticeService.detail(num);
    }

    // 공지사항 삭제
    @Operation(
        summary = "공지사항 삭제",
        description = "공지사항 번호(num)를 이용해 공지사항을 삭제합니다."
    )
    @ApiResponse(responseCode = "200", description = "공지사항 삭제 요청 처리")
    @DeleteMapping("/noticeDelete")
    public String boardDelete(
            @Parameter(description = "삭제할 공지사항 번호", required = true, example = "1")
            @RequestParam("num") Long num, Authentication authentication) {

        requireManager(authentication);
        noticeService.del(num);
        return "삭제 완료";
    }

    // 공지사항 수정
    @Operation(
        summary = "공지사항 수정",
        description = "공지사항 정보 및 이미지를 수정합니다. deleteImage=true이면 기존 이미지를 삭제합니다."
    )
    @ApiResponse(responseCode = "200", description = "공지사항 수정 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 파일명")
    @ApiResponse(responseCode = "404", description = "공지사항이 존재하지 않음")
    @ApiResponse(responseCode = "500", description = "공지사항 수정 실패")
    @PutMapping(value = "/noticeUpdate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> noticeUpdate(
            @Parameter(description = "수정할 공지사항 정보 및 이미지")
            @ModelAttribute NoticeVO vo,
            @Parameter(description = "기존 이미지 삭제 여부", example = "false")
            @RequestParam(value = "deleteImage", defaultValue = "false") boolean deleteImage,
            Authentication authentication) {

        requireManager(authentication);

        // 1. 기존 공지사항 조회
        NoticeVO oldNotice = noticeService.getNotice(vo.getNum());

        if (oldNotice == null) {
            return ResponseEntity.notFound().build();
        }

        String oldImgn = oldNotice.getImgn();
        vo.setImgn(oldImgn);

        MultipartFile mf = vo.getMfile();
        Path uploadDir = Paths.get(filePath);
        Path newFilePath = null;

        try {
            // 2. 새 이미지 업로드
            if (mf != null && !mf.isEmpty()) {
                Files.createDirectories(uploadDir);

                String oriFn = mf.getOriginalFilename();

                if (oriFn == null || oriFn.isBlank()) {
                    return ResponseEntity.badRequest().body("파일명이 올바르지 않습니다.");
                }

                String saveName = oriFn;
                newFilePath = uploadDir.resolve(saveName);

                mf.transferTo(newFilePath);
                vo.setImgn(saveName);

            } else if (deleteImage) {
                // 3. 기존 이미지 삭제 요청
                vo.setImgn(null);
            }

            // 4. DB 수정
            int result = noticeService.update(vo);

            if (result == 0) {
                if (newFilePath != null) {
                    Files.deleteIfExists(newFilePath);
                }
                return ResponseEntity.notFound().build();
            }

            // 5. 기존 이미지 파일 삭제
            boolean imageChanged = newFilePath != null || deleteImage;

            if (imageChanged &&
                    oldImgn != null &&
                    !oldImgn.isBlank() &&
                    !oldImgn.equals(vo.getImgn())) {

                Path oldFilePath = uploadDir.resolve(oldImgn);

                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();

            if (newFilePath != null) {
                try {
                    Files.deleteIfExists(newFilePath);
                } catch (IOException ex) {
                    ex.printStackTrace();
                }
            }

            return ResponseEntity.internalServerError().body("공지사항 수정 실패");
        }
    }
}
