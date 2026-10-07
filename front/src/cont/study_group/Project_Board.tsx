import React, { useState } from 'react';
import styles from './project.module.css';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors
} from '@dnd-kit/core';

import { TDLData } from './GroupAPI';
import { TDLStatus } from './Type';
import { Project_TDLCard } from './Project_TDLCard';

const TODO_ID = 'tdl-To_Do';
const IN_PROGRESS_ID = 'tdl-In_Progress';
const DONE_ID = 'tdl-Done';

interface TdlBoardProps {
    tdls: TDLData[];
    onStatusChange: (
        tdlNum: number,
        status: TDLStatus
    ) => Promise<void>;
    onCreate: (
        status: TDLStatus
    ) => void;
}

export const Project_Board: React.FC<TdlBoardProps> = ({tdls,onStatusChange,onCreate}) => {

    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [recentlyDraggedId, setRecentlyDraggedId] = useState<number | null>(null);

    const pointerSensor = useSensor(PointerSensor,{activationConstraint: {delay: 100,tolerance: 10}});

    const sensors = useSensors(pointerSensor);

    const handleDragStart = (event: DragStartEvent): void => {
        setDraggingId(Number(event.active.id));
    };

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

        const targetTdl = tdls.find(
            (tdl) => tdl.tdlid === tdlNum
        );

        if (!targetTdl) {
            return;
        }

        let newStatus: TDLStatus | null = null;

        if (over.id === TODO_ID) {
            newStatus = 'To Do';
        } else if (over.id === IN_PROGRESS_ID) {
            newStatus = 'In Progress';
        } else if (over.id === DONE_ID) {
            newStatus = 'Done';
        }

        if (!newStatus) {
            return;
        }

        /*
         * 반복 TDL 규칙
         *
         * due_at 없음
         * +
         * repeat_type 존재
         *
         * → 진행 중 / 완료 이동 금지
         */
        const isRepeatTdl =
            !targetTdl.due_at &&
            targetTdl.repeat_type !== null;

        if (
            isRepeatTdl &&
            newStatus !== 'To Do'
        ) {
            return;
        }

        /*
         * 이미 같은 상태라면 API 호출 불필요
         */
        if (targetTdl.status === newStatus) {
            return;
        }

        await onStatusChange(
            tdlNum,
            newStatus
        );
    };

    const todoTdls = tdls.filter(
        (tdl) => tdl.status === 'To Do'
    );

    const progressTdls = tdls.filter(
        (tdl) => tdl.status === 'In Progress'
    );

    const doneTdls = tdls.filter(
        (tdl) => tdl.status === 'Done'
    );

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
                />

                <BoardColumn
                    id={IN_PROGRESS_ID}
                    title="진행 중"
                    status="In Progress"
                    tdls={progressTdls}
                    draggingId={draggingId}
                    recentlyDraggedId={recentlyDraggedId}
                    onCreate={onCreate}
                />

                <BoardColumn
                    id={DONE_ID}
                    title="완료"
                    status="Done"
                    tdls={doneTdls}
                    draggingId={draggingId}
                    recentlyDraggedId={recentlyDraggedId}
                    onCreate={onCreate}
                />
            </div>
        </DndContext>
    );
};
interface BoardColumnProps {

    id: string;
    title: string;
    status: TDLStatus;
    tdls: TDLData[];
    draggingId: number | null;
    recentlyDraggedId: number | null;

    onCreate: (
        status: TDLStatus
    ) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
    id,
    title,
    status,
    tdls,
    draggingId,
    recentlyDraggedId,
    onCreate
}) => {

    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    });


    return (
        <div
            ref={setNodeRef}
            className={
                `${styles.tdl_column} ${
                    isOver
                        ? styles.tdl_column_over
                        : ''
                }`
            }
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
                {tdls.map((tdl) => (
                    <Project_TDLCard
                        key={tdl.tdlid}
                        tdl={tdl}
                        disableClick={
                            draggingId === tdl.tdlid ||
                            recentlyDraggedId === tdl.tdlid
                        }
                    />
                ))}
            </div>
            <button
                type="button"
                className={styles.tdl_add_button}
                onClick={() => onCreate(status)}
            >
                +
            </button>
        </div>
    );
};