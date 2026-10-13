import React from 'react';
import styles from './project.module.css';
import {useDraggable} from '@dnd-kit/core';
import { TDLData } from './GroupAPI';

interface TDLProps {
    tdl: TDLData;
    disableClick: boolean;
}

export const Project_TDLCard: React.FC<TDLProps> = ({tdl,disableClick}) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({ id: tdl.tdlid });


    /*
     * 반복 업무
     *
     * due_at 없음
     * repeat_type 있음
     */
    const isRepeatTdl =
        !tdl.due_at &&
        tdl.repeat_type !== null;

    /*
     * 마감 도달 / 초과 검사
     *
     * 완료된 TDL은 제외
     */
    const isDeadlineReached = (): boolean => {

        if (!tdl.due_at || tdl.status === 'Done') {
            return false;
        }

        const today = new Date();

        today.setHours(0,0,0,0);

        const dueDate = new Date(tdl.due_at);

        dueDate.setHours(0,0,0,0);

        return (
            today.getTime() >=
            dueDate.getTime()
        );
    };

    const deadlineReached =
        isDeadlineReached();

    const dragStyle: React.CSSProperties = {

        transform: transform
            ? `translate3d(
                ${transform.x}px,
                ${transform.y}px,
                0
            )`
            : undefined,

        opacity:
            isDragging
                ? 0.6
                : 1
    };


    return (
        <div
            ref={setNodeRef}
            style={dragStyle}
            {...listeners}
            {...attributes}
            className={
                `${styles.tdl_card} ${deadlineReached? styles.tdl_card_deadline : ''} ${isRepeatTdl ? styles.tdl_card_repeat : ''}`
            }
        >

            <div className={styles.tdl_card_title}>
                {tdl.name}
            </div>

            {tdl.detail && (
                <p className={styles.tdl_card_detail}>
                    {tdl.detail}
                </p>
            )}
            <div className={styles.tdl_card_footer}>
                {tdl.due_at && (
                    <span
                        className={ deadlineReached ? styles.tdl_deadline_warning : styles.tdl_deadline }
                    >
                        마감 {tdl.due_at}
                    </span>
                )}
                {isRepeatTdl && (
                    <span className={styles.tdl_repeat}>
                        ↻ { tdl.repeat_type === 'Daily' ? '매일' : '매주' }
                    </span>
                )}
            </div>
        </div>
    );
};