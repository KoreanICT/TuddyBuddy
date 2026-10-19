// 작성자 : 오진석
import React, { useState } from 'react';
import styles from './project.module.css';

import { Repeat_type, TDLStatus } from './Type';


interface TDLInsertModalProps {

    status: TDLStatus;

    onClose: () => void;

    onSubmit: (
        tdl_name: string,
        tdl_detail: string,
        repeat_type: Repeat_type,
        due_at: string | null
    ) => Promise<void>;
}


export const Project_TDLInsertModal:
React.FC<TDLInsertModalProps> = ({
    status,
    onClose,
    onSubmit
}) => {


    const [tdlName, setTdlName] =
        useState<string>('');

    const [tdlDetail, setTdlDetail] =
        useState<string>('');

    const [repeatType, setRepeatType] =
        useState<Repeat_type>(null);

    const [dueAt, setDueAt] =
        useState<string>('');

    const [isSubmitting, setIsSubmitting] =
        useState<boolean>(false);


    const handleSubmit = async (
        e: React.FormEvent
    ): Promise<void> => {

        e.preventDefault();


        if (!tdlName.trim()) {
            alert('TDL 제목을 입력해주세요.');
            return;
        }


        /*
         * 반복 TDL은 마감일 사용 안 함
         */
        const submitDueAt =
            repeatType !== null
                ? null
                : dueAt || null;


        try {

            setIsSubmitting(true);

            await onSubmit(
                tdlName,
                tdlDetail,
                repeatType,
                submitDueAt
            );
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };


    return (

        <div className={styles.tdl_modal_backdrop} onClick={onClose}>

            <div className={styles.tdl_modal} onClick={(e) => e.stopPropagation()}>

                <div className={styles.tdl_modal_header}>

                    <h3>
                        TDL 등록
                    </h3>

                    <button
                        type="button"
                        className={styles.tdl_modal_close}
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className={styles.tdl_modal_form}
                >

                    <div className={styles.tdl_form_group}>

                        <label>
                            상태
                        </label>

                        <input
                            type="text"
                            value={status}
                            disabled
                        />

                    </div>


                    <div className={styles.tdl_form_group}>

                        <label>
                            제목
                        </label>

                        <input
                            type="text"
                            value={tdlName}
                            onChange={(e) =>
                                setTdlName(
                                    e.target.value
                                )
                            }
                            placeholder="할 일을 입력해주세요."
                            maxLength={100}
                        />

                    </div>


                    <div className={styles.tdl_form_group}>

                        <label>
                            상세 내용
                        </label>

                        <textarea
                            value={tdlDetail}
                            onChange={(e) =>
                                setTdlDetail(
                                    e.target.value
                                )
                            }
                            placeholder="상세 내용을 입력해주세요."
                            rows={4}
                        />

                    </div>


                    <div className={styles.tdl_form_group}>

                        <label>
                            반복
                        </label>

                        <select
                            value={
                                repeatType ?? ''
                            }
                            onChange={(e) => {

                                const value =
                                    e.target.value;

                                if (value === '') {

                                    setRepeatType(null);

                                } else {

                                    setRepeatType(
                                        value as Repeat_type
                                    );
                                }

                            }}
                        >

                            <option value="">
                                반복 없음
                            </option>

                            <option value="Daily">
                                매일
                            </option>

                            <option value="Weekly">
                                매주
                            </option>

                        </select>

                    </div>


                    {repeatType === null && (

                        <div className={styles.tdl_form_group}>

                            <label>
                                마감 기한
                            </label>

                            <input
                                type="datetime-local"
                                value={dueAt}
                                onChange={(e) =>
                                    setDueAt(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    )}


                    <div className={styles.tdl_modal_actions}>

                        <button
                            type="button"
                            className={styles.tdl_cancel_button}
                            onClick={onClose}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className={styles.tdl_submit_button}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? '등록 중...'
                                : '등록'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};