//최솔
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, RefreshCw } from 'lucide-react';
import styles from './selfStudyManagement.module.css';
import { Category, Subject, selfStudyAdminApi } from './selfStudyAdminApi';

const SelfStudyManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const addCategory = async () => {
    const name = window.prompt('새 카테고리 이름을 입력하세요.');
    if (!name?.trim()) return;
    try { await selfStudyAdminApi.createCategory(name.trim()); await load(); }
    catch (e) { window.alert(e instanceof Error ? e.message : '등록 실패'); }
  };
  const editCategory = async (category: Category) => {
    const name = window.prompt('카테고리 이름 수정', category.categoryName);
    if (!name?.trim() || name.trim() === category.categoryName) return;
    try { await selfStudyAdminApi.updateCategory(category.categoryId, name.trim()); await load(); }
    catch (e) { window.alert(e instanceof Error ? e.message : '수정 실패'); }
  };
  const addSubject = async () => {
    if (selectedCategoryId === null) { window.alert('카테고리를 먼저 선택하세요.'); return; }
    const name = window.prompt('새 과목 이름을 입력하세요.');
    if (!name?.trim()) return;
    try { await selfStudyAdminApi.createSubject(selectedCategoryId, name.trim()); await load(); }
    catch (e) { window.alert(e instanceof Error ? e.message : '등록 실패'); }
  };
  const editSubject = async (subject: Subject) => {
    const name = window.prompt('과목 이름 수정', subject.subjectName);
    if (!name?.trim() || name.trim() === subject.subjectName) return;
    try { await selfStudyAdminApi.updateSubject(subject.subjectId, name.trim()); await load(); }
    catch (e) { window.alert(e instanceof Error ? e.message : '수정 실패'); }
  };
  const visibleSubjects = selectedCategoryId === null ? subjects : subjects.filter(s => s.categoryId === selectedCategoryId);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div><h1>셀프스터디 관리</h1><p>AI 학습 카테고리와 과목을 관리합니다.</p></div>
          <button className={styles.secondaryButton} onClick={() => void load()}><RefreshCw size={16}/> 새로고침</button>
        </header>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>카테고리 관리</h2><button className={styles.addButton} onClick={() => void addCategory()}><Plus size={16}/> 카테고리 등록</button></div>
          <table className={styles.table}><thead><tr><th>번호</th><th>카테고리명</th><th>관리</th></tr></thead><tbody>
            {categories.map(c => <tr key={c.categoryId} className={selectedCategoryId === c.categoryId ? styles.selected : ''}>
              <td>{c.categoryId}</td><td><button className={styles.linkButton} onClick={() => setSelectedCategoryId(c.categoryId)}>{c.categoryName}</button></td>
              <td><button className={styles.secondaryButton} onClick={() => void editCategory(c)}><Pencil size={14}/> 수정</button></td>
            </tr>)}
            {!loading && categories.length === 0 && <tr><td colSpan={3} className={styles.empty}>등록된 카테고리가 없습니다.</td></tr>}
          </tbody></table>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>과목 관리</h2><button className={styles.addButton} onClick={() => void addSubject()} disabled={selectedCategoryId === null}><Plus size={16}/> 과목 등록</button></div>
          <div className={styles.filter}><label htmlFor="categoryFilter">카테고리</label><select id="categoryFilter" value={selectedCategoryId ?? ''} onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}><option value="">전체 보기</option>{categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
          <table className={styles.table}><thead><tr><th>번호</th><th>카테고리</th><th>과목명</th><th>관리</th></tr></thead><tbody>
            {visibleSubjects.map(s => <tr key={s.subjectId}><td>{s.subjectId}</td><td>{categories.find(c => c.categoryId === s.categoryId)?.categoryName ?? s.categoryId}</td><td>{s.subjectName}</td><td><button className={styles.secondaryButton} onClick={() => void editSubject(s)}><Pencil size={14}/> 수정</button></td></tr>)}
            {!loading && visibleSubjects.length === 0 && <tr><td colSpan={4} className={styles.empty}>등록된 과목이 없습니다.</td></tr>}
          </tbody></table>
        </section>
      </div>
    </div>
  );
};
export default SelfStudyManagement;
