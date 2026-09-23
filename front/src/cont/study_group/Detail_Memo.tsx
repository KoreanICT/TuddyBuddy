import React, { useState } from 'react';
import styles from './memo.module.css';
import { Detail_MemoBoard } from './Detail_MemoBoard';
import type { MemoData } from './Detail_MemoCard';

export const Detail_Memo: React.FC = () => {
    // ===========================
    // 임시 데이터
    // 나중에는 GET API 결과로 교체
    // ===========================
    const [memos, setMemos] = useState<MemoData[]>([
        {
            memo_num: 1,
            writer: '진석',
            content: '왜 오늘 이렇게 시간이 늦게 가냐',
            created_at: '2026.09.23 11:20'
        },
        {
            memo_num: 2,
            writer: '진석',
            content:
                'React에서 Drag & Drop을 구현하고 있습니다. ' +
                '내용이 길어지면 이렇게 메모지에서는 일부만 보여주고 ' +
                '클릭했을 때 전체 내용을 확인할 수 있도록 만들 예정입니다.',
            created_at: '2026.09.23 13:15',
            updated_at: '2026.09.23 14:33'
        },
        {
            memo_num: 3,
            writer: 'NNN',
            content:
                'From now on this sector is taken over by Nullifying Nuke Nuts!!!',
            created_at: '2026.09.23 17:56'
        }
    ]);

    // ===========================
    // 메모 등록 관련 상태
    // ===========================

    const [isWriting, setIsWriting] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<string>('');

    // ===========================
    // INSERT
    // ===========================

    const handleInsertMemo = (): void => {if (!newContent.trim()) {return;}
        /*
         * 실제 Backend 연동 시에는 여기에서
         *
         * const member_num = useAuth()에서 가져온 값
         * const group_num = 현재 그룹에서 가져온 값
         *
         * await axios.post(..., {
         *     group_num,
         *     member_num,
         *     memo_content: newContent
         * });
         *
         * 형태로 변경하면 됩니다.
         */
        const newMemo: MemoData = {
            // 프론트 테스트용 ID
            // 실제로는 DB의 memo_num을 사용
            memo_num: Date.now(),
            writer: '현재 로그인 사용자',
            content: newContent,
            created_at: new Date().toLocaleString('ko-KR')
        };
        setMemos((prev) => [
            newMemo,
            ...prev
        ]);
        setNewContent('');
        setIsWriting(false);
    };
    // ===========================
    // UPDATE
    // ===========================
    const handleUpdateMemo = async (
        memoNum: number,
        content: string
    ): Promise<void> => {

        /*
        await axios.patch(
            `${backendUrl}/api/memo/${memoNum}`,
            {
                memo_content: content
            }
        );
        */
        setMemos((prev) =>
            prev.map((memo) =>
                memo.memo_num === memoNum
                    ? {
                        ...memo,
                        content,
                        updated_at:
                            new Date().toLocaleString('ko-KR')
                    }
                    : memo
            )
        );
    };
    // ===========================
    // DELETE
    // ===========================
    const handleDeleteMemo = async (
        memoNum: number
    ): Promise<void> => {
        /*
        await axios.delete(
            `${backendUrl}/api/memo/${memoNum}`
        );
        */
        setMemos((prev) =>
            prev.filter(
                (memo) =>
                    memo.memo_num !== memoNum
            )
        );
    };

    return (
        <div className={styles.memoWrapper}>
            <section className={styles.memoSection}>
                <div className={styles.memoHeader}>
                    <div>
                        <h3 className={styles.memoTitle}>
                            메모
                        </h3>
                        <p className={styles.memoDescription}>
                            자유롭게 공부를 하다 생긴 질문이나
                            이해한 점을 작성하는 공간입니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() =>
                            setIsWriting((prev) => !prev)
                        }
                    >
                        + 메모 등록
                    </button>
                </div>
                {/* =======================
                    메모 작성 영역
                ======================= */}
                {isWriting && (
                    <div className={styles.memoWriter}>
                        <textarea
                            value={newContent}
                            className={styles.memoWriterTextarea}
                            placeholder="메모할 내용을 입력하세요."
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) => {
                                setNewContent(e.target.value);
                            }}
                        />
                        <div className={styles.memoWriterButtons}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsWriting(false);
                                    setNewContent('');
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertMemo}
                            >
                                등록
                            </button>
                        </div>
                    </div>
                )}
                {/* =======================
                    코르크 게시판
                ======================= */}
                <Detail_MemoBoard
                    memos={memos}
                    onUpdate={handleUpdateMemo}
                    onDelete={handleDeleteMemo}
                />
            </section>
        </div>
    );
};