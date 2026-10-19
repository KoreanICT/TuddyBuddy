//작성자 : 오진석
import React, { useEffect, useState } from 'react';
import styles from './project.module.css';

import { Project_Board } from './Project_Board';
import { TDLData } from './GroupAPI';
import { Repeat_type, TDLStatus } from './Type';
import { GetGroupNum } from './GroupAPI'
import api from './api';
import { Project_TDLInsertModal } from './Project_TDLInsertModal';

type ViewMode = 'board' | 'list';
export const Project_TDL: React.FC<GetGroupNum> = ({ groupNum }) => {

    const [viewMode, setViewMode] = useState<ViewMode>('board');
    const [tdls, setTdls] = useState<TDLData[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [createStatus, setCreateStatus] = useState<TDLStatus>('To Do');
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    const getTdls = async (): Promise<void> => {
        try {
            const response = await api.get<TDLData[]>(
                `/detail/tdl/getTdls/${groupNum}`
            )

            setTdls(response.data)
        } catch (error) {
            console.error('TDL 조회 중 오류가 발생했습니다.', error);
        }
    }

    useEffect(() => {
        if (!groupNum) {
            return;
        }
        getTdls();
    }, [groupNum])

    const handleStatusChange = async (tdlNum: number, status: TDLStatus): Promise<void> => {
        try {
            await api.patch(
                `/detail/tdl/patchStatus/${tdlNum}`,
                {
                    status: status
                }
            )
            setTdls((prev) =>
                prev.map((tdl) =>
                    tdl.tdl_num === tdlNum ? {
                        ...tdl,
                        status,
                        updated_at: new Date().toISOString(),

                        completed_at:
                            status === 'Done' ? new Date().toISOString() : undefined
                    }
                        : tdl
                )
            );
        } catch (error) {
            console.error('TDL 상태 변경에 오류가 생겼습니다.');
        }
    };

    const handleDeleteTdl = async (tdlNum: number): Promise<void> => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            try {
                await api.delete(
                    `/detail/tdl/deleteTdl/${tdlNum}`
                );
                setTdls((prev) => prev.filter((tdl) => tdl.tdl_num !== tdlNum));
                getTdls();
            } catch (error) {
                console.error('TDL 삭제 중 오류가 발생했습니다.', error);
            }
        }
    };

    const handleCreateTdl = async (status: TDLStatus): Promise<void> => {
        setCreateStatus(status);
        setIsCreateOpen(true);
    };

    const handleInsertTdl = async (tdl_name: string, tdl_detail: string, repeat_type: Repeat_type, due_at: string | null): Promise<void> => {

        try {
            setIsSaving(true)
            await api.post(
                `/detail/tdl/addTdl/${groupNum}`, {
                tdl_name, tdl_detail, status: createStatus, repeat_type, due_at
            })
            alert("등록에 성공했습니다.")
            getTdls();
        } catch (error) {
            alert("등록에 실패했습니다.");
            console.error("등록에 실패했습니다.", error);
            throw error;
        } finally {
            setIsSaving(false)
        }
    }

    const handlePatchTdl = async (tdl: TDLData): Promise<void> => {

        try{
            setIsSaving(true);
            await api.post(
                `/detail/tdl/`
            )
        } catch(error) {
            console.error('변경 실패.', error);
        }
    }

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <div className={styles.tdl_header}>
                    <div>
                        <h3 className={styles.section_title}>
                            해야할 일
                        </h3>
                        <p className={styles.section_desc}>
                            스터디에서 해야할 일을 등록하고
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
                        onEdit={handlePatchTdl}
                        onDelete={handleDeleteTdl}
                    />
                ) : (
                    <div className={styles.tdl_list}>
                        {tdls.length > 0 ? (
                            tdls.map((tdl) => (
                                <div
                                    key={tdl.tdl_num}
                                    className={styles.tdl_list_item}
                                >
                                    <div>
                                        <strong>{tdl.tdl_name}</strong>
                                        <p>{tdl.tdl_detail}</p>
                                    </div>

                                    <span>
                                        {tdl.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.tdl_empty}>
                                <p>
                                    등록된 TDL이 없습니다.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isCreateOpen && (
                <Project_TDLInsertModal
                    status={createStatus}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleInsertTdl}
                />
            )}
        </div >
    );
};