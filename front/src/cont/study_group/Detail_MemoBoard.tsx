//작성자 : 오진석
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { motion } from 'motion/react';
import styles from './memo.module.css';
import { Detail_MemoCard, type MemoData } from './Detail_MemoCard';

interface MemoBoardProps {
    memos: MemoData[];
    onInsert: (memoNum: number, content: string) => Promise<void>;
    onUpdate: (memoNum: number, content: string) => Promise<void>;
    onDelete: (memoNum: number) => Promise<void>;
    onCancelDraft: (memoNum: number) => void;
}

const TRASH_ID = 'memo-trash';
export const Detail_MemoBoard: React.FC<MemoBoardProps> = ({ memos, onInsert, onUpdate, onDelete, onCancelDraft }) => {

    const corkboardImage = `${process.env.PUBLIC_URL}/images/corkboard.jpg`;
    // 현재 Drag 중인 메모
    const [draggingId, setDraggingId] = useState<number | null>(null);

    // Drag가 방금 끝난 메모
    // Drag 후 click 이벤트가 발생하는 것을 방지
    const [recentlyDraggedId, setRecentlyDraggedId] = useState<number | null>(null);

    // 휴지통에 들어가서
    // 구겨지는 중인 메모
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ==========================
    // Long Press Drag 설정
    // ==========================

    const pointerSensor = useSensor(
        PointerSensor,
        {
            activationConstraint: {
                // 100ms 이상 눌러야 Drag 시작
                delay: 100,
                // 누르는 동안 30px 정도의 움직임 허용
                tolerance: 30
            }
        }
    );
    const sensors = useSensors(pointerSensor);
    // ==========================
    // Drag 시작
    // ==========================
    const handleDragStart = (event: DragStartEvent): void => {
        setDraggingId(Number(event.active.id));
    };
    // ==========================
    // Drag 종료
    // ==========================
    const handleDragEnd = (event: DragEndEvent): void => {
        const { active, over } = event;
        const memoNum = Number(active.id);

        setDraggingId(null);
        setRecentlyDraggedId(memoNum);

        window.setTimeout(() => {
            setRecentlyDraggedId(null);
        }, 150);

        // 휴지통에 드롭하지 않았다면 종료
        if (over?.id !== TRASH_ID) return;

        const targetMemo = memos.find(
            (memo) => memo.memo_num === memoNum
        );

        if (!targetMemo) return;

        // 임시 메모이거나 관리 권한이 있는 경우에만 삭제
        if (!targetMemo.isDraft && targetMemo.can_manage !== 1) {
            alert("이 메모에 대한 삭제 권한이 없습니다.");
            return;
        }

        setDeletingId(memoNum);
    };
    // ==========================
    // 구김 애니메이션 완료 후
    // 실제 DELETE 실행
    // ==========================

    const handleCrumpleComplete = async (memoNum: number): Promise<void> => {
        try {
            await onDelete(memoNum);
        } catch (error) {
            console.error('메모 삭제 실패', error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={styles.memoBoard} style={{ backgroundImage: `url(${corkboardImage})` }}>
                <div className={styles.memoGrid}>
                    {memos.map((memo) => (
                        <Detail_MemoCard
                            key={memo.memo_num}
                            memo={memo}
                            deleting={deletingId === memo.memo_num}
                            disableClick={
                                draggingId === memo.memo_num || recentlyDraggedId === memo.memo_num
                            }
                            onInsert={onInsert}
                            onUpdate={onUpdate}
                            onCancelDraft={onCancelDraft}
                            onCrumpleComplete={handleCrumpleComplete}
                        />
                    ))}
                </div>
                <TrashArea />
            </div>
        </DndContext>
    );
};

// ======================================================
// 휴지통
// ======================================================

const TrashArea: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({ id: TRASH_ID });
    return (
        <div>
            <motion.div
                ref={setNodeRef}
                className={`${styles.trashArea} ${isOver ? styles.trashAreaOver : ''}`}
                animate={{ scale: isOver ? 1.15 : 1 }}
                transition={{ duration: 0.15 }}
            >
                <div className={styles.trashIcon} aria-label="메모 삭제">🗑️</div>
            </motion.div>
        </div>
    );
};