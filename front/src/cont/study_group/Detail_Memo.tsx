//작성자 : 오진석
import React, { useEffect, useState } from 'react';
import styles from './memo.module.css';
import { Detail_MemoBoard } from './Detail_MemoBoard';
import { MemoData } from './Detail_MemoCard';
import { GetGroupNum } from './GroupAPI'
import api from './api';



export const Detail_Memo: React.FC<GetGroupNum> = ({ groupNum }) => {

    const [memos, setMemos] = useState<MemoData[]>([]);

    useEffect(() => {
        const getMemos = async () => {
            try {
                const response = await api.get<MemoData[]>(`/detail/memo/getMemos/${groupNum}`);

                const responseData: MemoData[] = response.data;
                setMemos(responseData);
                // console.log(responseData);
                // console.log("Memo 출력 성공.", responseData);

            } catch (error) {
                console.error("Memo 출력 실패. 원인:", error);
            }
        };
        getMemos();
    }, [groupNum])

    const handleCreateDraft = () => {
        const exists = memos.some((memo) => memo.isDraft);

        if (exists) {
            return;
        }

        const tempId = -Date.now();

        const draftMemo: MemoData = {
            memo_num: tempId,
            group_num: groupNum,
            member_nick: '',
            memo_content: '',
            created_at: '',
            updated_at: null,
            can_manage: 1,
            isDraft: true
        }

        setMemos((prev) => [
            draftMemo, ...prev
        ]);
    };

    const handleInsertMemo = async (tempMemoNum: number, memo_content: string): Promise<void> => {

        const response = await api.post<MemoData>(
            `/detail/memo/addMemo/${groupNum}`,
            { memo_content }
        );

        const savedMemo = response.data;

        setMemos((prev) =>
            prev.map((memo) =>
                memo.memo_num === tempMemoNum ? savedMemo : memo
            )
        );
    };

    const handleUpdateMemo = async (memoNum: number, memo_content: string): Promise<void> => {

        await api.patch<MemoData>(
            `/detail/memo/patchMemo/${memoNum}`,
            { memo_content }
        );

        setMemos((prev) =>
            prev.map((memo) =>
                memo.memo_num === memoNum ? { ...memo, memo_content } : memo
            )
        );
    };

    const handleDeleteMemo = async (memoNum: number): Promise<void> => {
        const targetMemo = memos.find((memo) => memo.memo_num === memoNum);

        if (!targetMemo) {
            return;
        }

        if (targetMemo.isDraft) {
            setMemos((prev) => prev.filter((memo) => memo.memo_num !== memoNum));
            return;
        };

        await api.delete(
            `/detail/memo/deleteMemo/${memoNum}`
        );

        setMemos((prev) =>
            prev.filter(
                (memo) =>
                    memo.memo_num !== memoNum
            )
        );
    };

    const handleCancelDraft = (memoNum: number): void => {
        setMemos((prev) => prev.filter((memo) => memo.memo_num !== memoNum));
    };

    return (
        <div className={styles.detail_content_wrapper}>
            <section className={styles.detail_section_card}>
                <div className={styles.memoHeader}>
                    <div>
                        <h3 className={styles.section_title}>
                            메모
                        </h3>
                        <p className={styles.section_desc}>
                            공부를 하면서 필요한 메모를 자유롭게 적는 공간입니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={handleCreateDraft}
                    >
                        + 메모 등록
                    </button>
                </div>

                <Detail_MemoBoard
                    memos={memos}
                    onInsert={handleInsertMemo}
                    onUpdate={handleUpdateMemo}
                    onDelete={handleDeleteMemo}
                    onCancelDraft={handleCancelDraft}
                />
            </section>
        </div>
    );
};