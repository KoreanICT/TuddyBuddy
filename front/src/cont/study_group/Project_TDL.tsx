import React, { useState } from 'react';
import styles from './project.module.css';

import { Project_Board } from './Project_Board';
import { TDLData } from './GroupAPI';
import { TDLStatus } from './Type';

type ViewMode = 'board' | 'list';

export const Project_TDL: React.FC = () => {

    const [viewMode, setViewMode] = useState<ViewMode>('board');

    const [tdls, setTdls] = useState<TDLData[]>([
        {
            tdlid: 1,
            member: '진석',
            name: 'Spring Security 공부',
            detail: 'JWT 인증 구조 정리하기',
            status: 'To Do',
            repeat_type: null,
            created_at: '2026-10-02',
            due_at: '2026-10-05'
        },
        {
            tdlid: 2,
            member: '진석',
            name: '알고리즘 문제 풀기',
            detail: '매일 알고리즘 문제 1개 풀기',
            status: 'To Do',
            repeat_type: 'Daily',
            created_at: '2026-10-02'
        }
    ]);

    const handleStatusChange = async (tdlid: number, status: TDLStatus): Promise<void> => {
        setTdls((prev) =>
            prev.map((tdl) =>
                tdl.tdlid === tdlid ? {
                        ...tdl,
                        status,
                        updated_at: new Date().toISOString(),

                        completed_at:
                            status === 'Done' ? new Date().toISOString() : undefined
                    }
                    : tdl
            )
        );
    };

    const handleCreateTdl = (status: TDLStatus): void => {
        console.log('TDL 생성:', status);
    };

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>

                <div className={styles.tdl_header}>
                    <div>
                        <h3 className={styles.section_title}>
                            해야 할 일
                        </h3>
                        <p className={styles.section_desc}>
                            스터디에서 해야 할 일을 등록하고
                            진행 상태를 관리할 수 있습니다.
                        </p>
                    </div>

                    <div className={styles.tdl_view_switch}>
                        <button
                            type="button"
                            className={
                                viewMode === 'board'
                                    ? styles.tdl_view_button_active
                                    : styles.tdl_view_button
                            }
                            onClick={() => setViewMode('board')}
                        >
                            보드
                        </button>

                        <button
                            type="button"
                            className={
                                viewMode === 'list'
                                    ? styles.tdl_view_button_active
                                    : styles.tdl_view_button
                            }
                            onClick={() => setViewMode('list')}
                        >
                            리스트
                        </button>
                    </div>
                </div>

                {viewMode === 'board' ? (
                    <Project_Board
                        tdls={tdls}
                        onStatusChange={handleStatusChange}
                        onCreate={handleCreateTdl}
                    />
                ) : (
                    <div className={styles.tdl_list}>
                        {tdls.map((tdl) => (
                            <div
                                key={tdl.tdlid}
                                className={styles.tdl_list_item}
                            >
                                <div>
                                    <strong>{tdl.name}</strong>
                                    <p>{tdl.detail}</p>
                                </div>

                                <span>
                                    {tdl.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};