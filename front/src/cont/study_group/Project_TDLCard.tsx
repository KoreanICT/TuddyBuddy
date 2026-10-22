//작성자 : 오진석
import React, { useState } from 'react';
import styles from './project.module.css';
import { useDraggable } from '@dnd-kit/core';

import { TDLData } from './GroupAPI';


interface TDLProps {
    tdl: TDLData;
    disableClick: boolean;

    onEdit: (tdl: TDLData) => void;
    onDelete: (tdlNum: number) => void;
}

export const Project_TDLCard: React.FC<TDLProps> = ({ tdl, disableClick, onEdit, onDelete }) => {

    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const isIncomplete = tdl.status === 'Incomplete';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({

        id: tdl.tdl_num,

        disabled: isIncomplete
    });
    const isRepeatTdl =
        !tdl.due_at &&
        tdl.repeat_type !== null;
    const isDeadlineReached =
        (): boolean => {
            if (
                !tdl.due_at ||
                tdl.status === 'Done'
            ) {
                return false;
            }
            const now = new Date();
            const dueDate = new Date(tdl.due_at);
            return (
                now.getTime() >=
                dueDate.getTime()
            );
        };
    const deadlineReached =
        isDeadlineReached();
    const dragStyle:
        React.CSSProperties = {

        transform:
            transform
                ? `translate3d(
                    ${transform.x}px,
                    ${transform.y}px,
                    0
                )`
                : undefined,

        opacity:
            isDragging
                ? 0.05
                : 1
    };
    const handleDelete =
        async (
            event:
                React.MouseEvent<HTMLButtonElement>
        ): Promise<void> => {
            event.stopPropagation();
            if (
                !window.confirm(
                    '이 TDL을 삭제하시겠습니까?'
                )
            ) {
                return;
            }
            await onDelete(
                tdl.tdl_num
            );
        };
    return (
        <div
            ref={setNodeRef}
            style={dragStyle}
            {...(
                isIncomplete
                    ? {}
                    : listeners
            )}
            {...(
                isIncomplete
                    ? {}
                    : attributes
            )}
            className={`${styles.tdl_card} ${isExpanded ? styles.tdl_card_expanded : ''} ${deadlineReached ? styles.tdl_card_deadline : ''} ${isRepeatTdl ? styles.tdl_card_repeat : ''}`}
            onClick={() => { if (!disableClick) { setIsExpanded((prev) => !prev); } }}>
            <div className={styles.tdl_card_title}>
                {tdl.tdl_name}
            </div>
            {tdl.tdl_detail && (
                <p className={isExpanded ? styles.tdl_card_detail_expanded : styles.tdl_card_detail}>
                    {tdl.tdl_detail}
                </p>
            )}
            <div className={styles.tdl_card_footer}>
                {tdl.due_at && (
                    <span className={deadlineReached ? styles.tdl_deadline_warning : styles.tdl_deadline}>
                        마감 {tdl.due_at}
                    </span>
                )}
                {isRepeatTdl && (
                    <span className={styles.tdl_repeat}>
                        ↻ {tdl.repeat_type === 'Daily' ? '매일' : '매주'}
                    </span>
                )}
                {isIncomplete && (
                    <button
                        type="button"
                        className={styles.tdl_delete_button}
                        onClick={handleDelete}
                    >
                        삭제
                    </button>
                )}
            </div>
            {isExpanded && (
                <div className={styles.tdl_card_info}>
                    <div>
                        <span>담당자</span>
                        <strong>{tdl.member_nick}</strong>
                    </div>

                    <div>
                        <span>등록일</span>
                        <strong>{tdl.created_at}</strong>
                    </div>

                    {tdl.updated_at && (
                        <div>
                            <span>수정일</span>
                            <strong>{tdl.updated_at}</strong>
                        </div>
                    )}

                    {tdl.completed_at && (
                        <div>
                            <span>완료일</span>
                            <strong>{tdl.completed_at}</strong>
                        </div>
                    )}
                </div>
            )}
            {isExpanded && tdl.can_manage === 1 && (
                <div
                    className={styles.tdl_card_actions}
                    onClick={(e) => e.stopPropagation()}
                >
                    {tdl.status !== 'Incomplete' && (
                        <button
                            type="button"
                            className={styles.tdl_edit_button}
                            onClick={() => onEdit(tdl)}
                        >
                            수정
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.tdl_delete_button}
                        onClick={() => onDelete(tdl.tdl_num)}
                    >
                        삭제
                    </button>
                </div>
            )}
        </div>
    );
};