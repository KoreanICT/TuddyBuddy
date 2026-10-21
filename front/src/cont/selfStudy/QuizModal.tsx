// 최솔
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

  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  handleUploadSubmit: () => void;
  classificationMode: 'auto' | 'manual';
  setClassificationMode: (value: 'auto' | 'manual') => void;
  categories: Category[];
  subjects: Subject[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (value: number | null) => void;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (value: number | null) => void;
  pointCost: number;

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
  classificationMode,
  setClassificationMode,
  categories,
  subjects,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedSubjectId,
  setSelectedSubjectId,
  pointCost,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>

        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <h3>AI 문제 생성 설정 </h3>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>

          {/* 1. 이미지 첨부 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              이미지 첨부
            </label>

            <input
              type="file"
              name="quizImage"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div
              className={styles.imageUploadBox}
              onClick={() => {
                if (!loading) {
                  fileInputRef.current?.click();
                }
              }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon} />
                  <span>
                    클릭하여 교재/필기 이미지 업로드
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>카테고리·과목 지정</label>
            <div className={styles.formRow}>
              <label>
                <input
                  type="radio"
                  name="classificationMode"
                  checked={classificationMode === 'auto'}
                  disabled={loading}
                  onChange={() => setClassificationMode('auto')}
                /> 이미지 자동 분류
              </label>
              <label>
                <input
                  type="radio"
                  name="classificationMode"
                  checked={classificationMode === 'manual'}
                  disabled={loading}
                  onChange={() => setClassificationMode('manual')}
                /> 직접 선택
              </label>
            </div>
            {classificationMode === 'auto' ? (
              <small>
                기존 항목을 우선 사용하고, 없으면 새 항목으로 등록합니다.
              </small>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>카테고리</label>
                  <select
                    className={styles.selectInput}
                    name="categoryId"
                    value={selectedCategoryId ?? ''}
                    disabled={loading}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedCategoryId(value ? Number(value) : null);
                      setSelectedSubjectId(null);
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <small>선택할 수 있는 카테고리가 없습니다.</small>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>과목</label>
                  <select
                    className={styles.selectInput}
                    name="subjectId"
                    value={selectedSubjectId ?? ''}
                    disabled={loading || selectedCategoryId === null}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedSubjectId(value ? Number(value) : null);
                    }}
                  >
                    <option value="">과목 선택</option>
                    {subjects.map((subject) => (
                      <option key={subject.subjectId} value={subject.subjectId}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                  {selectedCategoryId !== null && subjects.length === 0 && (
                    <small>선택한 카테고리에 과목이 없습니다.</small>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. 문제 유형 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              문제 유형
            </label>

            <select
              className={styles.selectInput}
              name="quizType"
              value={quizType}
              disabled={loading}
              onChange={(e) =>
                setQuizType(e.target.value)
              }
            >
              <option value="MULTIPLE_CHOICE">
                객관식 (4보기)
              </option>

              <option value="SHORT_ANSWER">
                주관식 단답형
              </option>

              <option value="OX">
                O / X 퀴즈
              </option>
            </select>
          </div>

          {/* 3. 난이도 및 문항 수 */}
          <div className={styles.formRow}>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                난이도
              </label>

              <select
                className={styles.selectInput}
                name="quizDifficulty"
                value={quizDifficulty}
                disabled={loading}
                onChange={(e) =>
                  setQuizDifficulty(e.target.value)
                }
              >
                <option value="EASY">
                  쉬움 (EASY)
                </option>

                <option value="MEDIUM">
                  보통 (MEDIUM)
                </option>

                <option value="HARD">
                  어려움 (HARD)
                </option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                문항 수 
              </label>

              <select
                className={styles.selectInput}
                name="quizCount"
                value={quizCount}
                disabled={loading}
                onChange={(e) =>
                  setQuizCount(Number(e.target.value))
                }
              >
                <option value={3}>3문항</option>
                <option value={5}>5문항</option>
                <option value={10}>10문항</option>
              </select>
            </div>
          </div>

          {/* 4. 추가 요청사항 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              추가 요청사항
            </label>

            <input
              type="text"
              className={styles.textInput}
              name="quizPrompt"
              placeholder="예: 개념 위주로 문제 내줘, 해설을 자세히 적어줘"
              maxLength={1000}
              value={quizPrompt}
              disabled={loading}
              onChange={(e) =>
                setQuizPrompt(e.target.value)
              }
            />
          </div>

          <p className={styles.pointCostNotice}>
            문제 생성과 저장이 완료되면 1회당 {pointCost.toLocaleString()}P가 차감됩니다.
          </p>
        </div>

        {/* 모달 하단 */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleUploadSubmit}
            disabled={loading}
            aria-busy={loading}
          >
            {loading && (
              <span className={styles.loadingArrow} aria-hidden="true">
                ↻
              </span>
            )}
            {loading
              ? 'AI가 문제를 생성하는 중...'
              : `${pointCost.toLocaleString()}P로 문제 생성`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
