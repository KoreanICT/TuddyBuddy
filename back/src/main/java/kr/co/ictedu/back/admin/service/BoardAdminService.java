package kr.co.ictedu.back.admin.service;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.admin.dao.BoardAdminDao;

@Service
public class BoardAdminService {
    private final BoardAdminDao dao;
    public BoardAdminService(BoardAdminDao dao) { this.dao = dao; }

    @Transactional(readOnly = true)
    public Map<String, Object> list(int page, String keyword) {
        if (page < 1 || keyword.length() > 100)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "검색어는 100자 이내, 페이지는 1 이상이어야 합니다.");
        keyword = keyword.trim();
        int total = dao.count(keyword);
        int pages = (int) Math.ceil(total / 10.0);
        int current = Math.min(page, Math.max(1, pages));
        return Map.of("data", dao.list(keyword, (current - 1) * 10 + 1, current * 10),
                "totalItems", total, "totalPages", pages, "currentPage", current);
    }

    @Transactional
    public void delete(Long num) {
        if (num == null || num <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "게시글 번호를 확인해주세요.");
        if (dao.lockPost(num) == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 없습니다.");
        dao.deleteComments(num);
        if (dao.deletePost(num) != 1)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "게시글 삭제에 실패했습니다.");
    }
}
