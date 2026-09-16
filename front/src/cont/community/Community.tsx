import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
}

interface Draft {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

const Community: React.FC = () => {
  // 카테고리
  const categories = ["전체", "자유게시판", "합격후기", "꿀팁"];

  // 게시글
  const [posts] = useState<Post[]>([
    {
      id: 1,
      title: "안녕하세요! 처음 가입했습니다.",
      content: "커뮤니티에 처음 가입했어요. 잘 부탁드립니다! 앞으로 많은 교류 나누었으면 좋겠습니다.",
      category: "자유게시판",
      author: "홍길동",
      date: "2026-09-05",
    },
    {
      id: 2,
      title: "이번에 드디어 합격했습니다!",
      content: "열심히 준비한 끝에 합격했어요. 제가 준비했던 공부 패턴과 서류 준비 방법을 공유합니다.",
      category: "합격후기",
      author: "김민수",
      date: "2026-09-04",
    },
    {
      id: 3,
      title: "면접 준비할 때 도움이 되는 팁",
      content: "제가 면접을 준비하면서 도움이 되었던 방법들을 상세히 정리했습니다. 1:1 모의면접 추천해요.",
      category: "꿀팁",
      author: "이영희",
      date: "2026-09-03",
    },
    {
      id: 4,
      title: "요즘 공부 어떻게 하고 계세요?",
      content: "다른 분들은 어떤 방식으로 공부시간을 배분하고 계시는지 궁금합니다. 스터디 모집도 환영해요.",
      category: "자유게시판",
      author: "박철수",
      date: "2026-09-02",
    },
    {
      id: 5,
      title: "합격까지 6개월 걸렸습니다.",
      content: "처음에는 정말 막막했는데 꾸준히 루틴을 지키니까 결과가 나왔습니다. 포기하지 마세요!",
      category: "합격후기",
      author: "최유진",
      date: "2026-09-01",
    },
    {
      id: 6,
      title: "공부 계획표 만드는 방법",
      content: "하루 공부량을 무리하지 않게 정하고 꾸준히 지키는 체계적인 타임테이블 노하우를 공개합니다.",
      category: "꿀팁",
      author: "정다은",
      date: "2026-08-31",
    },
  ]);

  // 임시글
  const [drafts] = useState<Draft[]>([
    { id: 1, title: "작성하다 저장한 글입니다.", content: "아직 작성 중인 내용입니다.", date: "2026-09-05" },
    { id: 2, title: "면접 후기 작성 중", content: "면접에서 받은 질문들을 상세하게 정리하고 있습니다.", date: "2026-09-04" },
    { id: 3, title: "공부 방법 정리", content: "제가 단기 합격에 사용했던 핵심 노하우를 수집 중입니다.", date: "2026-09-03" },
    { id: 4, title: "자격증 준비 후기", content: "자격증 실기 시험 공부하면서 느꼈던 점을 작성하고 있습니다.", date: "2026-09-02" },
    { id: 5, title: "취업 준비 이야기", content: "상반기 취업 준비 과정에서 있었던 일들을 회고하며 정리 중입니다.", date: "2026-09-01" },
  ]);

  // State
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 댓글 State
  const [comments, setComments] = useState<{ [postId: number]: Comment[] }>({
    1: [
      { id: 101, author: "김민수", content: "반갑습니다! 자주 소통해요~", date: "2026-09-05 14:20" },
      { id: 102, author: "이영희", content: "가입 축하드립니다!", date: "2026-09-05 15:10" },
    ],
  });
  const [newCommentText, setNewCommentText] = useState("");

  // 필터링
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const categoryMatch = selectedCategory === "전체" || post.category === selectedCategory;
      const searchMatch =
        searchedKeyword.trim() === "" ||
        post.title.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
        post.content.toLowerCase().includes(searchedKeyword.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [posts, selectedCategory, searchedKeyword]);

  // 핸들러
  const handleSearch = () => setSearchedKeyword(searchKeyword);
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleAddComment = (postId: number) => {
    if (!newCommentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      author: "나(사용자)",
      content: newCommentText.trim(),
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setNewCommentText("");
  };

  const handleDeleteComment = (postId: number, commentId: number) => {
    setComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "합격후기": return "bg-success-subtle text-success border border-success-subtle";
      case "꿀팁": return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
      case "자유게시판": return "bg-info-subtle text-info-emphasis border border-info-subtle";
      default: return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">커뮤니티</h2>
            <p className="text-muted small mb-0">다양한 지식과 후기를 사람들과 공유해보세요.</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-4 p-2 shadow-sm mb-4 border">
          <div className="nav nav-pills nav-fill gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`nav-link py-2.5 px-3 fw-semibold rounded-3 ${
                  selectedCategory === category ? "active bg-primary text-white shadow-sm" : "text-secondary bg-transparent"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-4 p-2 shadow-sm mb-4 border">
          <div className="input-group input-group-lg border-0">
            <input
              type="text"
              className="form-control border-0 shadow-none fs-6 px-3"
              placeholder="관심있는 글 내용이나 제목을 검색해보세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button type="button" className="btn btn-primary rounded-3 px-4 fw-semibold" onClick={handleSearch}>
              검색
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <h5 className="fw-bold mb-0 text-dark">{selectedCategory}</h5>
            <span className="badge bg-primary-subtle text-primary rounded-pill">{filteredPosts.length}</span>
          </div>
          <div className="d-flex flex-column gap-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="card border-0 shadow-sm rounded-4 p-4"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedPost(post);
                  setNewCommentText("");
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={`badge rounded-pill fw-semibold px-2.5 py-1 ${getBadgeStyle(post.category)}`}>
                    {post.category}
                  </span>
                  <small className="text-muted">{post.date}</small>
                </div>
                <h5 className="fw-bold text-dark mb-2">{post.title}</h5>
                <p className="text-secondary mb-3 fs-6" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {post.content}
                </p>
                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="small fw-semibold text-dark">{post.author}</span>
                  <span className="small text-primary fw-semibold">자세히 보기 →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Drafts Section */}
        <div className="bg-white rounded-4 p-4 shadow-sm border mb-4">
          <h5 className="fw-bold text-dark mb-3">작성 중인 임시글</h5>
          <div className="d-flex flex-column gap-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {drafts.map((draft) => (
              <div key={draft.id} className="p-3 rounded-3 bg-light border border-light-subtle">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-semibold text-dark mb-1">{draft.title}</h6>
                  <span className="small text-muted">{draft.date}</span>
                </div>
                <p className="small text-muted mb-0 text-truncate">{draft.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal with Comments */}
        {selectedPost && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setSelectedPost(null)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                {/* Header */}
                <div className="modal-header border-bottom p-4 bg-light-subtle">
                  <div>
                    <span className={`badge rounded-pill fw-semibold px-2.5 py-1 mb-2 ${getBadgeStyle(selectedPost.category)}`}>
                      {selectedPost.category}
                    </span>
                    <h4 className="modal-title fw-bold text-dark mb-0">{selectedPost.title}</h4>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSelectedPost(null)} />
                </div>

                {/* Body */}
                <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px" }}>
                      {selectedPost.author.charAt(0)}
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">{selectedPost.author}</div>
                      <small className="text-muted">{selectedPost.date}</small>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="fs-6 text-dark leading-relaxed mb-5" style={{ minHeight: "100px", whiteSpace: "pre-wrap" }}>
                    {selectedPost.content}
                  </div>

                  {/* Comments Section */}
                  <div className="pt-4 border-top">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <h6 className="fw-bold mb-0 text-dark">댓글</h6>
                      <span className="badge bg-primary-subtle text-primary rounded-pill">
                        {(comments[selectedPost.id] || []).length}
                      </span>
                    </div>

                    {/* Add Comment Input */}
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="댓글을 작성해 보세요..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(selectedPost.id);
                        }}
                      />
                      <button className="btn btn-primary px-4 fw-semibold" type="button" onClick={() => handleAddComment(selectedPost.id)}>
                        등록
                      </button>
                    </div>

                    {/* Comment List */}
                    <div className="d-flex flex-column gap-2">
                      {(comments[selectedPost.id] || []).length > 0 ? (
                        comments[selectedPost.id].map((comment) => (
                          <div key={comment.id} className="p-3 rounded-3 bg-light border border-light-subtle d-flex justify-content-between align-items-start">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="fw-semibold text-dark small">{comment.author}</span>
                                <small className="text-muted" style={{ fontSize: "11px" }}>{comment.date}</small>
                              </div>
                              <p className="mb-0 text-secondary fs-6">{comment.content}</p>
                            </div>
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0 border-0 text-decoration-none small ms-2"
                              style={{ fontSize: "13px" }}
                              onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                            >
                              삭제
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted small bg-light rounded-3">
                          아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-top bg-light-subtle p-3">
                  <button type="button" className="btn btn-secondary px-4 rounded-3 fw-semibold" onClick={() => setSelectedPost(null)}>
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// export default Community;