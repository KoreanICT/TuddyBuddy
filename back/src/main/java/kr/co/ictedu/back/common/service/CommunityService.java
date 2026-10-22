package kr.co.ictedu.back.common.service;

import kr.co.ictedu.back.common.dao.CommunityDao;
import kr.co.ictedu.back.common.vo.CommunityVO;
import kr.co.ictedu.back.common.vo.MyPostVO;
import java.util.List;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.common.vo.PostWriteRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional // 데이터 변경 작업이 포함되므로 트랜잭션 처리
public class CommunityService {

	private final CommunityDao communityDao;

	@Autowired
	public CommunityService(CommunityDao communityDao) {
		this.communityDao = communityDao;
	}

	@Transactional(readOnly = true)
	public int countMyPosts(Long memberNum) {
		return communityDao.countMyPosts(memberNum);
	}

	@Transactional(readOnly = true)
	public List<MyPostVO> findMyPosts(Long memberNum, int startRow, int endRow) {
		return communityDao.findMyPosts(memberNum, startRow, endRow);
	}

	@Transactional(readOnly = true)
	public int countPosts() {
		return communityDao.countPosts();
	}

	@Transactional(readOnly = true)
	public List<MyPostVO> findPosts(int startRow, int endRow) {
		return communityDao.findPosts(startRow, endRow);
	}

	public MyPostVO savePost(PostWriteRequest request, MemberVO member) {
		if (request == null || request.title() == null || request.title().isBlank()
				|| request.title().strip().length() > 30 || request.content() == null || request.content().isBlank()
				|| request.content().strip().length() > 250 || request.category() == null
				|| !List.of("자유게시판", "합격후기", "꿀팁").contains(request.category())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 1~30자, 내용은 1~250자이며 올바른 카테고리를 선택해야 합니다.");
		}
		MyPostVO post = new MyPostVO();
		post.setTitle(request.title().strip());
		post.setContent(request.content().strip());
		post.setCategory(request.category());
		String nickname = member.getMember_nick();
		post.setAuthor(nickname == null || nickname.isBlank() ? "회원" : nickname);
		if (communityDao.savePost(post, member.getMember_num()) != 1) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 저장에 실패했습니다.");
		}
		return post;
	}

	// 1. 게시글 쓰기
	public void writePost(CommunityVO communityVO) {
		int result = communityDao.insertPost(communityVO);
		if (result <= 0) {
			throw new RuntimeException("게시글 작성에 실패했습니다.");
		}
	}

	// 2. 게시글 삭제하기
	@Transactional
	public void deletePost(int id) {
		int result = communityDao.deletePost(id);
		if (result <= 0) {
			throw new RuntimeException("게시글 삭제에 실패했습니다.");
		}
	}
	
	// 3. 게시글 수정하기
	@Transactional
	public void updatePost(CommunityVO vo) {
	    int result = communityDao.updatePost(vo);

	    if (result <= 0) {
	        throw new RuntimeException("게시글 수정에 실패했습니다.");
	    }
	}

	// 4. 댓글 쓰기
	public void writeComment(int postId, CommunityVO commentVO) {
		int result = communityDao.insertComment(postId, commentVO);
		if (result <= 0) {
			throw new RuntimeException("댓글 작성에 실패했습니다.");
		}
	}

	// 5. 댓글 삭제
	public void deleteComment(int commentId) {
		int result = communityDao.deleteComment(commentId);
		if (result <= 0) {
			throw new RuntimeException("댓글 삭제에 실패했습니다.");
		}
	}
	
	
	// 7. 임시글 작성
	public void tempSavePost(CommunityVO communityVO) {
		int result = communityDao.insertTempPost(communityVO);
		if (result <= 0) {
			throw new RuntimeException("임시글 저장에 실패했습니다.");
		}
	}

	// 8. 좋아요 누르기
	public int like(CommunityVO vo) {
		return communityDao.like(vo);
	}
}
