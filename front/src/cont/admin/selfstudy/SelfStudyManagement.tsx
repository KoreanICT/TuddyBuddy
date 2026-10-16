//최솔
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, RefreshCw, Trash2, RotateCcw } from 'lucide-react';
import styles from './selfStudyManagement.module.css';
import { Category, Subject, selfStudyAdminApi, adminErrorMessage } from './selfStudyAdminApi';

const SelfStudyManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div><h1>셀프스터디 관리</h1><p>AI 학습 카테고리와 과목을 관리합니다. 삭제는 비활성화로 처리됩니다.</p></div>
          <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void load()}><RefreshCw size={16}/> 새로고침</button>
        </header>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>카테고리 관리</h2><button type="button" className={styles.addButton} disabled={busy} onClick={() => void addCategory()}><Plus size={16}/> 카테고리 등록</button></div>
          <table className={styles.table}><thead><tr><th>번호</th><th>카테고리명</th><th>상태</th><th>관리</th></tr></thead><tbody>
            {categories.map(c => <tr key={c.categoryId} className={selectedCategoryId === c.categoryId ? styles.selected : ''}>
              <td>{c.categoryId}</td>
              <td><button type="button" className={styles.linkButton} onClick={() => setSelectedCategoryId(c.categoryId)}>{c.categoryName}</button></td>
              <td>{c.categoryStatus === 'Y' ? '활성' : '비활성'}</td>
              <td><div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void editCategory(c)}><Pencil size={14}/> 수정</button>
                <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => void toggleCategory(c)}>{c.categoryStatus === 'Y' ? <Trash2 size={14}/> : <RotateCcw size={14}/>} {c.categoryStatus === 'Y' ? '삭제(비활성)' : '복구'}</button>
              </div></td>
            </tr>)}
            {!loading && categories.length === 0 && <tr><td colSpan={4} className={styles.empty}>등록된 카테고리가 없습니다.</td></tr>}
          </tbody></table>
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
      </div>
    </div>
  );
};
export default SelfStudyManagement;
