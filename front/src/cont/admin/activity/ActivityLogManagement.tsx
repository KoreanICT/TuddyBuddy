// 허승표

import React, { useEffect, useState } from 'react'
import axios from 'axios';

// 해당 컴포넌트에서 사용할 CSS 입니다.
import styles from './activityLogManagement.module.css';


// 기존 프로젝트의 로그인 정보와 권한 확인 기능입니다.
import { useAuth } from '../../../login/hooks/useAuth';
import { useRoleAccess } from '../../../login/hooks/useRoleAccess';
import { ROLE_ACCESS } from '../../../login/auth/roles';

// 기존 프로젝트에서 사용하는 백엔드 주소입니다.
import { BACKEND_URL } from '../../../login/authHttp';



// =====================================================
// 1. 데이터 타입 정의
// =====================================================

// 로그 한 건의 구조입니다.
// DB의 확정된 6개 컬럼과 이름을 맞춥니다.
interface ActivityLog {
    activity_log_num: number;
    member_num: number;
    activity_occurred_at: string;
    activity_category: string;
    activity_action: string;
    activity_result: 'SUCCESS' | 'FAILURE';
}

// 백엔드의 PageVO에서 사용하는 페이지 정보입니다.
interface PageInfo {
    nowPage: number;        // 현재 페이지
    totalRecord: number;    // 전체 검색 결과 수
    totalPage: number;      // 전체 페이지 수
    startPage: number;      // 페이지 블록의 시작 번호
    endPage: number;        // 페이지 블록의 마지막 번호
}

// 백엔드 조회 API의 응답 구조입니다.
interface LogResponse {
    logs: ActivityLog[];    // 로그 목록
    page: PageInfo;  // 페이지 정보
}

// 검색창에 입력할 값입니다.
// input과 select의 값은 문자열로 관리합니다.
interface SearchForm {
    memberNum: string;
    category: string;
    result: string;
    startDate: string;
    endDate: string;
}

// 검색 조건의 초기값을 만듭니다.
// 빈 문자열은 "전체" 또는 "조건 없음"을 뜻합니다.
const createEmptyForm = (): SearchForm => ({
    memberNum: '',
    category: '',
    result: '',
    startDate: '',
    endDate: ''
});

// 페이지 정보의 초기값입니다.
// PageInfo에 선언한 항목을 모두 넣습니다.
const createEmptyPage = (): PageInfo => ({
    nowPage: 1,
    totalRecord: 0,
    totalPage: 0,
    startPage: 1,
    endPage: 0
});


// =====================================================
// 2. 영문 코드를 화면에 표시할 한글로 변환
// =====================================================

const categoryNames: Record<string, string> = {
    GROUP: '그룹',
    SELFSTUDY: '학습',
    TIMER: '타이머',
    CHATBOT: '챗봇',
    FRIEND: '친구',
    REPORT: '신고',
    NOTICE: '공지사항',
    MEMBER: '회원',
    STATISTICS: '통계',
    POINT: '포인트'
};

// 활동의 한글 이름입니다.
// 여기에 없는 코드는 영문 그대로 표시합니다.
const actionNames: Record<string, string> = {
    GROUP_CREATE: '그룹 생성',
    GROUP_JOIN: '그룹 가입',
    GROUP_MY_LIST: '내 그룹 조회',
    GROUP_PUBLIC_LIST: '공개 그룹 조회',
    GROUP_DETAIL_VIEW: '그룹 상세 조회',
    GROUP_UPDATE: '그룹 수정',
    GROUP_LEAVE: '그룹 탈퇴',
    GROUP_DELETE: '그룹 삭제',
    GROUP_MEMBER_LIST: '그룹원 조회',
    GROUP_MEMBER_KICK: '그룹원 강퇴',
    GROUP_LEADER_TRANSFER: '그룹장 위임',

    DOCUMENT_UPLOAD: '문서 업로드',
    DOCUMENT_LIST: '문서 목록 조회',
    DOCUMENT_DOWNLOAD_REQUEST: '문서 다운로드 요청',
    DOCUMENT_UPDATE: '문서 수정',
    DOCUMENT_DELETE: '문서 삭제',

    MEMO_CREATE: '메모 작성',
    MEMO_LIST: '메모 조회',
    MEMO_UPDATE: '메모 수정',
    MEMO_DELETE: '메모 삭제',

    DIAGRAM_SAVE: '다이어그램 저장',
    DIAGRAM_VIEW: '다이어그램 조회',

    QUIZ_GENERATE: 'AI 문제 생성',
    QUIZ_SUBMIT: '답안 제출',
    QUIZ_SESSION_LIST: '학습 이력 조회',
    QUIZ_SESSION_VIEW: '학습 세션 조회',
    QUIZ_SESSION_DELETE: '학습 세션 삭제',
    QUIZ_LIST: '문제 목록 조회',
    QUIZ_RESULT_LIST: '학습 결과 목록 조회',
    QUIZ_RESULT_VIEW: '학습 결과 조회',
    QUIZ_RESPONSE_LIST: '답안 내역 조회',

    TIMER_SESSION_CREATE: '타이머 생성',
    TIMER_SESSION_SAVE: '타이머 기록 저장',
    TIMER_SUMMARY_VIEW: '타이머 요약 조회',

    CHAT_MESSAGE_PROCESS: '챗봇 질문 처리',
    CHAT_SESSION_CREATE: '챗봇 대화 생성',
    CHAT_SESSION_VIEW: '챗봇 대화 조회',
    CHAT_SESSION_LIST: '챗봇 대화 목록 조회',
    CHAT_MESSAGE_LIST: '챗봇 메시지 조회',
    CHAT_MEMBER_MESSAGE_LIST: '회원 챗봇 메시지 조회',

    FRIEND_REQUEST: '친구 요청',
    FRIEND_ACCEPT: '친구 수락',
    FRIEND_REJECT: '친구 거절',
    FRIEND_DELETE: '친구 삭제',
    FRIEND_LIST: '친구 목록 조회',

    REPORT_CREATE: '신고 접수',
    REPORT_STATUS_CHANGE: '신고 상태 변경',
    REPORT_REPLY_CREATE: '신고 답변 작성',

    NOTICE_CREATE: '공지 작성',
    NOTICE_LIST: '공지 목록 조회',
    NOTICE_DETAIL_VIEW: '공지 상세 조회',
    NOTICE_UPDATE: '공지 수정',
    NOTICE_DELETE: '공지 삭제',

    MEMBER_PROFILE_UPDATE: '회원 정보 수정',
    MEMBER_PASSWORD_CHANGE: '비밀번호 변경',
    ADMIN_MEMBER_AUTHORITY_CHANGE: '회원 권한 변경',
    ADMIN_MEMBER_WITHDRAW: '관리자 회원 탈퇴 처리',

    STATISTICS_VIEW: '통계 조회',
    POINT_PAYMENT: '포인트 결제 처리'
};

// 서버가 보낸 날짜를 한국 시간으로 표시합니다.
const formatDate = (value: string): string => {
    const date = new Date(value);

    // 날짜 변환에 실패하면 원래 값을 표시합니다.
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('ko-KR', {
        timeZone: 'Asai/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

// =====================================================
// 3. 관리자 로그 조회 컴포넌트
// =====================================================

const ActivityLogManagement: React.FC = () => {
    const { memberNum, isLoggedIn } = useAuth();

    // 현재 사용자의 관리자 화면 접근 가능 여부를 확인합니다.
    const { hasRole } = useRoleAccess();
    const canView = hasRole(ROLE_ACCESS.admin);

    // 조회한 로그 목록입니다.
    const [logList, setLogList] = useState<ActivityLog[]>([]);

    // 서버가 보내준 페이지 정보입니다.
    const [pageInfo, setPageInfo] = useState<PageInfo>(createEmptyPage);

    // 검색창에 입력하고 있는 값입니다.
    const [formData, setFormData] = useState<SearchForm>(createEmptyForm);

    // 실제 조회에 적용된 검색 조건과 페이지 입니다.
    // formData와 분리하는 이유:
    // 입력할 때마다 조회하지 않고 검색 버튼을 눌렀을 때 조건을 적용하기 위해서 입니다.
    const [query, setQuery] = useState({
        search: createEmptyForm(),
        cPage: 1
    });

    const [loading, setLoading] = useState(false);

    // 서버 요청 오류와 검색 입력 오류를 구분합니다.
    const [error, setError] = useState('');
    const [searchError, setSearchError] = useState('');

    // =====================================================
    // 4. 로그 조회
    // 화면 진입 또는 query 변경 시 실행합니다.
    // =====================================================

    useEffect(() => {
        if (!isLoggedIn || !canView) {
            setLogList([]);
            setPageInfo(createEmptyPage());
            setLoading(false);
            setError('');
            return;
        }

        // 화면을 떠나거나 새 조회를 시작하면 이전 요청을 취소합니다.
        const controller = new AbortController();

        // 이전 응답이 늦게 와서 새 화면을 덮어쓰지 않게 합니다.
        let active = true;

        const getLogList = async () => {
            setLoading(true);
            setError('');
            setLogList([]);
            setPageInfo(createEmptyPage());

            try {
                const url = `${BACKEND_URL}/api/admin/activity-logs`;

                // axios.get으로 조회합니다.
                const response = await axios.get<LogResponse>(
                    url,
                    {
                        // 새 검색이나 화면 이동 시 이전 요청을 취소합니다.
                        signal: controller.signal,

                        // 서버로 보낼 검색 조건입니다.
                        // 빈 값은 undefined로 바꿔서 보내지 않습니다.
                        params: {
                            cPage: query.cPage,
                            memberNum: query.search.memberNum || undefined,
                            category: query.search.category || undefined,
                            result: query.search.result || undefined,
                            startDate: query.search.startDate || undefined,
                            endDate: query.search.endDate || undefined
                        }
                    }
                );

                if (!active) return;

                // 조회한 데이터를 useState에 저장합니다.
                setLogList(response.data.logs);
                setPageInfo(response.data.page);

            } catch (requestError) {
                // 취소한 요청은 오류 메시지를 표시하지 않습니다.
                if (!active || controller.signal.aborted) {
                    return;
                }

                if (axios.isAxiosError(requestError)) {
                    const status = requestError.response?.status;

                    if (status === 401) {
                        setError('로그인이 필요합니다.');
                    } else if (status === 403) {
                        setError('관리자만 조회할 수 있습니다.');
                    } else if (status === 400) {
                        setError('검색 조건을 확인해주세요.');
                    } else {
                        setError('로그 조회에 실패했습니다.');
                    }
                } else {
                    setError('로그 조회에 실패했습니다.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void getLogList();

        return () => {
            active = false;
            controller.abort();
        };
    }, [query, isLoggedIn, canView, memberNum]);

    // =====================================================
    // 5. 검색창 입력 처리
    // 수업의 formChange와 같은 name/value 방식입니다.
    // =====================================================

    // name/value 방식입니다.
    const formChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // 검색 버튼 또는 Enter를 누르면 실행합니다.
    const searchSubmit = (event: React.FormEvent) => {
        // form 제출로 브라우저가 새로고침되는 것을 막습니다.
        event.preventDefault();
        setSearchError('');

        const search = {
            ...formData,
            memberNum: formData.memberNum.trim()
        };

        // 회원 번호를 입력했다면 양의 정수인지 확인합니다.
        if (search.memberNum
            && !/^[1-9][0-9][0,18]$/.test(search.memberNum)
        ) {
            setSearchError('회원 번호는 양의 정수로 입력해주세요.');
            return;
        }

        // 시작일과 종료일을 모두 입력한 경우 순서를 확인합니다.
        if (search.startDate
            && search.endDate
            && search.startDate > search.endDate
        ) {
            setSearchError('시작일은 종료일보다 늦을 수 없습니다.');
            return;
        }

        // query가 변경되면 위 useEffect가 실행됩니다.
        // 새 검색은 첫 페이지부터 조회합니다.
        setQuery({ search, cPage: 1 });
    };

    // 입력값과 검색 조건을 모두 초기화합니다.
    const resetSearch = () => {
        setFormData(createEmptyForm());
        setSearchError('');

        setQuery({ search: createEmptyForm(), cPage: 1 });
    };

    // 검색 조건은 유지하고 페이지 번호만 변경합니다.
    const movePage = (page: number) => {
        if (loading || page < 1) return;

        // 기존 검색 조건을 유지하고 페이지 번호만 변경합니다.
        setQuery(previous => ({
            ...previous,
            cPage: page
        }));
    };

    // 백엔드가 보내준 시작, 종료 페이지로 버튼 번호를 만듭니다.
    // 예: [1, 2, 3, 4, 5]
    const pageNumbers: number[] = [];

    for (
        let page = pageInfo.startPage;
        page <= pageInfo.endPage;
        page++
    ) {
        pageNumbers.push(page);
    }

    // =====================================================
    // 6. 권한 확인 화면
    // 실제 조회 권한은 백엔드에서도 검사해야 합니다.
    // =====================================================

    if (!isLoggedIn) {
        return (
            <div className={styles.container}>
                <p>로그인이 필요합니다.</p>
            </div>
        );
    }

    if (!canView) {
        return (
            <div className={styles.container}>
                <p>관리자만 조회할 수 있습니다.</p>
            </div>
        );
    }


    // =====================================================
    // 7. 화면 출력
    // =====================================================

    return (
        <div className={styles.container}>
            <h2>사용자 활동 로그</h2>

            <p className={styles.description}>
                회원이 실행한 기능의 성공·실패 기록을 조회합니다.
            </p>

            {/* 검색창 */}
            <form
                className={styles.searchForm}
                onSubmit={searchSubmit}
            >
                <label>
                    회원 번호
                    <input
                        type='text' inputMode='numeric' name='memberNum'
                        maxLength={19} value={formData.memberNum}
                        onChange={formChange} placeholder='전체 회원'
                    />
                </label>
                <label>
                    카테고리
                    <select
                        name='category' value={formData.category} onChange={formChange}
                    >
                        <option value=''>전체</option>
                        {Object.entries(categoryNames).map(
                            ([code, name]) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            )
                        )}
                    </select>
                </label>
                <label>
                    실행 결과
                    <select name='result' value={formData.result} onChange={formChange}>
                        <option value=''>전체</option>
                        <option value='SUCCESS'>성공</option>
                        <option value='FAILURE'>실패</option>
                    </select> 
                </label>
                <label>
                    시작일
                    <input
                        type='date' name='startDate'
                        value={formData.startDate} onChange={formChange}
                    />
                </label>
                <label>
                    종료일
                    <input
                        type='date' name='endDate'
                        value={formData.endDate} onChange={formChange}
                    />
                </label>
                <div className={styles.buttons}>
                    <button type='submit' disabled={loading}>
                        검색
                    </button>
                    <button type='button' onClick={resetSearch} disabled={loading}>
                        초기화
                    </button>
                </div>
            </form>

            {/* 잘못 입력한 검색 조건 안내 */}
            {searchError && (
                <p className={styles.error} role='alert'>
                    {searchError}
                </p>
            )}

            {/* 서버 요청 오류 안내 */}
            {error && (
                <p className={styles.error} role='alert'>
                    {error}
                </p>
            )}

            {/* 조회 상태와 전체 검색 결과 수 */}
            <p aria-live='polite'>
                {loading
                    ? '조회 중입니다.'
                    : error
                        ? '로그 조회에 실패했습니다.'
                        : `총 ${pageInfo.totalRecord.toLocaleString()}건`}
            </p>

            {/* 로그 목록 표 */}
            <div className={styles.tableWrap}>
                <table className={styles.boardTable}>
                    <caption>사용자 활동 로그 목록</caption>
                    <thead>
                        <tr>
                            <th scope='col'>로그 번호</th>
                            <th scope='col'>회원 번호</th>
                            <th scope='col'>발생 시각·한국 시간</th>
                            <th scope='col'>카테고리</th>
                            <th scope='col'>실행 기능</th>
                            <th scope='col'>결과</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    로그를 불러오는 중입니다.
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6}>
                                    조회된 로그가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            // 조회 결과를 map으로 한 행씩 출력합니다.
                            logList.map(item => (
                                <tr key={item.activity_log_num}>
                                    <td>{item.activity_log_num}</td>
                                    <td>{item.member_num}</td>
                                    <td>
                                        {categoryNames[
                                            item.activity_category
                                        ] || item.activity_category}
                                    </td>
                                    <td>
                                        {actionNames[
                                            item.activity_action
                                        ] || item.activity_action}
                                    </td>
                                    <td
                                        className={item.activity_result === 'SUCCESS'
                                            ? styles.success : styles.failure}
                                    >
                                        {item.activity_result === 'SUCCESS' ? '성공' : '실패'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지 이동 버튼 */}
            {!loading && !error && (
                <nav
                    className={styles.pagination}
                    aria-label='로그 목록 페이지'
                >
                    <button
                        type='button' disabled={query.cPage <= 1}
                        onClick={() => movePage(query.cPage - 1)}
                    >
                        이전
                    </button>

                    {pageNumbers.map(page => (
                        <button
                            key={page} type='button'
                            onClick={() => movePage(page)}
                            aria-current={query.cPage === page ? 'page' : undefined}
                            className={query.cPage === page ? styles.activePage : ''}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type='button' disabled={query.cPage >= pageInfo.totalPage}
                        onClick={() => movePage(query.cPage + 1)}
                    >
                        다음
                    </button>
                </nav>
            )}
        </div>
    );
};

export default ActivityLogManagement