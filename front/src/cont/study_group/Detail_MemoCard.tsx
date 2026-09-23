import React, { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'motion/react';
import styles from './memo.module.css';


// ======================================================
// 메모 데이터
// ======================================================
export interface MemoData {
    memo_num: number;
    writer: string;
    content: string;
    created_at: string;
    updated_at?: string;
}
// ======================================================
// Props
// ======================================================
interface MemoCardProps {
    memo: MemoData;
    deleting: boolean;
    disableClick: boolean;
    onUpdate: (
        memoNum: number,
        content: string
    ) => Promise<void>;
    onCrumpleComplete: (
        memoNum: number
    ) => Promise<void>;
}

// ======================================================
// Component
// ======================================================
export const Detail_MemoCard: React.FC<MemoCardProps> = ({
    memo,
    deleting,
    disableClick,
    onUpdate,
    onCrumpleComplete
}) => {

    // 메모 확대 여부
    const [isExpanded, setIsExpanded] =
        useState<boolean>(false);

    // 수정 중인 내용
    const [editContent, setEditContent] =
        useState<string>(memo.content);

    // 저장 중 여부
    const [isSaving, setIsSaving] =
        useState<boolean>(false);
    // 부모 데이터가 바뀌었을 때
    // textarea 내용도 동기화
    useEffect(() => {
        setEditContent(memo.content);
    }, [memo.content]);

    // ==================================================
    // dnd-kit
    // ==================================================

    const {attributes,listeners,setNodeRef,transform,isDragging} = useDraggable({
        id: memo.memo_num,
        // 확대해서 수정하는 동안에는
        // Drag 비활성화
        disabled: isExpanded || deleting
    });

    // dnd-kit 전용 이동 transform
    const dragStyle: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined
    };

    // ==================================================
    // 메모마다 약간 다른 기울기
    // ==================================================
    const defaultRotation = (memo.memo_num % 5) - 2;
    // ==================================================
    // 일반 클릭
    // ==================================================
    const handleClick = (): void => {
        // Drag 직후 click이 발생하는 것 방지
        if (disableClick ||isDragging ||deleting) {return;}
        setIsExpanded(true);
    };

    // ==================================================
    // UPDATE
    // ==================================================

    const handleSave = async (): Promise<void> => {
        if (!editContent.trim()) {return;}
        if (isSaving) {return;}

        try {
            setIsSaving(true);
            await onUpdate(
                memo.memo_num,
                editContent
            );
        } catch (error) {
            console.error('메모 수정 실패',error);
        } finally {
            setIsSaving(false);
        }
    };

    // ==================================================
    // 구김 애니메이션 종료
    // ==================================================

    const handleAnimationComplete = (): void => {
        if (!deleting) {return;}
        void onCrumpleComplete(memo.memo_num);
    };
    return (
        <>
            {/*
                dnd-kit 전용 Wrapper
                transform을 Motion 요소와 분리하는 것이 중요합니다.
            */}
            <div
                ref={setNodeRef}
                style={dragStyle}
                className={styles.memoDraggable}
                {...listeners}
                {...attributes}
            >
                <motion.article
                    layout
                    className={`${styles.memoCard} ${isExpanded ? styles.memoCardExpanded : ''}`}
                    onClick={handleClick}
                    animate={deleting ? {
                                scale: [1,0.88,0.65,0.4,0.15],
                                rotate: [defaultRotation,10,-18,45,125],
                                skewX: [0, 5,-12,14,0],
                                skewY: [0,-5,10,-15,0],
                                borderRadius: ['2%','8%','18%','35%','50%'],
                                y: [0,10,25,55,100],
                                opacity: [1,1,0.9,0.6,0]
                            }
                            : {
                                scale: 1,
                                rotate: isExpanded ? 0 : defaultRotation,
                                skewX: 0,
                                skewY: 0,
                                opacity: 1
                            }
                    }
                    transition={deleting ? {duration: 0.65, ease: 'easeIn'} : {layout: { duration: 0.25}}}
                    onAnimationComplete={handleAnimationComplete}
                >
                    {/* =========================
                        작성자
                    ========================= */}
                    <div className={styles.memoCardHeader}>
                        <span className={styles.memoPin} />
                        <span className={styles.memoWriterName}>
                            {memo.writer}
                        </span>
                    </div>
                    {/* =========================
                        내용
                    ========================= */}

                    {!isExpanded ? (
                        <p className={styles.memoContent}>
                            {memo.content}
                        </p>
                    ) : (
                        <textarea
                            className={styles.memoEditor}
                            value={editContent}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setEditContent(e.target.value);
                            }}
                            // 편집 영역에서는
                            // dnd-kit Pointer 이벤트 차단
                            onPointerDown={(e) => {
                                e.stopPropagation();
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        />
                    )}

                    {/* =========================
                        날짜
                    ========================= */}

                    <div className={styles.memoDate}>

                        <span>
                            작성 {memo.created_at}
                        </span>

                        {memo.updated_at && (
                            <span>
                                수정 {memo.updated_at}
                            </span>
                        )}
                    </div>

                    {/* =========================
                        확대 상태 버튼
                    ========================= */}
                    {isExpanded && (
                        <div
                            className={styles.memoEditButtons}
                            onPointerDown={(e) =>e.stopPropagation()}
                            onClick={(e) =>e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setEditContent(memo.content);
                                    setIsExpanded(false);
                                }}
                            >
                                닫기
                            </button>

                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => {void handleSave();}}
                            >
                                {isSaving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    )}
                </motion.article>
            </div>

            {/* =========================
                확대 시 뒤쪽 어둡게
            ========================= */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className={styles.memoBackdrop}
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() => {
                            setEditContent(
                                memo.content
                            );
                            setIsExpanded(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};