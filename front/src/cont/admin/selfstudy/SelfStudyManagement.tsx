//최솔
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, RefreshCw, Trash2, RotateCcw } from 'lucide-react';
import styles from './selfStudyManagement.module.css';
import { Category, SelfStudyUsage, Subject, selfStudyAdminApi, adminErrorMessage } from './selfStudyAdminApi';

type AdminTab = 'content' | 'usage';

const SelfStudyManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [showCategoryTrash, setShowCategoryTrash] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryList, subjectList] = await Promise.all([
        selfStudyAdminApi.categories(), selfStudyAdminApi.subjects()
      ]);
      setCategories(categoryList);
      setSubjects(subjectList);
    } catch (e) { setError(adminErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try { await action(); await load(); }
    catch (e) { window.alert(adminErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const addCategory = async () => {
    const name = window.prompt('새 카테고리 이름을 입력하세요.');
    if (!name?.trim()) return;
    await run(() => selfStudyAdminApi.createCategory(name.trim()));
  };
  const editCategory = async (category: Category) => {
    const name = window.prompt('카테고리 이름 수정', category.categoryName);
    if (!name?.trim() || name.trim() === category.categoryName) return;
    await run(() => selfStudyAdminApi.updateCategory(category.categoryId, name.trim()));
  };
  const toggleCategory = async (category: Category) => {
    const next = category.categoryStatus === 'Y' ? 'N' : 'Y';
    const verb = next === 'N' ? '비활성화' : '복구';
    if (!window.confirm(`카테고리 "${category.categoryName}"을(를) ${verb}할까요?\n기존 데이터는 삭제되지 않습니다.`)) return;
    await run(() => selfStudyAdminApi.setCategoryStatus(category.categoryId, next));
  };
  const permanentlyDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `"${category.categoryName}" 카테고리와 연결된 과목 및 셀프스터디 데이터를 영구 삭제할까요?\n` +
      '생성된 문제, 제출 결과, 답안도 함께 삭제되며 복구할 수 없습니다. 보존하려면 삭제(비활성)를 사용해주세요.'
    );
    if (!confirmed) return;
    await run(async () => {
      await selfStudyAdminApi.permanentlyDeleteCategory(category.categoryId);
      if (selectedCategoryId === category.categoryId) setSelectedCategoryId(null);
    });
  };
  const addSubject = async () => {
    if (selectedCategoryId === null) { window.alert('카테고리를 먼저 선택하세요.'); return; }
    const category = categories.find(c => c.categoryId === selectedCategoryId);
    if (category?.categoryStatus !== 'Y') { window.alert('활성 카테고리에만 과목을 추가할 수 있습니다.'); return; }
    const name = window.prompt('새 과목 이름을 입력하세요.');
    if (!name?.trim()) return;
    await run(() => selfStudyAdminApi.createSubject(selectedCategoryId, name.trim()));
  };
  const editSubject = async (subject: Subject) => {
    const name = window.prompt('과목 이름 수정', subject.subjectName);
    if (!name?.trim() || name.trim() === subject.subjectName) return;
    await run(() => selfStudyAdminApi.updateSubject(subject.subjectId, name.trim()));
  };
  const toggleSubject = async (subject: Subject) => {
    const next = subject.subjectStatus === 'Y' ? 'N' : 'Y';
    const verb = next === 'N' ? '비활성화' : '복구';
    if (!window.confirm(`과목 "${subject.subjectName}"을(를) ${verb}할까요?`)) return;
    await run(() => selfStudyAdminApi.setSubjectStatus(subject.subjectId, next));
  };

  const visibleSubjects = selectedCategoryId === null ? subjects : subjects.filter(s => s.categoryId === selectedCategoryId);
  const busy = loading || saving;
  const selectedCategory = categories.find(c => c.categoryId === selectedCategoryId);
  const visibleCategories = categories.filter(c => showCategoryTrash ? c.categoryStatus === 'N' : c.categoryStatus === 'Y');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div><h1>셀프스터디 관리</h1><p>{activeTab === 'content' ? 'AI 학습 카테고리와 과목을 관리합니다. 비활성 삭제는 데이터를 보존하고, 영구 삭제는 되돌릴 수 없습니다.' : '선택 기간별 문제 생성과 학습 결과를 확인합니다.'}</p></div>
          {activeTab === 'content' && <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void load()}><RefreshCw size={16}/> 새로고침</button>}
        </header>
        <div className={styles.tabs} aria-label="셀프스터디 관리자 메뉴">
          <button type="button" aria-pressed={activeTab === 'content'} className={activeTab === 'content' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('content')}>콘텐츠 관리</button>
          <button type="button" aria-pressed={activeTab === 'usage'} className={activeTab === 'usage' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('usage')}>이용 현황</button>
        </div>
        {activeTab === 'content' ? <>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><h2>{showCategoryTrash ? '카테고리 휴지통' : '카테고리 관리'}</h2><p className={styles.panelDescription}>비활성 삭제는 데이터를 보존합니다. 영구 삭제하면 연결된 과목과 문제·학습 기록도 함께 삭제됩니다.</p></div><div className={styles.actions}><button type="button" className={styles.secondaryButton} disabled={busy} aria-pressed={showCategoryTrash} onClick={() => setShowCategoryTrash(value => !value)}>{showCategoryTrash ? '활성 카테고리 보기' : '휴지통 보기'}</button>{!showCategoryTrash && <button type="button" className={styles.addButton} disabled={busy} onClick={() => void addCategory()}><Plus size={16}/> 카테고리 등록</button>}</div></div>
          <div className={styles.tableScroll}>
          <table className={`${styles.table} ${styles.categoryTable}`}>
            <colgroup>
              <col className={styles.categoryIdColumn} />
              <col className={styles.categoryNameColumn} />
              <col className={styles.categoryStatusColumn} />
              <col className={styles.categoryActionsColumn} />
            </colgroup>
            <thead><tr><th>번호</th><th>카테고리명</th><th>상태</th><th>관리</th></tr></thead><tbody>
            {visibleCategories.map(c => <tr key={c.categoryId} className={selectedCategoryId === c.categoryId ? styles.selected : ''}>
              <td>{c.categoryId}</td>
              <td><button type="button" className={styles.linkButton} onClick={() => setSelectedCategoryId(c.categoryId)}>{c.categoryName}</button></td>
              <td>{c.categoryStatus === 'Y' ? '활성' : '비활성'}</td>
              <td><div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void editCategory(c)}><Pencil size={14}/> 수정</button>
                {c.categoryStatus === 'Y'
                  ? <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void toggleCategory(c)}><Trash2 size={14}/> 비활성화</button>
                  : <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void toggleCategory(c)}><RotateCcw size={14}/> 복구</button>}
                <button type="button" className={styles.dangerButton} disabled={busy} onClick={() => void permanentlyDeleteCategory(c)}><Trash2 size={14}/> 완전 삭제</button>
              </div></td>
            </tr>)}
            {!loading && visibleCategories.length === 0 && <tr><td colSpan={4} className={styles.empty}>{showCategoryTrash ? '휴지통에 카테고리가 없습니다.' : '등록된 활성 카테고리가 없습니다.'}</td></tr>}
          </tbody></table>
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>과목 관리</h2><button type="button" className={styles.addButton} disabled={busy || selectedCategoryId === null || selectedCategory?.categoryStatus !== 'Y'} onClick={() => void addSubject()}><Plus size={16}/> 과목 등록</button></div>
          <div className={styles.filter}><label htmlFor="categoryFilter">카테고리</label><select id="categoryFilter" value={selectedCategoryId ?? ''} onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}><option value="">전체 보기</option>{categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
          <table className={styles.table}><thead><tr><th>번호</th><th>카테고리</th><th>과목명</th><th>상태</th><th>관리</th></tr></thead><tbody>
            {visibleSubjects.map(s => <tr key={s.subjectId}>
              <td>{s.subjectId}</td><td>{categories.find(c => c.categoryId === s.categoryId)?.categoryName ?? s.categoryId}</td><td>{s.subjectName}</td><td>{s.subjectStatus === 'Y' ? '활성' : '비활성'}</td>
              <td><div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void editSubject(s)}><Pencil size={14}/> 수정</button>
                <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void toggleSubject(s)}>{s.subjectStatus === 'Y' ? <Trash2 size={14}/> : <RotateCcw size={14}/>} {s.subjectStatus === 'Y' ? '삭제(비활성)' : '복구'}</button>
              </div></td>
            </tr>)}
            {!loading && visibleSubjects.length === 0 && <tr><td colSpan={5} className={styles.empty}>등록된 과목이 없습니다.</td></tr>}
          </tbody></table>
        </section>
        </> : <UsageDashboard />}
      </div>
    </div>
  );
};

const localDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const UsageDashboard: React.FC = () => {
  const [initialRange] = useState(() => {
    const to = localDateString(new Date());
    const from = new Date(`${to}T00:00:00`);
    from.setDate(from.getDate() - 29);
    return { from: localDateString(from), to };
  });
  const today = initialRange.to;
  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [appliedRange, setAppliedRange] = useState(initialRange);
  const [usage, setUsage] = useState<SelfStudyUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsage = useCallback(async (from: string, to: string) => {
    if (from > to) {
      setError('시작 날짜는 종료 날짜보다 늦을 수 없습니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await selfStudyAdminApi.usage(from, to);
      setUsage(data);
      setAppliedRange({ from, to });
    } catch (requestError) {
      setUsage(null);
      setError(adminErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsage(initialRange.from, initialRange.to); }, [initialRange, loadUsage]);

  const trendDays = useMemo(() => {
    if (!usage) return [];
    const byDate = new Map<string, SelfStudyUsage['dailyTrend'][number]>(
      usage.dailyTrend.map((day) => [day.date, day] as const)
    );
    const days: { date: string; generatedCount: number; submittedCount: number }[] = [];
    const cursor = new Date(`${appliedRange.from}T00:00:00`);
    const lastDay = new Date(`${appliedRange.to}T00:00:00`);
    while (cursor <= lastDay) {
      const date = localDateString(cursor);
      days.push(byDate.get(date) ?? { date, generatedCount: 0, submittedCount: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [usage, appliedRange]);

  const maxDailyCount = Math.max(1, ...trendDays.flatMap((day) => [day.generatedCount, day.submittedCount]));
  const maxCategoryCount = Math.max(1, ...(usage?.categoryRanking.map((item) => item.generatedCount) ?? []));
  const maxSubjectCount = Math.max(1, ...(usage?.subjectRanking.map((item) => item.generatedCount) ?? []));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadUsage(fromDate, toDate);
  };

  return (
    <>
      <section className={styles.panel}>
        <form className={styles.usageFilters} onSubmit={submit}>
          <div className={styles.dateField}><label htmlFor="usageFrom">시작일</label><input id="usageFrom" type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} /></div>
          <span className={styles.dateSeparator} aria-hidden="true">~</span>
          <div className={styles.dateField}><label htmlFor="usageTo">종료일</label><input id="usageTo" type="date" value={toDate} min={fromDate} max={today} onChange={(event) => setToDate(event.target.value)} /></div>
          <button type="submit" className={styles.addButton} disabled={loading || !fromDate || !toDate}><RefreshCw size={16} /> {loading ? '조회 중...' : '기간 조회'}</button>
        </form>
      </section>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {loading && !usage ? <section className={`${styles.panel} ${styles.usageMessage}`} role="status">이용 현황을 불러오는 중입니다...</section> : usage && <>
        <p className={styles.usagePeriod}>조회 기간: {appliedRange.from} ~ {appliedRange.to}</p>
        <section className={styles.metricGrid} aria-label="기간 이용 요약">
          <article className={styles.metricCard}><span>문제 생성 세션</span><strong>{usage.summary.generatedCount.toLocaleString()}<small>건</small></strong><p>참여 회원 {usage.summary.participantCount.toLocaleString()}명</p></article>
          <article className={styles.metricCard}><span>결과 제출</span><strong>{usage.summary.submittedCount.toLocaleString()}<small>건</small></strong><p>생성된 문제 풀이 제출</p></article>
          <article className={styles.metricCard}><span>평균 점수</span><strong>{usage.summary.averageScore.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}<small>점</small></strong><p>선택 기간 제출 결과 기준</p></article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><h2>날짜별 이용 추이</h2><p className={styles.panelDescription}>문제 생성 세션과 학습 결과 제출 건수</p></div><div className={styles.chartLegend}><span><i className={styles.generatedLegend} /> 문제 생성 세션</span><span><i className={styles.submittedLegend} /> 결과 제출</span></div></div>
          {!usage.summary.generatedCount && !usage.summary.submittedCount ? <p className={styles.empty}>선택 기간에 이용 기록이 없습니다.</p> : <div className={styles.chartScroll}>
            <div className={styles.trendChart} style={{ gridTemplateColumns: `repeat(${trendDays.length}, minmax(18px, 1fr))` }} role="img" aria-label="날짜별 문제 생성 및 결과 제출 건수">
              {trendDays.map((day, index) => <div key={day.date} className={styles.trendDay} title={`${day.date}: 문제 생성 ${day.generatedCount}건, 결과 제출 ${day.submittedCount}건`}>
                <div className={styles.barPair}>
                  <span className={styles.generatedBar} style={{ height: `${day.generatedCount ? Math.max(4, day.generatedCount / maxDailyCount * 100) : 0}%` }} />
                  <span className={styles.submittedBar} style={{ height: `${day.submittedCount ? Math.max(4, day.submittedCount / maxDailyCount * 100) : 0}%` }} />
                </div>
                <span className={styles.dayLabel}>{index === 0 || index === trendDays.length - 1 || index % Math.ceil(trendDays.length / 7) === 0 ? day.date.slice(5) : ''}</span>
              </div>)}
            </div>
          </div>}
        </section>

        <div className={styles.rankingGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><h2>카테고리별 이용 순위</h2><p className={styles.panelDescription}>문제 생성 세션 수 기준</p></div></div>
            {usage.categoryRanking.length === 0 ? <p className={styles.empty}>카테고리 이용 기록이 없습니다.</p> : <ol className={styles.rankingList}>
              {usage.categoryRanking.map((item, index) => <li key={item.categoryId} className={styles.rankingItem}><span className={styles.rankNumber}>{index + 1}</span><div className={styles.rankInfo}><div className={styles.rankLabel}><strong>{item.categoryName}</strong><span>{item.generatedCount.toLocaleString()}건</span></div><div className={styles.rankTrack} aria-hidden="true"><i style={{ width: `${item.generatedCount / maxCategoryCount * 100}%` }} /></div></div></li>)}
            </ol>}
          </section>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><h2>과목별 이용 순위</h2><p className={styles.panelDescription}>문제 생성 세션 수 기준 · 상위 10개</p></div></div>
            {usage.subjectRanking.length === 0 ? <p className={styles.empty}>과목 이용 기록이 없습니다.</p> : <ol className={styles.rankingList}>
              {usage.subjectRanking.slice(0, 10).map((item, index) => <li key={item.subjectId} className={styles.rankingItem}><span className={styles.rankNumber}>{index + 1}</span><div className={styles.rankInfo}><div className={styles.rankLabel}><strong>{item.subjectName}<small>{item.categoryName}</small></strong><span>{item.generatedCount.toLocaleString()}건</span></div><div className={styles.rankTrack} aria-hidden="true"><i style={{ width: `${item.generatedCount / maxSubjectCount * 100}%` }} /></div></div></li>)}
            </ol>}
          </section>
        </div>
      </>}
    </>
  );
};

export default SelfStudyManagement;
