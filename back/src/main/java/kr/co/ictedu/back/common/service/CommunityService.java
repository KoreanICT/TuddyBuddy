package kr.co.ictedu.back.common.service;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.common.dao.CommunityDao;
import kr.co.ictedu.back.common.vo.MyPostVO;
import kr.co.ictedu.back.common.vo.PostWriteRequest;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
@Transactional
public class CommunityService {
    private static final List<String> CATEGORIES = List.of("자유게시판", "합격후기", "꿀팁");
    private final CommunityDao dao;
    public CommunityService(CommunityDao dao) { this.dao = dao; }

    @Transactional(readOnly = true)
    public int countMyPosts(Long memberNum) { return dao.countMyPosts(memberNum); }
    @Transactional(readOnly = true)
    public List<MyPostVO> findMyPosts(Long memberNum, int start, int end) { return dao.findMyPosts(memberNum, start, end); }
    @Transactional(readOnly = true)
    public int countPosts(String category, String keyword) { return dao.countPosts(category(category), keyword(keyword)); }
    @Transactional(readOnly = true)
    public List<MyPostVO> findPosts(Long memberNum, String category, String keyword, int start, int end) {
        return dao.findPosts(memberNum, category(category), keyword(keyword), start, end);
    }
    public MyPostVO savePost(PostWriteRequest request, MemberVO member) {
        if (request == null || request.category() == null || !CATEGORIES.contains(request.category()))
            throw bad("올바른 카테고리를 선택해주세요.");
        validateText(request.title(), request.content());
        MyPostVO post = new MyPostVO();
        post.setTitle(request.title().strip()); post.setContent(request.content().strip());
        post.setCategory(request.category()); post.setMemberNum(member.getMember_num());
        String nick = member.getMember_nick();
        post.setAuthor(nick == null || nick.isBlank() ? "회원" : nick);
        if (dao.savePost(post, member.getMember_num()) != 1) throw conflict();
        return post;
    }
    public void updatePost(int id, Long memberNum, String title, String content) {
        requireOwner(id, memberNum);
        validateText(title, content);
        if (dao.updatePost(id, memberNum, title.strip(), content.strip()) != 1) throw conflict();
    }
    public void deletePost(int id, Long memberNum) {
        requireOwner(id, memberNum);
        dao.deleteComments(id); dao.deleteLikes(id); dao.deleteViews(id);
        if (dao.deletePost(id, memberNum) != 1) throw conflict();
    }
    // 원하는 상태를 명시하여 재전송·동시 요청에도 중복 좋아요가 생기지 않습니다.
    public Map<String, Object> like(int id, Long memberNum, boolean liked) {
        requirePost(id);
        boolean exists = dao.hasLike(id, memberNum) > 0;
        if (liked && !exists) dao.addLike(id, memberNum);
        if (!liked && exists) dao.removeLike(id, memberNum);
        return Map.of("liked", liked, "likeCount", dao.likeCount(id));
    }
    public Map<String, Object> increaseViewCount(int id, Long memberNum) {
        requirePost(id);
        boolean counted = dao.recordView(id, memberNum) == 1;
        if (counted) dao.increaseViewCount(id);
        return Map.of("viewCount", dao.viewCount(id), "counted", counted);
    }
    private MyPostVO requirePost(int id) {
        if (id <= 0) throw bad("게시글 번호를 확인해주세요.");
        MyPostVO post = dao.lockPost(id);
        if (post == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 삭제되었거나 존재하지 않습니다.");
        return post;
    }
    private void requireOwner(int id, Long memberNum) {
        MyPostVO post = requirePost(id);
        if (memberNum == null || !memberNum.equals(post.getMemberNum()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 게시글만 수정·삭제할 수 있습니다.");
    }
    private static void validateText(String title, String content) {
        if (title == null || title.isBlank() || title.strip().length() > 30
                || content == null || content.isBlank() || content.strip().length() > 250)
            throw bad("제목은 1~30자, 내용은 1~250자로 입력해주세요.");
    }
    private static String category(String value) {
        if (value == null || value.isBlank() || "전체".equals(value)) return null;
        if (!CATEGORIES.contains(value)) throw bad("카테고리를 확인해주세요.");
        return value;
    }
    private static String keyword(String value) {
        String result = value == null ? "" : value.trim();
        if (result.length() > 100) throw bad("검색어는 100자 이내로 입력해주세요.");
        return result;
    }
    private static ResponseStatusException bad(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
    private static ResponseStatusException conflict() { return new ResponseStatusException(HttpStatus.CONFLICT, "게시글 처리 상태가 변경되었습니다. 다시 조회해주세요."); }
}
