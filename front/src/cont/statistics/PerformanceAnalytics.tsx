//김진규
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookOpen, Brain, MessageSquareQuote, TrendingUp, BarChart3 } from 'lucide-react';
import { CategoryOption, ChartDataState, LLMFeedbackState, PersistedStatisticsAnalysis, StatisticsApiResponse } from './types';
import { StatisticsDetailCharts, StatisticsOverviewCharts } from './StatisticsCharts';
import './PerformanceAnalytics.css';
import { useAuth } from '../../login/hooks/useAuth';
import { BACKEND_URL } from '../../login/authHttp';

const STATISTICS_ANALYSIS_STORAGE_KEY = 'tuddybuddy:statistics-analysis';

export default function PerformanceAnalytics() {
    // 로그인한 회원의 식별자와 백엔드 요청에 사용할 JWT를 인증 훅에서 가져옵니다.
    const { memberNum, token } = useAuth();
    const navigate = useNavigate();

    // /getCategories 응답의 카테고리 목록과 현재 선택한 DB category_id를 저장합니다.
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // 한 번 받아온 전체 통계 응답입니다. 카테고리 선택 시 이 응답에서 필요한 항목만 골라 표시합니다.
    const [allStatistics, setAllStatistics] = useState<StatisticsApiResponse | null>(null);

    // 현재 선택한 카테고리에 해당하는 차트 데이터만 보관합니다.
    const [chartData, setChartData] = useState<ChartDataState | null>(null);

    // 현재 선택한 카테고리에 해당하는 LLM 평가분석 응답만 보관합니다.
    const [llmFeedback, setLlmFeedback] = useState<LLMFeedbackState | null>(null);

    // 요청 진행 상태, 분석 결과 사용 가능 여부, 결과를 불러온 회원, 안내 문구, 결제 확인 모달 상태입니다.
    const [loading, setLoading] = useState<boolean>(false);
    const [analysisUnlocked, setAnalysisUnlocked] = useState<boolean>(false);
    const [analysisOwnerMemberNum, setAnalysisOwnerMemberNum] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
    const [pointBalance, setPointBalance] = useState<number | null>(null);
    const [pointBalanceLoading, setPointBalanceLoading] = useState<boolean>(false);
    const [pointBalanceError, setPointBalanceError] = useState<string>('');

    // 기존 회원 정보 조회 API에서 결제 모달에 표시할 현재 잔액을 가져옵니다.
    const loadPointBalance = async () => {
        setPointBalanceLoading(true);
        setPointBalanceError('');
        try {
            if (typeof token !== 'string' || token.trim() === '' || memberNum == null) {
                throw new Error('로그인 정보를 확인할 수 없습니다.');
            }
            const response = await axios.get<{ member_num: number; point: number | string }>(
                `${BACKEND_URL}/api/member/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const balance = Number(response.data.point);
            if (response.data.member_num !== memberNum || !Number.isFinite(balance)) {
                throw new Error('회원 포인트 응답을 확인할 수 없습니다.');
            }
            setPointBalance(balance);
        } catch (error) {
            console.error('평가분석 결제 전 포인트 잔액 조회 실패:', error);
            setPointBalance(null);
            setPointBalanceError('현재 포인트를 확인하지 못했어요. 다시 불러와 주세요.');
        } finally {
            setPointBalanceLoading(false);
        }
    };

    const openPurchaseModal = () => {
        setErrorMessage('');
        setPointBalance(null);
        setShowPurchaseModal(true);
        void loadPointBalance();
    };

    // 결제 확인 모달이 열린 동안 Escape 키로 닫을 수 있게 키보드 이벤트를 등록합니다.
    useEffect(() => {
        if (!showPurchaseModal) return;

        const closeModalOnEscape = (event: KeyboardEvent) => {
            // 요청 중에는 모달을 닫지 못하게 해 진행 상태를 유지합니다.
            if (event.key === 'Escape' && !loading) setShowPurchaseModal(false);
        };
        window.addEventListener('keydown', closeModalOnEscape);
        // 모달이 닫히거나 컴포넌트가 사라질 때 이벤트 리스너를 정리합니다.
        return () => window.removeEventListener('keydown', closeModalOnEscape);
    }, [loading, showPurchaseModal]);

    // 브라우저에 저장된 분석 결과를 읽어 새로고침이나 화면 재방문 후 복원합니다.
    useEffect(() => {
        // 회원번호가 없거나 안전한 양의 정수가 아니면 회원별 저장 결과를 조회하지 않습니다.
        if (memberNum == null || !Number.isSafeInteger(memberNum) || memberNum <= 0) return;

        // 저장할 때 사용한 고정 키로 분석 결과를 찾습니다. 아래에서 저장된 회원번호도 대조합니다.
        const storageKey = STATISTICS_ANALYSIS_STORAGE_KEY;
        try {
            // 로컬 스토리지에서 직전 분석 결과를 문자열로 가져옵니다.
            const savedValue = localStorage.getItem(storageKey);

            // 저장된 값이 없으면 복원할 분석 결과가 없으므로 종료합니다.
            if (!savedValue) return;

            // JSON 문자열을 저장 구조로 변환한 뒤, 아래에서 필수 필드와 회원 소유자를 확인합니다.
            const saved = JSON.parse(savedValue) as PersistedStatisticsAnalysis;

            // 오래된 버전, 다른 회원 소유 데이터, 필수 응답 배열 누락 등 복원 불가능한 값을 걸러냅니다.
            const isValid = saved.cacheVersion === 1
                && saved.memberNum === memberNum
                && Array.isArray(saved.categories)
                && saved.categories.length > 0
                && saved.categories.every((category) =>
                    Number.isSafeInteger(category.categoryId) && typeof category.categoryName === 'string'
                )
                && saved.response?.chartData != null
                && Array.isArray(saved.response.chartData.history)
                && Array.isArray(saved.response.chartData.prediction?.categoryPredictions)
                && Array.isArray(saved.response.chartData.subjectShare)
                && Array.isArray(saved.response.llmFeedback?.categoryAnalyses);

            if (!isValid) {
                // 손상되었거나 현재 회원에게 속하지 않은 값은 재사용하지 않고 제거합니다.
                localStorage.removeItem(storageKey);
                return;
            }

            // 이전에 선택했던 카테고리가 현재 저장 목록에 있는지 확인합니다.
            const selectedCategoryExists = saved.categories.some(
                (category) => category.categoryId === saved.selectedCategoryId
            );
            // 카테고리 목록과 전체 응답을 복원하고, 유효한 이전 선택 또는 첫 카테고리를 기본 선택합니다.
            setCategories(saved.categories);
            setSelectedCategoryId(selectedCategoryExists
                ? saved.selectedCategoryId
                : saved.categories[0].categoryId);
            setAllStatistics(saved.response);
            setAnalysisOwnerMemberNum(memberNum);
            setAnalysisUnlocked(true);
        } catch (error) {
            // JSON 파싱이나 스토리지 접근에 실패하면 오류를 기록하고 저장 데이터를 폐기합니다.
            console.error('저장된 평가분석 결과를 복원하지 못했습니다:', error);
            localStorage.removeItem(storageKey);
        }
    }, [memberNum]);

    // 다른 탭에서 로그아웃해 저장 응답이 삭제되면 이 탭의 화면 상태도 함께 초기화합니다.
    useEffect(() => {
        const clearAnalysisOnStorageRemoval = (event: StorageEvent) => {
            // 분석 결과 저장 키가 삭제된 이벤트만 처리합니다.
            if (event.key !== STATISTICS_ANALYSIS_STORAGE_KEY || event.newValue !== null) return;
            setCategories([]);
            setSelectedCategoryId(null);
            setAllStatistics(null);
            setChartData(null);
            setLlmFeedback(null);
            setAnalysisOwnerMemberNum(null);
            setAnalysisUnlocked(false);
        };

        // 다른 브라우저 탭에서 발생한 로컬 스토리지 변경을 감시합니다.
        window.addEventListener('storage', clearAnalysisOnStorageRemoval);
        // 컴포넌트가 사라질 때 감시 이벤트를 제거합니다.
        return () => window.removeEventListener('storage', clearAnalysisOnStorageRemoval);
    }, []);

    // 전체 응답에서 선택된 categoryId와 일치하는 데이터만 추려 화면 상태에 반영합니다.
    // 이미 받은 응답을 필터링하므로 카테고리 변경만으로 서버 요청이나 포인트 차감이 발생하지 않습니다.
    useEffect(() => {
        // 데이터가 아직 없거나 현재 로그인 회원의 결과가 아니면 이전 카테고리 화면을 비웁니다.
        if (!allStatistics || selectedCategoryId === null || analysisOwnerMemberNum !== memberNum) {
            setChartData(null);
            setLlmFeedback(null);
            return;
        }

        const responseChartData = allStatistics.chartData;
        // 선택 카테고리의 시험 이력만 남기고, 화면 x축 표시는 1회부터 순서대로 구성합니다.
        const history = responseChartData.history.filter(
            (item) => item.categoryId === selectedCategoryId
        ).map((item, index) => ({
            ...item,
            round: `${index + 1}회`,
        }));
        // 예측 응답의 카테고리 묶음 중 선택 카테고리를 포함한 결과만 고릅니다.
        const prediction = responseChartData.prediction.categoryPredictions
            .filter((category) => category.categoryIds.includes(selectedCategoryId))
            // 한 카테고리의 실제 점수와 예측 점수 항목을 차트가 바로 그릴 수 있는 배열로 펼칩니다.
            .flatMap((category) =>
                category.prediction.map((item) => ({
                    ...item,
                    name: `${category.categoryName} · ${item.name}`,
                    categoryId: selectedCategoryId,
                    categoryIds: category.categoryIds,
                    categoryName: category.categoryName,
                }))
            );
        // 오답 과목 분포에서 선택 카테고리에 속한 과목만 남깁니다.
        const subjectShare = responseChartData.subjectShare.filter(
            (item) => item.categoryId === selectedCategoryId
        );
        // 평가분석 응답에서도 선택 카테고리 ID가 포함된 결과만 남깁니다.
        const categoryAnalyses = allStatistics.llmFeedback.categoryAnalyses.filter(
            (analysis) => analysis.categoryIds.includes(selectedCategoryId)
        );

        // 필터링한 차트 데이터와 평가분석 데이터를 각각 화면 상태에 저장합니다.
        setChartData({ history, prediction, subjectShare });
        setLlmFeedback({ categoryAnalyses });
    }, [allStatistics, analysisOwnerMemberNum, memberNum, selectedCategoryId]);

    // 전체 응답과 마지막 선택 카테고리를 로컬 스토리지에 저장해 화면 재방문 시 복원할 수 있게 합니다.
    useEffect(() => {
        // 현재 회원의 분석 결과와 선택 카테고리가 모두 준비된 경우에만 저장합니다.
        if (memberNum == null || analysisOwnerMemberNum !== memberNum
            || !allStatistics || selectedCategoryId === null || categories.length === 0) return;

        // 저장 버전, 소유 회원번호, 카테고리 선택, 전체 서버 응답을 한 객체로 묶습니다.
        const saved: PersistedStatisticsAnalysis = {
            cacheVersion: 1,
            memberNum,
            selectedCategoryId,
            categories,
            response: allStatistics,
        };
        try {
            // JSON 문자열로 변환해 브라우저 저장소에 기록합니다.
            localStorage.setItem(
                STATISTICS_ANALYSIS_STORAGE_KEY,
                JSON.stringify(saved)
            );
        } catch (error) {
            // 저장소 용량이나 브라우저 정책으로 저장에 실패해도 이미 받은 분석 결과는 화면에 유지합니다.
            console.error('평가분석 결과를 브라우저에 저장하지 못했습니다:', error);
        }
    }, [allStatistics, analysisOwnerMemberNum, categories, memberNum, selectedCategoryId]);

    const handleStartAnalysis = async () => {
        // 새 분석 요청을 시작하면서 로딩 표시, 모달, 이전 오류 안내를 초기화합니다.
        setLoading(true);
        setShowPurchaseModal(false);
        setErrorMessage('');
        let statisticsRequestStarted = false;
        try {
            // 요청에 사용할 로그인 토큰이 비어 있지 않은 문자열인지 확인합니다.
            if (typeof token !== 'string' || token.trim() === '') {
                throw new Error('로그인 토큰을 확인할 수 없습니다.');
            }
            // 인증 훅에서 얻은 회원번호가 유효한 양수인지 확인합니다.
            if (memberNum == null || !Number.isFinite(memberNum) || memberNum <= 0) {
                throw new Error('회원 번호를 확인할 수 없습니다.');
            }

            // 두 API 요청에서 공통으로 사용할 JWT Bearer 인증 헤더를 구성합니다.
            const headers = { Authorization: `Bearer ${token}` };
            // 먼저 회원이 시험을 본 카테고리를 조회합니다. 여기서는 포인트를 차감하지 않습니다.
            const categoriesResponse = await axios.post<CategoryOption[]>(`${BACKEND_URL}/api/statistics/getCategories`, {
                memberNum,
            }, { headers });

            if (!Array.isArray(categoriesResponse.data)) {
                // 예상한 카테고리 배열이 아니면 응답 형식 오류로 처리합니다.
                throw new Error('카테고리 응답 형식이 올바르지 않습니다.');
            }
            if (categoriesResponse.data.length === 0) {
                // 응시 기록이 없으면 유료 분석 요청을 보내지 않고 사용자 안내만 표시합니다.
                setErrorMessage('아직 시험 기록이 없습니다. 셀프스터디에서 문제를 만들고 풀어보세요. 시험 기록이 생기면 이곳에서 카테고리별 평가분석과 성적예측을 확인할 수 있습니다.');
                return;
            }
            // 응답 카테고리 목록을 저장하고 첫 카테고리를 기본 선택으로 지정합니다.
            setCategories(categoriesResponse.data);
            setSelectedCategoryId(categoriesResponse.data[0].categoryId);

            // 이후 요청은 포인트 결제가 포함된 평가분석·예측 요청임을 표시합니다.
            statisticsRequestStarted = true;

            // 회원번호와 결제 설명을 보내 분석을 요청합니다. 백엔드에서 포인트 차감 후 LLM 결과를 반환합니다.
            const response = await axios.post<StatisticsApiResponse>(`${BACKEND_URL}/api/statistics/getStatistics`, {
                memberNum,
                description: '평가분석 및 성적예측 이용',
            }, { headers });

            // 성공 응답과 첫 선택 카테고리를 복원용 데이터로 구성합니다.
            const firstCategoryId = categoriesResponse.data[0].categoryId;
            const saved: PersistedStatisticsAnalysis = {
                cacheVersion: 1,
                memberNum,
                selectedCategoryId: firstCategoryId,
                categories: categoriesResponse.data,
                response: response.data,
            };
            try {
                // 성공 결과를 저장해 새로고침이나 화면 재방문 시 다시 요청하지 않도록 합니다.
                localStorage.setItem(
                    STATISTICS_ANALYSIS_STORAGE_KEY,
                    JSON.stringify(saved)
                );
            } catch (error) {
                // 저장 실패는 결과 수신 성공과 분리해 처리합니다.
                console.error('평가분석 결과를 브라우저에 저장하지 못했습니다:', error);
            }

            // 응답을 현재 회원 소유의 전체 결과로 설정하고 분석 화면을 엽니다.
            setAnalysisOwnerMemberNum(memberNum);
            setAllStatistics(response.data);
            setAnalysisUnlocked(true);
        } catch (error) {
            console.error('평가분석 요청 실패:', error);
            // 포인트 결제 요청 전 오류와 요청 후 오류를 구분해 사용자에게 상황을 안내합니다.
            if (!statisticsRequestStarted) {
                setErrorMessage('시험 기록을 불러오지 못했어요. 포인트는 사용되지 않았습니다! 로그인 상태와 인터넷 연결을 확인한 뒤 다시 시도해 주세요.');
            } else if (axios.isAxiosError(error) && error.response) {
                setErrorMessage('분석을 마치지 못했어요. 이번 분석에 사용된 포인트는 다시 돌려드려요! 잔액을 확인하고 잠시 후 다시 시도해 주세요.');
            } else {
                setErrorMessage('분석 결과를 확인하지 못했어요. 포인트 처리 여부를 알 수 없으니 잔액을 먼저 확인해 주세요! 포인트가 차감됐다면 재시도 전에 고객센터로 문의해 주세요.');
            }
        } finally {
            // 성공·실패·조기 종료와 관계없이 요청 진행 상태를 해제합니다.
            setLoading(false);
        }
    };

    // 잔액이 부족하면 분석 요청 대신 기존 포인트 구매 화면으로 이동합니다.
    const handlePurchaseModalAction = () => {
        if (pointBalance !== null && pointBalance < 1_000) {
            setShowPurchaseModal(false);
            navigate('/point');
            return;
        }
        void handleStartAnalysis();
    };

    // 전체 응답의 회차 이력으로 카테고리별 평균과 응시 횟수를 계산합니다.
    const allHistory = allStatistics?.chartData.history ?? [];
    const overviewMetrics = categories.map((category) => {
        const scores = allHistory
            .filter((item) => item.categoryId === category.categoryId)
            .map((item) => item.score)
            .filter((score) => Number.isFinite(score));
        return {
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            attempts: scores.length,
            averageScore: scores.length
                ? Number((scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1))
                : 0,
        };
    }).filter((category) => category.attempts > 0);
    const overallAverage = allHistory.length
        ? allHistory.reduce((total, item) => total + item.score, 0) / allHistory.length
        : 0;
    // 분석 결과가 없거나 현재 로그인 회원의 결과가 아니면 결제 안내 화면을 표시합니다.
    if (!analysisUnlocked || analysisOwnerMemberNum !== memberNum) {
        return (
            <div className="analytics-page">
                <div className="container">
                    <section className="analytics-gate-card" aria-labelledby="analysis-gate-title">
                        <div className="analytics-gate-icon" aria-hidden="true">
                            <Brain size={24} />
                        </div>
                        <p className="analytics-gate-eyebrow">AI 학습 리포트</p>
                        <h2 id="analysis-gate-title">내 학습을 분석하고 다음 목표를 세워보세요</h2>
                        <p className="analytics-gate-description">
                            응시 기록과 오답 데이터를 바탕으로 전체 카테고리의 평가분석과 LLM 성적예측을 제공합니다.
                        </p>
                        <ul className="analytics-gate-benefits">
                            <li><TrendingUp size={16} /> 카테고리별 성적 변화와 예측</li>
                            <li><TrendingUp size={16} /> 과목별 오답 현황</li>
                            <li><BookOpen size={16} /> 취약점 분석과 맞춤 학습 경로</li>
                        </ul>
                        <div className="analytics-gate-price">
                            <span>이용 포인트</span>
                            <strong>1,000P</strong>
                        </div>
                        {/* 요청 실패나 응시 기록 부재에 대한 안내를 결제 버튼 위에 표시합니다. */}
                        {errorMessage && <p className="analytics-gate-error" role="alert">{errorMessage}</p>}
                        {/* 확인 모달을 열며, 실제 분석 요청은 모달에서 동의한 뒤 시작합니다. */}
                        <button
                            className="analytics-gate-button"
                            type="button"
                            onClick={openPurchaseModal}
                            disabled={loading}
                        >
                            {loading ? '카테고리 및 분석 데이터를 불러오는 중...' : '1,000포인트로 분석 시작'}
                        </button>
                    </section>
                    {/* 포인트 사용과 결과 보관 안내를 확인하는 기존 결제 모달입니다. */}
                    {showPurchaseModal && (
                        <div
                            className="analytics-purchase-modal-backdrop"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget && !loading) setShowPurchaseModal(false);
                            }}
                        >
                            <section
                                className="analytics-purchase-modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="analytics-purchase-title"
                                aria-describedby="analytics-purchase-description"
                            >
                                <div className="analytics-purchase-modal-icon" aria-hidden="true">
                                    <Brain size={22} />
                                </div>
                                <h2 id="analytics-purchase-title">평가분석을 시작할까요?</h2>
                                <p id="analytics-purchase-description" className="analytics-purchase-modal-description">
                                    응시 기록과 오답을 살펴보고, 다음 학습 방향을 함께 찾아볼게요.
                                </p>
                                <div className="analytics-purchase-modal-balance" aria-live="polite">
                                    {pointBalanceLoading ? (
                                        <p className="analytics-purchase-balance-status">현재 포인트를 확인하고 있어요…</p>
                                    ) : pointBalanceError ? (
                                        <div className="analytics-purchase-balance-error">
                                            <p>{pointBalanceError}</p>
                                            <button type="button" onClick={() => void loadPointBalance()}>다시 확인</button>
                                        </div>
                                    ) : pointBalance !== null ? (
                                        <>
                                            <div><span>현재 포인트</span><strong>{pointBalance.toLocaleString('ko-KR')}P</strong></div>
                                            <div><span>분석 이용료</span><strong>−1,000P</strong></div>
                                            <div className="analytics-purchase-balance-after">
                                                <span>예상 잔액</span>
                                                <strong>{pointBalance >= 1_000
                                                    ? `${(pointBalance - 1_000).toLocaleString('ko-KR')}P`
                                                    : '결제할 수 없어요'}</strong>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                                {pointBalance !== null && pointBalance < 1_000 && (
                                    <p className="analytics-purchase-insufficient" role="alert">
                                        포인트가 조금 부족해요. 충전한 뒤 다시 이용해 주세요!
                                    </p>
                                )}
                                <p className="analytics-purchase-modal-notice">
                                    분석 결과는 로그인 중에 저장돼요. 로그아웃하면 결과가 사라지고, 다시 분석할 때 이용료가 발생해요.
                                </p>
                                <div className="analytics-purchase-modal-actions">
                                    <button
                                        className="analytics-purchase-cancel"
                                        type="button"
                                        onClick={() => setShowPurchaseModal(false)}
                                        autoFocus
                                    >
                                        취소
                                    </button>
                                    <button
                                        className="analytics-purchase-confirm"
                                        type="button"
                                        onClick={handlePurchaseModalAction}
                                        disabled={pointBalanceLoading || pointBalanceError !== '' || pointBalance === null}
                                    >
                                        {pointBalance !== null && pointBalance < 1_000 ? '포인트 충전하러 가기' : '확인하고 분석 시작'}
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="container">

                {/* 이미 받은 전체 카테고리 이력으로 종합 지표와 비교 차트를 만듭니다. 별도 통계 API를 호출하지 않습니다. */}
                <section className="analytics-overview card" aria-labelledby="analytics-overview-title">
                    <div className="analytics-overview-heading">
                        <div className="analytics-overview-icon"><BarChart3 size={20} /></div>
                        <div>
                            <h1 id="analytics-overview-title">전체 학습 한눈에 보기</h1>
                            <p>지금까지의 시험 기록을 모아 카테고리별 흐름을 정리했어요.</p>
                        </div>
                    </div>
                    <div className="analytics-overview-summary">
                        <article>
                            <span>전체 응시</span>
                            <strong>{allHistory.length.toLocaleString('ko-KR')}회</strong>
                        </article>
                        <article>
                            <span>전체 평균</span>
                            <strong>{allHistory.length ? `${overallAverage.toFixed(1)}점` : '기록 없음'}</strong>
                        </article>
                        <article>
                            <span>분석 카테고리</span>
                            <strong>{overviewMetrics.length.toLocaleString('ko-KR')}개</strong>
                        </article>
                    </div>
                    <StatisticsOverviewCharts metrics={overviewMetrics} />
                </section>

                {/* 상단 제목과 카테고리 선택 컨트롤입니다. 선택 변경은 아래 필터링 효과를 다시 실행합니다. */}
                <header className="analytics-header">
                    <div className="header-title">
                        <h2>카테고리별 상세 분석</h2>
                        <p>궁금한 카테고리를 선택하면 성적 변화와 맞춤 학습 안내를 볼 수 있어요.</p>
                    </div>

                    <div className="category-selector">
                        <BookOpen className="icon" size={18} />
                        <label htmlFor="subject-select" className="label">분석 카테고리:</label>
                        <select
                            id="subject-select"
                            value={selectedCategoryId ?? ''}
                            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                            className="select-box"
                        >
                            {categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* 현재 선택 카테고리에 대한 시험 이력, 예측 점수, 과목별 오답 현황 차트입니다. */}
                <StatisticsDetailCharts chartData={chartData} />

                {/* 선택한 카테고리의 LLM 평가분석, 취약점, 맞춤 학습 경로를 표시합니다. */}
                {llmFeedback && (
                    <section className="card feedback-card">
                        {llmFeedback.categoryAnalyses.length === 0 ? (
                            <p>아직 이 카테고리의 분석 결과가 없어요. 시험 기록이 쌓이면 여기에서 확인할 수 있습니다.</p>
                        ) : llmFeedback.categoryAnalyses.map((analysis) => (
                            <div className="feedback-section" key={analysis.categoryIds.join('-')}>
                                <div className="card-header feedback-category-header">
                                    <MessageSquareQuote size={22} />
                                    <h2>{analysis.categoryName} 학습 피드백</h2>
                                </div>
                                <div className="mentor-speech-box">
                                    <p>{analysis.mentorComment}</p>
                                </div>

                                <div className="consulting-grid">
                                    <div className="consulting-col">
                                        <h3 className="section-title">
                                            <AlertTriangle className="icon warning" size={16} /> 다음에 함께 살펴볼 부분
                                        </h3>
                                        <div className="weakness-list">
                                            {analysis.weaknesses.map((weakness, idx) => (
                                                <div key={idx} className="weakness-item">
                                                    <p className="reason">{weakness}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="consulting-col">
                                        <h3 className="section-title">
                                            <Brain className="icon primary" size={16} /> 다음 학습 추천
                                        </h3>
                                        <ol className="consulting-path">
                                            {analysis.consultingPath.map((step, idx) => (
                                                <li key={idx}>
                                                    <span className="step-num">{idx + 1}</span>
                                                    <span className="step-text">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

            </div>
        </div>
    );
}
