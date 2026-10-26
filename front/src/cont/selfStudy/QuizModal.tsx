// 최솔
import React, { useEffect, useRef, useState } from 'react';
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
  classificationLoading: boolean;
  classificationError: string;
  categories: Category[];
  subjects: Subject[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (value: number | null) => void;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (value: number | null) => void;
  pointCost: number;
  classificationCached: boolean;
  categoryName: string;
  subjectName: string;

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
  classificationLoading,
  classificationError,
  categories,
  subjects,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedSubjectId,
  setSelectedSubjectId,
  pointCost,
  classificationCached,
  categoryName,
  subjectName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0);
  const estimatedMinutes = quizCount <= 3
    ? '1~2'
    : quizCount <= 6
      ? '2~4'
      : '3~6';
  // 예상 범위의 상한을 남은 시간 카운트다운 기준으로 사용합니다.
  const estimatedDurationSeconds = (quizCount <= 3 ? 2 : quizCount <= 6 ? 4 : 6) * 60;
  const generationRemainingSeconds = Math.max(
    0,
    estimatedDurationSeconds - generationElapsedSeconds
  );
  const generationProgressPercent = Math.round(
    (generationRemainingSeconds / estimatedDurationSeconds) * 100
  );
  const formattedRemainingTime = `${String(Math.floor(generationRemainingSeconds / 60)).padStart(2, '0')}:${String(generationRemainingSeconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!loading) {
      setGenerationElapsedSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const updateElapsed = () => setGenerationElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [loading]);

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
              disabled={loading || classificationLoading}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div
              className={styles.imageUploadBox}
              onClick={() => {
                if (!loading && !classificationLoading) {
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

          {previewUrl && (
            <div className={styles.formGroup}>
              <label className={styles.label}>카테고리와 과목</label>
              <p>
                {classificationLoading
                  ? '이미지에서 카테고리와 과목을 확인하고 있습니다.'
                  : classificationCached
                    ? '같은 이미지에서 확정된 분류를 불러왔습니다.'
                    : classificationError
                      ? `${classificationError} 기존 항목을 직접 선택할 수 있습니다.`
                      : categoryName && subjectName
                        ? 'AI 제안을 사용하거나 기존 카테고리와 과목을 선택할 수 있습니다.'
                        : 'AI 분류를 기다리거나 기존 카테고리와 과목을 선택해주세요.'}
              </p>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="classificationCategory">카테고리</label>
                  <select
                    id="classificationCategory"
                    className={styles.selectInput}
                    value={selectedCategoryId ?? (categoryName ? 'suggested' : '')}
                    disabled={loading || classificationLoading || classificationCached}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedCategoryId(value && value !== 'suggested' ? Number(value) : null);
                      setSelectedSubjectId(null);
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    {categoryName && <option value="suggested">AI 제안: {categoryName}</option>}
                    {categories.filter((category) =>
                      !categoryName || category.categoryName.trim().toLocaleLowerCase() !== categoryName.trim().toLocaleLowerCase()
                    ).map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && !categoryName && (
                    <small>AI 제안이 준비되지 않았고 선택할 카테고리도 없습니다.</small>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="classificationSubject">과목</label>
                  <select
                    id="classificationSubject"
                    className={styles.selectInput}
                    value={selectedSubjectId ?? (subjectName ? 'suggested' : '')}
                    disabled={loading || classificationLoading || classificationCached || selectedCategoryId === null}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedSubjectId(value && value !== 'suggested' ? Number(value) : null);
                    }}
                  >
                    <option value="">과목 선택</option>
                    {subjectName && <option value="suggested">AI 제안: {subjectName}</option>}
                    {subjects.filter((subject) =>
                      !subjectName || subject.subjectName.trim().toLocaleLowerCase() !== subjectName.trim().toLocaleLowerCase()
                    ).map((subject) => (
                      <option key={subject.subjectId} value={subject.subjectId}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                  {selectedCategoryId !== null && subjects.length === 0 && !subjectName && (
                    <small>선택한 카테고리에 등록된 과목이 없습니다. AI 제안 과목으로 생성됩니다.</small>
                  )}
                </div>
              </div>
              <small>AI 제안을 그대로 사용하면 기존 항목과 이름이 같을 경우 기존 데이터를 재사용합니다.</small>
            </div>
          )}

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

              <div
                className={styles.quizCountControl}
                role="group"
                aria-label="문항 수 선택"
              >
                <button
                  type="button"
                  className={styles.quizCountButton}
                  aria-label="문항 수 줄이기"
                  disabled={loading || quizCount <= 1}
                  onClick={() => setQuizCount(Math.max(1, quizCount - 1))}
                >
                  −
                </button>
                <output
                  className={styles.quizCountValue}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {quizCount}<span>문항</span>
                </output>
                <button
                  type="button"
                  className={styles.quizCountButton}
                  aria-label="문항 수 늘리기"
                  disabled={loading || quizCount >= 10}
                  onClick={() => setQuizCount(Math.min(10, quizCount + 1))}
                >
                  +
                </button>
              </div>
              <p className={styles.quizCountHint}>1~10문항 선택</p>
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
          {classificationLoading && <div className={styles.generationProgress} role="status" aria-live="polite">
            <strong>이미지 분류 중...</strong>
            <p>분류가 끝나면 카테고리와 과목을 확인하고 문제를 생성할 수 있습니다.</p>
          </div>}
          {loading && <div className={styles.generationProgress} role="status" aria-live="polite">
            <div className={styles.generationProgressLabel}>
              <strong>AI가 문제를 생성하고 있습니다</strong>
              <span>
                {generationRemainingSeconds > 0
                  ? `남은 예상 시간 ${formattedRemainingTime}`
                  : '예상 시간 초과 · 생성 중'}
              </span>
            </div>
            <p>예상 소요 시간: 약 {estimatedMinutes}분</p>
            <div
              className={styles.generationProgressTrack}
              role="progressbar"
              aria-label="예상 남은 시간"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={generationProgressPercent}
              aria-valuetext={generationRemainingSeconds > 0 ? `약 ${formattedRemainingTime} 남음` : '예상 시간 초과, 생성 중'}
            >
              <span style={{ width: `${generationProgressPercent}%` }} />
            </div>
            <small>남은 시간은 예상치이며, 실제 생성 시간은 문항 수와 서버 상태에 따라 달라질 수 있습니다.</small>
          </div>}
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
            disabled={loading || classificationLoading}
            aria-busy={loading || classificationLoading}
          >
            {loading && (
              <span className={styles.loadingArrow} aria-hidden="true">
                ↻
              </span>
            )}
            {loading ? '문제 생성 중...' : `문제 생성 · ${pointCost.toLocaleString()}P`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
