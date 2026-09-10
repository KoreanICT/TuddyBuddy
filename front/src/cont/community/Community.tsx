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

const Community: React.FC = () => {
  // =========================
  // 카테고리
  // =========================
  const categories = ["전체", "자유게시판", "합격후기", "꿀팁"];

  // =========================
  // 게시글
  // =========================
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

  // =========================
  // 임시글
  // =========================
  const [drafts] = useState<Draft[]>([
    {
      id: 1,
      title: "작성하다 저장한 글입니다.",
      content: "아직 작성 중인 내용입니다.",
      date: "2026-09-05",
    },
    {
      id: 2,
      title: "면접 후기 작성 중",
      content: "면접에서 받은 질문들을 상세하게 정리하고 있습니다.",
      date: "2026-09-04",
    },
    {
      id: 3,
      title: "공부 방법 정리",
      content: "제가 단기 합격에 사용했던 핵심 노하우를 수집 중입니다.",
      date: "2026-09-03",
    },
    {
      id: 4,
      title: "자격증 준비 후기",
      content: "자격증 실기 시험 공부하면서 느꼈던 점을 작성하고 있습니다.",
      date: "2026-09-02",
    },
    {
      id: 5,
      title: "취업 준비 이야기",
      content: "상반기 취업 준비 과정에서 있었던 일들을 회고하며 정리 중입니다.",
      date: "2026-09-01",
    },
  ]);

  // =========================
  // State
  // =========================
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // =========================
  // 검색 + 카테고리 필터
  // =========================
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const categoryMatch =
        selectedCategory === "전체" || post.category === selectedCategory;

      const searchMatch =
        searchedKeyword.trim() === "" ||
        post.title.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
        post.content.toLowerCase().includes(searchedKeyword.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [posts, selectedCategory, searchedKeyword]);

  // =========================
  // 검색 핸들러
  // =========================
  const handleSearch = () => {
    setSearchedKeyword(searchKeyword);
  };

  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 카테고리별 Badge 색상 매핑
  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "합격후기":
        return "bg-success-subtle text-success border border-success-subtle";
      case "꿀팁":
        return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
      case "자유게시판":
        return "bg-info-subtle text-info-emphasis border border-info-subtle";
      default:
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        {/* ==================================
            상단 헤더
        ================================== */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">커뮤니티</h2>
            <p className="text-muted small mb-0">
              다양한 지식과 후기를 사람들과 공유해보세요.
            </p>
          </div>
        </div>

        {/* ==================================
            상단 카테고리 탭 (Pills 스타일)
        ================================== */}
        <div className="bg-white rounded-4 p-2 shadow-sm mb-4 border">
          <div className="nav nav-pills nav-fill gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  className={`nav-link py-2.5 px-3 fw-semibold rounded-3 transition-all ${
                    isActive
                      ? "active bg-primary text-white shadow-sm"
                      : "text-secondary bg-transparent hover-bg-light"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================
            검색바
        ================================== */}
        <div className="bg-white rounded-4 p-2 shadow-sm mb-4 border">
          <div className="input-group input-group-lg border-0">
            <span className="input-group-text bg-transparent border-0 pe-1 text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </span>
            <input
              type="text"
              className="form-control border-0 shadow-none fs-6"
              placeholder="관심있는 글 내용이나 제목을 검색해보세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchKeyword && (
              <button
                className="btn btn-link text-muted pe-2 text-decoration-none"
                onClick={() => {
                  setSearchKeyword("");
                  setSearchedKeyword("");
                }}
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary rounded-3 px-4 fw-semibold fs-6"
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>

        {/* ==================================
            게시글 목록 영역
        ================================== */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0 text-dark">{selectedCategory}</h5>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fs-7">
                {filteredPosts.length}
              </span>
            </div>
            {searchedKeyword && (
              <small className="text-muted">
                '<b>{searchedKeyword}</b>' 검색 결과
              </small>
            )}
          </div>

          <div className="d-flex flex-column gap-3">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="card border-0 shadow-sm rounded-4 hover-lift transition-all cursor-pointer"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                      <span
                        className={`badge rounded-pill fw-semibold px-2.5 py-1 fs-7 ${getBadgeStyle(
                          post.category
                        )}`}
                      >
                        {post.category}
                      </span>
                      <small className="text-muted">{post.date}</small>
                    </div>

                    <h5 className="card-title fw-bold text-dark mb-2">
                      {post.title}
                    </h5>

                    <p className="card-text text-secondary mb-3 fs-6 text-truncate-2" style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {post.content}
                    </p>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: "28px", height: "28px", fontSize: "12px" }}
                        >
                          {post.author.charAt(0)}
                        </div>
                        <span className="small fw-semibold text-dark">
                          {post.author}
                        </span>
                      </div>
                      <span className="small text-primary fw-semibold">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-4 p-5 text-center shadow-sm border">
                <div className="text-muted mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    fill="currentColor"
                    className="bi bi-file-earmark-x"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z" />
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                  </svg>
                </div>
                <h6 className="fw-bold text-dark">조건에 맞는 게시글이 없습니다.</h6>
                <p className="text-muted small mb-0">
                  다른 검색어나 카테고리를 선택해 보세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==================================
            임시글 (Accordion / Card 리스트)
        ================================== */}
        <div className="bg-white rounded-4 p-4 shadow-sm border">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold text-dark mb-0">작성 중인 임시글</h5>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5">
                {drafts.length}개
              </span>
            </div>
          </div>

          <div
            className="d-flex flex-column gap-2 pe-1"
            style={{ maxHeight: "280px", overflowY: "auto" }}
          >
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-3 bg-light-subtle border border-light-subtle hover-bg-light transition-all"
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-semibold text-dark mb-0 text-truncate me-2">
                    {draft.title}
                  </h6>
                  <span className="badge bg-light text-muted border border-light-subtle fw-normal">
                    {draft.date}
                  </span>
                </div>
                <p className="small text-muted mb-0 text-truncate">
                  {draft.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================
            게시글 확인 Modal
        ================================== */}
        {selectedPost && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                {/* Modal Header */}
                <div className="modal-header border-bottom p-4 bg-light-subtle">
                  <div className="w-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className={`badge rounded-pill fw-semibold px-2.5 py-1 fs-7 ${getBadgeStyle(
                          selectedPost.category
                        )}`}
                      >
                        {selectedPost.category}
                      </span>
                      <small className="text-muted">{selectedPost.date}</small>
                    </div>
                    <h4 className="modal-title fw-bold text-dark mb-0">
                      {selectedPost.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    className="btn-close align-self-start"
                    onClick={() => setSelectedPost(null)}
                  />
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "36px", height: "36px", fontSize: "14px" }}
                    >
                      {selectedPost.author.charAt(0)}
                    </div>
                    <div>
                      <div className="fw-semibold text-dark fs-6">
                        {selectedPost.author}
                      </div>
                      <small className="text-muted">작성자</small>
                    </div>
                  </div>

                  <div
                    className="fs-6 text-dark leading-relaxed"
                    style={{
                      minHeight: "180px",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.7",
                    }}
                  >
                    {selectedPost.content}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer border-top bg-light-subtle p-3">
                  <button
                    type="button"
                    className="btn btn-secondary px-4 rounded-3 fw-semibold"
                    onClick={() => setSelectedPost(null)}
                  >
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

export default Community;