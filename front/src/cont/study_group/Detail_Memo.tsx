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
        <div className={styles.detail_content_wrapper}>
            <section className={styles.detail_section_card}>
                <div className={styles.memoHeader}>
                    <div>
                        <h3 className={styles.section_title}>
                            메모
                        </h3>
                        <p className={styles.section_desc}>
                            자유롭게 공부를 하면서 필요한 메모를 적는 공간입니다.
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