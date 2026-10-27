//작성자 : 오진석
import React, { useState } from 'react';
import styles from './project.module.css';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors} from '@dnd-kit/core';
import { TDLData } from './GroupAPI';
import { TDLStatus } from './Type';
import { Project_TDLCard } from './Project_TDLCard';

const TODO_ID = 'tdl-To_Do';
const IN_PROGRESS_ID = 'tdl-In_Progress';
const DONE_ID = 'tdl-Done';
const INCOMPLETE_ID = 'tdl-Incomplete';

interface TdlBoardProps {
    tdls: TDLData[];
    onStatusChange: (tdlNum: number, status: TDLStatus) => Promise<void>;
    onCreate: (status: TDLStatus) => void;
    onEdit: (tdl: TDLData) => void;
    onDelete: (tdlNum: number) => void;
}
interface BoardColumnProps {
    id: string;
    title: string;
    status: TDLStatus;
    tdls: TDLData[];
    draggingId: number | null;
    recentlyDraggedId: number | null;
    onCreate: (status: TDLStatus) => void;
    onEdit: (tdl: TDLData) => void;
    onDelete: (tdlNum: number) => void;
    readOnly?: boolean;
}

export const Project_Board: React.FC<TdlBoardProps> = ({ tdls, onStatusChange, onCreate, onEdit, onDelete }) => {

    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [recentlyDraggedId, setRecentlyDraggedId] = useState<number | null>(null);

    const pointerSensor = useSensor(
        PointerSensor,
        {
            activationConstraint: {
                delay: 100,
                tolerance: 10
            }
        }
    );
    const sensors = useSensors(pointerSensor);

    const handleDragStart = (event: DragStartEvent): void => {
        setDraggingId(Number(event.active.id));
    };

    const draggingTdl = tdls.find((tdl) => tdl.tdl_num === draggingId);
    const handleDragEnd = async (
        event: DragEndEvent
    ): Promise<void> => {

        const { active, over } = event;
        const tdlNum = Number(active.id);
        setDraggingId(null);
        setRecentlyDraggedId(tdlNum);
        window.setTimeout(() => {
            setRecentlyDraggedId(null);
        }, 150);
        if (!over) {
            return;
        }
        const targetTdl = tdls.find((tdl) => tdl.tdl_num === tdlNum);
        if (!targetTdl) {
            return;
        }
        /*
         * 미완료 상태는 이동 불가
         */
        if (
            targetTdl.status === 'Incomplete'
        ) {
            return;
        }
        let newStatus: TDLStatus | null = null;
        if (over.id === TODO_ID) {
            newStatus = 'To Do';
        } else if (
            over.id === IN_PROGRESS_ID
        ) {
            newStatus = 'In Progress';
        } else if (
            over.id === DONE_ID
        ) {
            newStatus = 'Done';
        }
        /*
         * 미완료 칸은 사용자가 직접 이동할 수 없음
         */
        if (!newStatus) {
            return;
        }
        /*
         * 반복 TDL 규칙
         */
        const isRepeatTdl = !targetTdl.due_at && targetTdl.repeat_type !== null;
        if (isRepeatTdl && newStatus !== 'To Do') {
            return;
        }
        /*
         * 같은 상태라면 호출 안 함
         */
        if (targetTdl.status === newStatus) {
            return;
        }
        await onStatusChange(tdlNum, newStatus);
    };
    const todoTdls = tdls.filter((tdl) => tdl.status === 'To Do');
    const progressTdls = tdls.filter((tdl) => tdl.status === 'In Progress');
    const doneTdls = tdls.filter((tdl) => tdl.status === 'Done');
    const incompleteTdls = tdls.filter((tdl) => tdl.status === 'Incomplete');

    return (

        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >

            <div className={styles.tdl_board}>
                <BoardColumn
                    id={TODO_ID}
                    title="할 일"
                    status="To Do"
                    tdls={todoTdls}
                    draggingId={draggingId}
                    recentlyDraggedId={recentlyDraggedId}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                <BoardColumn
                    id={IN_PROGRESS_ID}
                    title="진행 중"
                    status="In Progress"
                    tdls={progressTdls}
                    draggingId={draggingId}
                    recentlyDraggedId={recentlyDraggedId}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                <BoardColumn
                    id={DONE_ID}
                    title="완료"
                    status="Done"
                    tdls={doneTdls}
                    draggingId={draggingId}
                    recentlyDraggedId={recentlyDraggedId}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                <BoardColumn
                    id={INCOMPLETE_ID}
                    title="미완료"
                    status="Incomplete"
                    tdls={incompleteTdls}
                    draggingId={draggingId}
                    recentlyDraggedId={recentlyDraggedId}
                    onCreate={onCreate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    readOnly
                />
                <DragOverlay>
                    {draggingTdl ? (
                        <div className={styles.tdl_drag_overlay}>
                            <div className={styles.tdl_card_title}>
                                {draggingTdl.tdl_name}
                            </div>

                            {draggingTdl.tdl_detail && (
                                <p className={styles.tdl_card_detail}>
                                    {draggingTdl.tdl_detail}
                                </p>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

const BoardColumn: React.FC<BoardColumnProps> = ({ id, title, status, tdls, draggingId, recentlyDraggedId, onCreate, onEdit, onDelete, readOnly = false }) => {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: readOnly });
    return (
        <div
            ref={setNodeRef}
            className={`${styles.tdl_column} ${isOver ? styles.tdl_column_over : ''}`}
        >
            <div className={styles.tdl_column_header}>
                <span>
                    {title}
                </span>
                <span className={styles.tdl_column_count}>
                    {tdls.length}
                </span>
            </div>
            <div className={styles.tdl_column_body}>
                {tdls.map(
                    (tdl) => (
                        <Project_TDLCard
                            key={tdl.tdl_num}
                            tdl={tdl}
                            disableClick={draggingId === tdl.tdl_num || recentlyDraggedId === tdl.tdl_num}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )
                )}
            </div>
            {!readOnly && status === 'To Do' && (
                <button
                    type="button"
                    className={styles.tdl_add_button}
                    onClick={() => onCreate(status)}
                >
                    +
                </button>
            )}
        </div>
    );
};