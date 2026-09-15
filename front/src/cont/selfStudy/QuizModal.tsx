import React, { useRef } from 'react';
import { Category, Subject } from './types';
import styles from './selfstudy.module.css';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  previewUrl: string | null;
  quizType: string;
  setQuizType: (val: string) => void;
  quizDifficulty: string;
  setQuizDifficulty: (val: string) => void;
  quizCount: number;
  setQuizCount: (val: number) => void;
  quizPrompt: string;
  setQuizPrompt: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadSubmit: () => void;
  categories: Category[];
  subjects: Subject[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (val: number | null) => void;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (val: number | null) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  loading,
  previewUrl,
  quizType,
  setQuizType,
  quizDifficulty,
  setQuizDifficulty,
  quizCount,
  setQuizCount,
  quizPrompt,
  setQuizPrompt,
  handleFileChange,
  handleUploadSubmit,
  categories,
  subjects,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedSubjectId,
  setSelectedSubjectId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 선택된 카테고리에 해당하는 과목 필터링
  const filteredSubjects = selectedCategoryId
    ? subjects.filter((s) => s.categoryId === selectedCategoryId)
    : [];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>AI 문제 생성 설정 (quiz_sessions)</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* 1. 이미지 첨부 (quiz_image_url) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>이미지 첨부 (quiz_image_url)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
            <div 
              className={styles.imageUploadBox}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon}></span>
                  <span>클릭하여 교재/필기 이미지 업로드</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. 대분류 및 소분류 선택 */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>카테고리 (category_id)</label>
              <select 
                className={styles.selectInput} 
                value={selectedCategoryId ?? ''} 
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setSelectedCategoryId(val);
                  setSelectedSubjectId(null); 
                }}
              >
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>과목 (subject_id)</label>
              <select 
                className={styles.selectInput} 
                value={selectedSubjectId ?? ''} 
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedCategoryId}
              >
                <option value="">과목 선택</option>
                {filteredSubjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>{sub.subjectName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. 문제 유형 (quiz_type) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>문제 유형 (quiz_type)</label>
            <select className={styles.selectInput} value={quizType} onChange={(e) => setQuizType(e.target.value)}>
              <option value="MULTIPLE_CHOICE">객관식 (4보기)</option>
              <option value="SHORT_ANSWER">주관식 단답형</option>
              <option value="OX">O / X 퀴즈</option>
            </select>
          </div>

          {/* 4. 난이도 (quiz_difficulty) 및 문항 수 (quiz_count) */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>난이도 (quiz_difficulty)</label>
              <select className={styles.selectInput} value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)}>
                <option value="EASY">쉬움 (EASY)</option>
                <option value="MEDIUM">보통 (MEDIUM)</option>
                <option value="HARD">어려움 (HARD)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>문항 수 (quiz_count)</label>
              <select className={styles.selectInput} value={quizCount} onChange={(e) => setQuizCount(Number(e.target.value))}>
                <option value={3}>3문항</option>
                <option value={5}>5문항</option>
                <option value={10}>10문항</option>
              </select>
            </div>
          </div>

          {/* 5. 추가 프롬프트 지침 (quiz_prompt) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>추가 요청사항 (quiz_prompt)</label>
            <input 
              type="text"
              className={styles.textInput}
              placeholder="예: 개념 위주로 문제 내줘, 해설을 자세히 적어줘"
              value={quizPrompt}
              onChange={(e) => setQuizPrompt(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={styles.submitBtn} onClick={handleUploadSubmit}>
            {loading ? "AI가 문제를 생성하는 중..." : "문제 생성 시작"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;