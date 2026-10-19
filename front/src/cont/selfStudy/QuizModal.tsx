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

  categories: Category[];
  subjects: Subject[];

  selectedCategoryId: number | null;
  setSelectedCategoryId: (
    val: number | null
  ) => void;

  selectedSubjectId: number | null;
  setSelectedSubjectId: (
    val: number | null
  ) => void;
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

  // 선택된 카테고리에 해당하는 과목만 표시
  // 이미지 첨부 여부와는 관계없음
  const filteredSubjects =
    selectedCategoryId !== null
      ? subjects.filter(
          (subject) =>
            subject.categoryId === selectedCategoryId
        )
      : [];

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>

        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <h3>AI 문제 생성 설정 (quiz_sessions)</h3>

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
              이미지 첨부 (quiz_image_url)
            </label>

            <input
              type="file"
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

          {/* 2. 카테고리 및 과목 선택 */}
          {/* 이미지가 없어도 항상 표시 */}

          <div className={styles.formRow}>

            {/* 카테고리 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                카테고리 (category_id)
              </label>

              <select
                className={styles.selectInput}
                value={selectedCategoryId ?? ''}
                disabled={loading}
                onChange={(e) => {
                  const value = e.target.value;

                  const categoryId =
                    value === ''
                      ? null
                      : Number(value);

                  setSelectedCategoryId(categoryId);
                  setSelectedSubjectId(null);
                }}
              >
                <option value="">
                  카테고리 선택
                </option>

                {categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName}
                  </option>
                ))}
              </select>

              {categories.length === 0 && (
                <small>
                  조회된 카테고리가 없습니다.
                </small>
              )}
            </div>

            {/* 과목 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                과목 (subject_id)
              </label>

              <select
                className={styles.selectInput}
                value={selectedSubjectId ?? ''}
                disabled={
                  loading ||
                  selectedCategoryId === null
                }
                onChange={(e) => {
                  const value = e.target.value;

                  setSelectedSubjectId(
                    value === ''
                      ? null
                      : Number(value)
                  );
                }}
              >
                <option value="">
                  과목 선택
                </option>

                {filteredSubjects.map((subject) => (
                  <option
                    key={subject.subjectId}
                    value={subject.subjectId}
                  >
                    {subject.subjectName}
                  </option>
                ))}
              </select>

              {selectedCategoryId !== null &&
                filteredSubjects.length === 0 && (
                  <small>
                    조회된 과목이 없습니다.
                  </small>
                )}
            </div>
          </div>

          {/* 3. 문제 유형 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              문제 유형
            </label>

            <select
              className={styles.selectInput}
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

          {/* 4. 난이도 및 문항 수 */}
          <div className={styles.formRow}>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                난이도 (quiz_difficulty)
              </label>

              <select
                className={styles.selectInput}
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
                문항 수 (quiz_count)
              </label>

              <select
                className={styles.selectInput}
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

          {/* 5. 추가 요청사항 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              추가 요청사항 (quiz_prompt)
            </label>

            <input
              type="text"
              className={styles.textInput}
              placeholder="예: 개념 위주로 문제 내줘, 해설을 자세히 적어줘"
              maxLength={1000}
              value={quizPrompt}
              disabled={loading}
              onChange={(e) =>
                setQuizPrompt(e.target.value)
              }
            />
          </div>
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
              : '문제 생성 시작'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
