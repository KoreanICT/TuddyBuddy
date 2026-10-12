package kr.co.ictedu.back.notice;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.notice.service.NoticeService;
import kr.co.ictedu.back.notice.vo.NoticeVO;

@SpringBootTest
public class NoticeTest {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private PagingService pagingService;

    // 공지사항 목록 조회
    @Test
    void noticeListTest() {
        Map<String, String> map = new HashMap<>();

        int totalCount = noticeService.totalCount(map);
        PageVO page = pagingService.makePage(totalCount, "1");

        map.put("begin", String.valueOf(page.getBeginPerPage()));
        map.put("end", String.valueOf(page.getEndPerPage()));

        List<NoticeVO> list = noticeService.list(map);

        assertNotNull(list);

        System.out.println("전체 공지사항 : " + totalCount);
        System.out.println("전체 페이지 : " + page.getTotalPage());

        for (NoticeVO vo : list) {
            System.out.println("번호 : " + vo.getNum());
            System.out.println("제목 : " + vo.getTitle());
            System.out.println("작성일 : " + vo.getCreated_date());
            System.out.println("----------------------");
        }
    }

    // 공지사항 상세 조회
    @Test
    void noticeDetailTest() {
        Long num = 1L;

        NoticeVO vo = noticeService.getNotice(num);

        assertNotNull(vo, "해당 공지사항이 존재하지 않습니다.");

        System.out.println("번호 : " + vo.getNum());
        System.out.println("제목 : " + vo.getTitle());
        System.out.println("내용 : " + vo.getContent());
        System.out.println("조회수 : " + vo.getHit());
    }
}

