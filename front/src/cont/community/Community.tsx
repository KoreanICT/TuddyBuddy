import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../login/authHttp";
import { useAuth } from "../../login/hooks/useAuth";
import ReportButton from "../report/ReportButton";
import "bootstrap/dist/css/bootstrap.min.css";

interface Post {
  postNum: number;
  title: string | null;
  content: string;
  category: string;
  author: string;
  likeCount?: number;
  communityDate?: string;
  viewCount?: number;
}

interface Comment {
  memberNum?: number;
  commentNum?: number;
  postId?: number;
  author?: string;
  content: string;
  createdAt?: string;
}

interface PostsResponse {
  data: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  startPage: number;
  endPage: number;
}

const Community: React.FC = () => {
  const categories = ["전체", "자유게시판", "합격후기", "꿀팁"];
  const writeCategories = ["자유게시판", "합격후기", "꿀팁"];
  const { isLoggedIn, memberNum } = useAuth();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [listing, setListing] = useState<PostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newWriteCategory, setNewWriteCategory] = useState("자유게시판");
  const [saving, setSaving] = useState(false);
  const [writeError, setWriteError] = useState("");

  // 댓글 및 좋아요 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentNum, setEditingCommentNum] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [commentEditSubmitting, setCommentEditSubmitting] = useState(false);
  const [likeSubmitting, setLikeSubmitting] = useState(false);

  const saveLock = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setListing(null);
    setSelectedPost(null);
    setListError("");

    if (!isLoggedIn || memberNum === null) {
      setLoading(false);
      setListError("로그인 후 커뮤니티 게시글을 확인할 수 있습니다.");
      return () => controller.abort();
    }

    setLoading(true);

    const loadPosts = async () => {
      try {
        const response = await axios.get<PostsResponse>(
          `${BACKEND_URL}/api/community/posts`,
          {
            params: { cPage: page },
            signal: controller.signal,
          }
        );

        console.log("게시글 목록 서버 응답:", response.data);

        if (!controller.signal.aborted) {
          setListing(response.data);
        }
      } catch (error) {
        if (controller.signal.aborted || axios.isCancel(error)) return;

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        setListError(
          status === 401
            ? "로그인이 만료되었습니다. 다시 로그인해주세요."
            : status === 403
              ? "게시글 목록에 접근할 권한이 없습니다."
              : "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPosts();

    return () => controller.abort();
  }, [isLoggedIn, memberNum, page, reload]);

  // 댓글 목록 조회
  const fetchComments = async (postId: number) => {
    setCommentsLoading(true);

    try {
      const res = await axios.get<Comment[]>(
        `${BACKEND_URL}/api/community/comment/list`,
        {
          params: { postId },
        }
      );

      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("댓글을 불러오지 못했습니다.", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      setNewCommentContent("");
      return;
    }

    void fetchComments(selectedPost.postNum);
  }, [selectedPost]);

  useEffect(() => {
    setIsWriteModalOpen(false);
    setSelectedPost(null);
    setSaving(false);
    saveLock.current = false;

    return () => {
      saveController.current?.abort();
      saveController.current = null;
    };
  }, [memberNum]);

  useEffect(() => {
    if (isWriteModalOpen) {
      titleInputRef.current?.focus();
    }

    if (!isWriteModalOpen && !selectedPost) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saveLock.current) {
        setIsWriteModalOpen(false);
        setSelectedPost(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isWriteModalOpen, selectedPost]);

  const filteredPosts = useMemo(
    () =>
      (listing?.data || []).filter(
        (post) =>
          (selectedCategory === "전체" ||
            post.category === selectedCategory) &&
          (!searchedKeyword.trim() ||
            (post.title || "")
              .toLowerCase()
              .includes(searchedKeyword.toLowerCase()) ||
            post.content
              .toLowerCase()
              .includes(searchedKeyword.toLowerCase()))
      ),
    [listing, selectedCategory, searchedKeyword]
  );

  const openWriteModal = () => {
    if (!isLoggedIn) {
      navigate("/auth/member?redirect=%2Fcommunity");
      return;
    }

    setWriteError("");
    setIsWriteModalOpen(true);
  };

  // 게시글 작성
  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();

    if (saveLock.current) return;

    const title = newTitle.trim();
    const content = newContent.trim();

    if (!isLoggedIn) {
      setWriteError("로그인 후 글을 작성해주세요.");
      return;
    }

    if (!title || !content) {
      setWriteError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (title.length > 100 || content.length > 250) {
      setWriteError("제목은 100자, 내용은 250자 이내로 입력해주세요.");
      return;
    }

    if (!writeCategories.includes(newWriteCategory)) {
      setWriteError("카테고리를 선택해주세요.");
      return;
    }

    saveLock.current = true;
    setSaving(true);
    setWriteError("");

    const controller = new AbortController();
    saveController.current = controller;

    try {
      await axios.post(
        `${BACKEND_URL}/api/community/write`,
        {
          title,
          content,
          category: newWriteCategory,
        },
        {
          signal: controller.signal,
        }
      );

      if (controller.signal.aborted) return;

      setNewTitle("");
      setNewContent("");
      setNewWriteCategory("자유게시판");
      setIsWriteModalOpen(false);
      setSelectedCategory("전체");
      setSearchKeyword("");
      setSearchedKeyword("");
      setNotice(
        "게시글이 등록되었습니다. 마이페이지의 나의 게시글에서도 확인할 수 있습니다."
      );
      setPage(1);
      setReload((value) => value + 1);
    } catch (error) {
      if (controller.signal.aborted || axios.isCancel(error)) return;

      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      const serverMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
        error.response?.data?.detail
        : undefined;

      setWriteError(
        status === 401
          ? "로그인이 만료되었습니다. 다시 로그인해주세요."
          : status === 403
            ? "게시글을 작성할 권한이 없습니다."
            : status === 400
              ? typeof serverMessage === "string"
                ? serverMessage
                : "입력한 내용이 게시글 저장 형식 또는 길이 제한에 맞지 않습니다."
              : "게시글 등록 결과를 확인하지 못했습니다. 목록을 확인한 후 다시 시도해주세요."
      );
    } finally {
      if (saveController.current === controller) {
        saveController.current = null;
        saveLock.current = false;

        if (!controller.signal.aborted) {
          setSaving(false);
        }
      }
    }
  };

  // 게시글 수정 모드 시작
  const handleStartEdit = () => {
    if (!selectedPost) return;

    setEditTitle(selectedPost.title || "");
    setEditContent(selectedPost.content || "");
    setEditError("");
    setIsEditMode(true);
  };

  // 게시글 수정
  const handleUpdatePost = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedPost || editSaving) return;

    const title = editTitle.trim();
    const content = editContent.trim();

    if (!title || !content) {
      setEditError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (title.length > 100 || content.length > 250) {
      setEditError(
        "제목은 100자, 내용은 250자 이내로 입력해주세요."
      );
      return;
    }

    setEditSaving(true);
    setEditError("");

    try {
      await axios.put(
        `${BACKEND_URL}/api/community/update/${selectedPost.postNum}`,
        {
          id: selectedPost.postNum,
          title,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 현재 상세 게시글 내용도 즉시 변경
      setSelectedPost((prev) =>
        prev
          ? {
            ...prev,
            title,
            content,
          }
          : null
      );

      // 목록에 표시되는 게시글도 수정
      setListing((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          data: prev.data.map((post) =>
            post.postNum === selectedPost.postNum
              ? {
                ...post,
                title,
                content,
              }
              : post
          ),
        };
      });

      setIsEditMode(false);

      alert("게시글이 수정되었습니다.");

    } catch (error) {
      console.error("게시글 수정 실패:", error);

      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data ||
          error.message;

        setEditError(
          `게시글 수정에 실패했습니다: ${errorMsg}`
        );
      } else {
        setEditError("게시글 수정에 실패했습니다.");
      }
    } finally {
      setEditSaving(false);
    }
  };


  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!selectedPost) return;

    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/community/delete/${selectedPost.postNum}`);

      alert("게시글이 삭제되었습니다.");
      setSelectedPost(null); // 상세 모달 닫기
      setPage(1);            // 페이지 초기화 또는 유지
      setReload((value) => value + 1); // 목록 새로고침
    } catch (error) {
      console.error("게시글 삭제 실패:", error);

      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        alert(`게시글 삭제 실패: ${errorMsg}`);
      } else {
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  // ==========================================================
  // 게시글 조회수 증가
  // 게시글 상세 모달을 열 때 서버에 조회수 증가 요청
  // ==========================================================
  const increaseViewCount = async (postNum: number) => {
    try {
      if (!Number.isFinite(postNum) || postNum <= 0) {
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/community/view`,
        {
          id: postNum,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("조회수 증가 상태 코드:", response.status);
      console.log("조회수 서버 응답:", response.data);

      // 현재 상세 게시글 조회수 +1
      setSelectedPost((prev) =>
        prev && prev.postNum === postNum
          ? {
            ...prev,
            viewCount: (prev.viewCount ?? 0) + 1,
          }
          : prev
      );

      // 목록의 조회수도 +1
      setListing((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          data: prev.data.map((post) =>
            post.postNum === postNum
              ? {
                ...post,
                viewCount: (post.viewCount ?? 0) + 1,
              }
              : post
          ),
        };
      });
    } catch (error) {
      // 조회수 실패 때문에 게시글 열기 자체가 막히지는 않도록 처리
      console.error("조회수 증가 실패:", error);
    }
  };


  // ==========================================================
  // 좋아요 기능
  // 좋아요 취소 없음
  // 버튼을 누르면 서버에서 LIKE_COUNT + 1
  // ==========================================================
  const handleLike = async () => {
    if (!selectedPost || likeSubmitting) return;

    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const postNum = Number(selectedPost.postNum);

    if (!Number.isFinite(postNum) || postNum <= 0) {
      console.error("잘못된 게시글 번호:", selectedPost.postNum);
      alert("게시글 번호를 확인할 수 없습니다.");
      return;
    }

    setLikeSubmitting(true);

    try {
      console.log("좋아요 요청:", {
        id: postNum,
        url: `${BACKEND_URL}/api/community/like`,
      });

      const response = await axios.post(
        `${BACKEND_URL}/api/community/like`,
        {
          id: postNum,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("좋아요 상태 코드:", response.status);
      console.log("좋아요 서버 응답:", response.data);

      // 서버 성공 → 현재 상세 게시글 좋아요 수 +1
      setSelectedPost((prev) =>
        prev
          ? {
            ...prev,
            likeCount: (prev.likeCount ?? 0) + 1,
          }
          : null
      );

      // 게시글 목록에도 좋아요 수 +1
      setListing((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          data: prev.data.map((post) =>
            post.postNum === postNum
              ? {
                ...post,
                likeCount: (post.likeCount ?? 0) + 1,
              }
              : post
          ),
        };
      });

    } catch (error) {
      console.error("좋아요 처리 실패:", error);

      if (axios.isAxiosError(error)) {
        console.error(
          "좋아요 상태 코드:",
          error.response?.status
        );

        console.error(
          "좋아요 서버 응답:",
          error.response?.data
        );

        const serverMessage =
          typeof error.response?.data === "string"
            ? error.response.data
            : error.response?.data?.message ||
            error.response?.data?.error ||
            error.message;

        alert(
          `좋아요 처리에 실패했습니다.\n${serverMessage}`
        );
      } else {
        alert("좋아요 처리에 실패했습니다.");
      }
    } finally {
      setLikeSubmitting(false);
    }
  };

  // 댓글 작성
  const handleCreateComment = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedPost) return;

    if (!isLoggedIn) {
      alert("로그인 후 댓글을 작성해주세요.");
      return;
    }

    const commentText = newCommentContent.trim();

    if (!commentText) return;

    setCommentSubmitting(true);

    try {
      const postIdVal = Number(selectedPost.postNum);

      await axios.post(
        `${BACKEND_URL}/api/community/comment/write`,
        {
          content: commentText,
        },
        {
          params: {
            postId: postIdVal,
          },
        }
      );

      setNewCommentContent("");

      await fetchComments(selectedPost.postNum);
    } catch (error) {
      console.error("댓글 작성 실패", error);

      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        alert(
          `댓글 작성 실패 (상태코드: ${error.response?.status}): ${errorMsg}`
        );
      } else {
        alert("댓글 작성에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setCommentSubmitting(false);
    }
  };

  // 댓글 수정

  const handleStartEditComment = (comment: Comment) => {
    if (comment.commentNum == null) return;

    setEditingCommentNum(comment.commentNum);
    setEditingCommentContent(comment.content);
  };

  const handleUpdateComment = async (commentNum: number) => {
    const content = editingCommentContent.trim();

    if (!content) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (content.length > 250) {
      alert("댓글은 250자 이내로 입력해주세요.");
      return;
    }

    setCommentEditSubmitting(true);

    try {
      await axios.put(
        `${BACKEND_URL}/api/community/comment/update`,
        {
          commentNum,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("댓글이 수정되었습니다.");

      setEditingCommentNum(null);
      setEditingCommentContent("");

      if (selectedPost) {
        await fetchComments(selectedPost.postNum);
      }
    } catch (error) {
      console.error("댓글 수정 실패:", error);

      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data ||
          error.message;

        alert(`댓글 수정 실패: ${errorMsg}`);
      } else {
        alert("댓글 수정에 실패했습니다.");
      }
    } finally {
      setCommentEditSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (
    commentNum: number
  ) => {
    if (!selectedPost) return;

    if (!window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/community/comment/delete`,
        {
          params: {
            commentNum: commentNum,
          },
        }
      );

      alert("댓글이 삭제되었습니다.");

      await fetchComments(selectedPost.postNum);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);

      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        alert(`댓글 삭제 실패: ${errorMsg}`);
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  const formatCommunityDate = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };


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
      <div
        className="container"
        style={{ maxWidth: "1000px" }}
      >
        {/* 헤더 */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">
              커뮤니티
            </h2>

            <p className="text-muted small mb-0">
              다양한 지식과 후기를 사람들과 공유해보세요.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm"
            onClick={openWriteModal}
          >
            + 글쓰기
          </button>
        </div>

        {notice && (
          <p
            className="alert alert-success"
            role="status"
          >
            {notice}
          </p>
        )}

        {/* 카테고리 */}
        <div className="bg-white rounded-4 p-2 shadow-sm mb-4 border">
          <div className="nav nav-pills nav-fill gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={
                  selectedCategory === category
                }
                className={`nav-link py-2 px-3 fw-semibold rounded-3 ${selectedCategory === category
                  ? "active bg-primary text-white shadow-sm"
                  : "text-secondary bg-transparent"
                  }`}
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-4 p-2 shadow-sm mb-2 border">
          <div className="input-group input-group-lg border-0">
            <input
              type="search"
              className="form-control border-0 shadow-none fs-6 px-3"
              placeholder="현재 페이지의 제목이나 내용 검색"
              aria-label="현재 페이지 게시글 검색"
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setSearchedKeyword(searchKeyword);
                }
              }}
            />

            <button
              type="button"
              className="btn btn-primary rounded-3 px-4 fw-semibold"
              onClick={() =>
                setSearchedKeyword(searchKeyword)
              }
            >
              검색
            </button>
          </div>
        </div>

        <p className="text-muted small mb-4">
          카테고리와 검색은 현재 페이지의 게시글에 적용됩니다.
        </p>

        {/* 게시글 목록 */}
        <section
          className="mb-5"
          aria-busy={loading}
          aria-label="게시글 목록"
        >
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <h5 className="fw-bold mb-0 text-dark">
              {selectedCategory}
            </h5>

            {listing && (
              <span className="badge bg-primary-subtle text-primary rounded-pill">
                전체 {listing.totalItems}건 · 현재 페이지{" "}
                {filteredPosts.length}건
              </span>
            )}
          </div>

          {loading ? (
            <p
              className="text-center py-5 text-muted"
              role="status"
            >
              게시글을 불러오는 중입니다.
            </p>
          ) : listError ? (
            <div className="bg-white rounded-4 p-4 border text-center">
              <p role="alert">{listError}</p>

              {isLoggedIn ? (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() =>
                    setReload((value) => value + 1)
                  }
                >
                  다시 시도
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(
                      "/auth/member?redirect=%2Fcommunity"
                    )
                  }
                >
                  로그인
                </button>
              )}
            </div>
          ) : filteredPosts.length === 0 ? (
            <p className="bg-white rounded-4 p-5 text-center text-muted">
              {listing?.totalItems === 0
                ? "아직 등록된 게시글이 없습니다."
                : "현재 페이지에 조건과 일치하는 게시글이 없습니다."}
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredPosts.map((post) => (
                <button
                  key={post.postNum}
                  type="button"
                  className="card border-0 shadow-sm rounded-4 p-4 text-start w-100"
                  onClick={() => {
                    setSelectedPost(post);
                    void increaseViewCount(post.postNum);
                  }}
                >
                  <span
                    className={`badge rounded-pill fw-semibold mb-2 ${getBadgeStyle(
                      post.category
                    )}`}
                  >
                    {post.category}
                  </span>

                  <span
                    className="h5 fw-bold text-dark mb-2"
                    style={{
                      overflowWrap: "anywhere",
                    }}
                  >
                    {post.title || "제목 없음"}
                  </span>

                  <span
                    className="text-secondary mb-3 fs-6"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {post.content}
                  </span>

                  <span className="d-flex justify-content-between align-items-center pt-2 border-top w-100">
                    <span className="small text-secondary">
                      <span className="fw-semibold text-dark">
                        {post.author || "회원"}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        {formatCommunityDate(post.communityDate)}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        👁 {post.viewCount ?? 0}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        ❤️ {post.likeCount ?? 0}
                      </span>
                    </span>
                    <span className="small text-primary fw-semibold">
                      자세히 보기 →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {!loading &&
            !listError &&
            listing &&
            listing.totalPages > 1 && (
              <nav
                className="d-flex flex-wrap justify-content-center gap-2 mt-4"
                aria-label="커뮤니티 페이지"
              >
                {listing.startPage > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      setPage(listing.startPage - 1)
                    }
                  >
                    이전
                  </button>
                )}

                {Array.from(
                  {
                    length: Math.max(
                      0,
                      listing.endPage -
                      listing.startPage +
                      1
                    ),
                  },
                  (_, index) =>
                    listing.startPage + index
                ).map((number) => (
                  <button
                    key={number}
                    type="button"
                    className={`btn btn-sm ${number === listing.currentPage
                      ? "btn-primary"
                      : "btn-outline-primary"
                      }`}
                    aria-current={
                      number === listing.currentPage
                        ? "page"
                        : undefined
                    }
                    disabled={
                      number === listing.currentPage
                    }
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}

                {listing.endPage < listing.totalPages && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      setPage(listing.endPage + 1)
                    }
                  >
                    다음
                  </button>
                )}
              </nav>
            )}
        </section>

        {/* 글쓰기 모달 */}
        {isWriteModalOpen && (
          <div
            className="modal fade show d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-write-title"
            tabIndex={-1}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => {
              if (!saving) {
                setIsWriteModalOpen(false);
              }
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom p-4 bg-light-subtle">
                  <h4
                    id="community-write-title"
                    className="modal-title fw-bold text-dark mb-0"
                  >
                    새 글 작성
                  </h4>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="글쓰기 닫기"
                    disabled={saving}
                    onClick={() =>
                      setIsWriteModalOpen(false)
                    }
                  />
                </div>

                <form
                  onSubmit={(event) =>
                    void handleCreatePost(event)
                  }
                  aria-busy={saving}
                >
                  <div
                    className="modal-body p-4"
                    style={{
                      maxHeight: "75vh",
                      overflowY: "auto",
                    }}
                  >
                    <div className="mb-3">
                      <label
                        htmlFor="community-category"
                        className="form-label fw-semibold text-dark"
                      >
                        카테고리
                      </label>

                      <select
                        id="community-category"
                        className="form-select"
                        value={newWriteCategory}
                        disabled={saving}
                        onChange={(event) =>
                          setNewWriteCategory(
                            event.target.value
                          )
                        }
                      >
                        {writeCategories.map(
                          (category) => (
                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="community-post-title"
                        className="form-label fw-semibold text-dark"
                      >
                        제목
                      </label>

                      <input
                        id="community-post-title"
                        ref={titleInputRef}
                        type="text"
                        className="form-control"
                        value={newTitle}
                        maxLength={100}
                        disabled={saving}
                        onChange={(event) =>
                          setNewTitle(event.target.value)
                        }
                        placeholder="제목을 입력하세요"
                        required
                      />

                      <p className="small text-muted mt-1 mb-0">
                        {newTitle.length}/100자
                      </p>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="community-post-content"
                        className="form-label fw-semibold text-dark"
                      >
                        내용
                      </label>

                      <textarea
                        id="community-post-content"
                        className="form-control"
                        rows={8}
                        value={newContent}
                        maxLength={250}
                        disabled={saving}
                        onChange={(event) =>
                          setNewContent(event.target.value)
                        }
                        placeholder="내용을 입력하세요"
                        required
                      />

                      <p className="small text-muted mt-1 mb-0">
                        {newContent.length}/250자
                      </p>
                    </div>

                    {writeError && (
                      <p
                        className="text-danger mb-0"
                        role="alert"
                      >
                        {writeError}
                      </p>
                    )}
                  </div>

                  <div className="modal-footer border-top bg-light-subtle p-3">
                    <button
                      type="button"
                      className="btn btn-secondary px-4 rounded-3 fw-semibold"
                      disabled={saving}
                      onClick={() =>
                        setIsWriteModalOpen(false)
                      }
                    >
                      취소
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary px-4 rounded-3 fw-semibold"
                      disabled={saving}
                    >
                      {saving ? "등록 중..." : "등록하기"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 게시글 상세 모달 */}
        {selectedPost && (
          <div
            className="modal fade show d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-detail-title"
            tabIndex={-1}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                {/* 모달 헤더 */}
                <div className="modal-header border-bottom p-4 bg-light-subtle">
                  <div>
                    <span
                      className={`badge rounded-pill fw-semibold mb-2 ${getBadgeStyle(
                        selectedPost.category
                      )}`}
                    >
                      {selectedPost.category}
                    </span>

                    <h4
                      id="community-detail-title"
                      className="modal-title fw-bold text-dark mb-0"
                      style={{
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selectedPost.title || "제목 없음"}
                    </h4>
                  </div>

                  <div className="d-flex align-items-center gap-3 ms-3">
                    <ReportButton type="community" targetNum={selectedPost.postNum}
                      aria-label="게시글 신고">신고</ReportButton>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="게시글 닫기"
                      onClick={() => setSelectedPost(null)}
                    />
                  </div>
                </div>

                {/* 모달 본문 */}
                <div
                  className="modal-body p-4"
                  style={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                  }}
                >
                  {/* 작성자 + 좋아요 */}
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-semibold text-dark">
                        {selectedPost.author || "회원"}
                      </span>

                      <span className="text-muted">·</span>

                      <span className="small text-muted">
                        {formatCommunityDate(selectedPost.communityDate)}
                      </span>

                      <span className="text-muted">·</span>

                      <span className="small text-muted">
                        👁 {selectedPost.viewCount ?? 0}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                      onClick={() => void handleLike()}
                      disabled={likeSubmitting}
                      aria-label="좋아요"
                    >
                      {likeSubmitting
                        ? "처리 중..."
                        : `❤️ 좋아요 ${selectedPost.likeCount ?? 0
                        }`}
                    </button>
                  </div>

                  {/* 게시글 내용 / 수정 영역 */}
                  {isEditMode ? (
                    <form
                      onSubmit={(event) =>
                        void handleUpdatePost(event)
                      }
                    >
                      {/* 제목 수정 */}
                      <div className="mb-3">
                        <label
                          htmlFor="edit-post-title"
                          className="form-label fw-semibold"
                        >
                          제목
                        </label>

                        <input
                          id="edit-post-title"
                          type="text"
                          className="form-control"
                          value={editTitle}
                          maxLength={100}
                          disabled={editSaving}
                          onChange={(event) =>
                            setEditTitle(event.target.value)
                          }
                        />

                        <div className="small text-muted mt-1">
                          {editTitle.length}/30자
                        </div>
                      </div>

                      {/* 내용 수정 */}
                      <div className="mb-3">
                        <label
                          htmlFor="edit-post-content"
                          className="form-label fw-semibold"
                        >
                          내용
                        </label>

                        <textarea
                          id="edit-post-content"
                          className="form-control"
                          rows={8}
                          value={editContent}
                          maxLength={250}
                          disabled={editSaving}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                        />

                        <div className="small text-muted mt-1">
                          {editContent.length}/250자
                        </div>
                      </div>

                      {editError && (
                        <div
                          className="text-danger small mb-3"
                          role="alert"
                        >
                          {editError}
                        </div>
                      )}

                      <div className="d-flex justify-content-end gap-2 mb-4">
                        <button
                          type="button"
                          className="btn btn-secondary rounded-3"
                          disabled={editSaving}
                          onClick={() => {
                            setIsEditMode(false);
                            setEditError("");
                          }}
                        >
                          취소
                        </button>

                        <button
                          type="submit"
                          className="btn btn-primary rounded-3 fw-semibold"
                          disabled={editSaving}
                        >
                          {editSaving ? "수정 중..." : "수정 완료"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      className="fs-6 text-dark mb-5"
                      style={{
                        minHeight: "80px",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selectedPost.content}
                    </div>
                  )}
                  {/* 댓글 영역 */}
                  <div className="border-top pt-4">
                    <h5 className="fw-bold text-dark mb-3">
                      댓글 {comments.length}개
                    </h5>

                    {commentsLoading ? (
                      <p className="text-muted small text-center py-3">
                        댓글을 불러오는 중...
                      </p>
                    ) : comments.length === 0 ? (
                      <p className="text-muted small text-center py-3 bg-light rounded-3">
                        아직 작성된 댓글이 없습니다.
                        첫 댓글을 남겨보세요!
                      </p>
                    ) : (
                      <div className="d-flex flex-column gap-2 mb-4">
                        {comments.map((comment) => (
                          <div
                            key={comment.commentNum}
                            className="border-bottom py-3"
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <strong>{comment.author || "익명"}</strong>

                              {isLoggedIn && memberNum != null && Number(comment.memberNum) === Number(memberNum) && (
                              <div className="d-flex gap-2">
                                {editingCommentNum !== comment.commentNum && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleStartEditComment(comment)}
                                  >
                                    수정
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={editingCommentNum === comment.commentNum}
                                  onClick={() => {
                                    if (comment.commentNum != null) {
                                      void handleDeleteComment(comment.commentNum);
                                    }
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                              )}
                            </div>

                            {editingCommentNum === comment.commentNum ? (
                              <div>
                                <textarea
                                  className="form-control mb-2"
                                  rows={3}
                                  value={editingCommentContent}
                                  maxLength={250}
                                  disabled={commentEditSubmitting}
                                  onChange={(event) =>
                                    setEditingCommentContent(event.target.value)
                                  }
                                />

                                <div className="small text-muted mb-2">
                                  {editingCommentContent.length}/250자
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    disabled={commentEditSubmitting}
                                    onClick={() => {
                                      setEditingCommentNum(null);
                                      setEditingCommentContent("");
                                    }}
                                  >
                                    취소
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    disabled={commentEditSubmitting}
                                    onClick={() => {
                                      if (comment.commentNum != null) {
                                        void handleUpdateComment(comment.commentNum);
                                      }
                                    }}
                                  >
                                    {commentEditSubmitting ? "수정 중..." : "수정 완료"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="text-dark"
                                style={{
                                  whiteSpace: "pre-wrap",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {comment.content}
                              </div>
                            )}
                          </div>
                        )
                        )}
                      </div>
                    )}

                    {/* 댓글 작성 */}
                    <form
                      onSubmit={(event) =>
                        void handleCreateComment(event)
                      }
                    >
                      <div className="input-group">
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="댓글을 남겨주세요..."
                          value={newCommentContent}
                          onChange={(event) =>
                            setNewCommentContent(
                              event.target.value
                            )
                          }
                          disabled={commentSubmitting}
                          required
                        />

                        <button
                          type="submit"
                          className="btn btn-primary px-4 fw-semibold"
                          disabled={commentSubmitting}
                        >
                          {commentSubmitting
                            ? "등록 중..."
                            : "등록하기"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light-subtle p-3 d-flex justify-content-between">
                  <div className="d-flex gap-2">
                    {/* 글 수정 */}
                    {!isEditMode && (
                      <button
                        type="button"
                        className="btn btn-outline-primary px-4 rounded-3 fw-semibold"
                        onClick={handleStartEdit}
                      >
                        글 수정
                      </button>
                    )}

                    {/* 글 삭제 */}
                    <button
                      type="button"
                      className="btn btn-outline-danger px-4 rounded-3 fw-semibold"
                      disabled={isEditMode || editSaving}
                      onClick={() => void handleDeletePost()}
                    >
                      글 삭제
                    </button>
                  </div>

                  {/* 닫기 */}
                  <button
                    type="button"
                    className="btn btn-secondary px-4 rounded-3 fw-semibold"
                    disabled={editSaving}
                    onClick={() => {
                      setIsEditMode(false);
                      setEditError("");
                      setSelectedPost(null);
                    }}
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
