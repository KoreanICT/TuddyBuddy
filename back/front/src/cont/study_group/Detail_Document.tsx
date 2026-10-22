//작성자 : 오진석
import React, { useEffect, useState } from 'react'
import styles from './detail.module.css'
import { Detail_DocumentModal } from './Detail_DocumentModal';
import { GetGroupNum, formatFileSize } from './GroupAPI'
import api from './api';

interface DocumentData {
    document_num: number;
    group_num: number;
    member_nick: string;
    document_title: string;
    document_type: string;
    document_size: number;
    original_name: string;
    hit: number;
    created_at: string;
    updated_at?: string | null;
    can_manage: number;
}

export const Detail_Document: React.FC<GetGroupNum> = ({ groupNum }) => {

    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [editingDocumentNum, setEditingDocumentNum] = useState<number | null>(null);

    useEffect(() => {
        getDocuments();
    }, [groupNum])

    const handleDownload = async (documentNum: number, originalName: string, documentType: string) => {
        try {
            const response = await api.get(
                `/detail/document/download/${documentNum}`,
                {
                    responseType: 'blob'
                }
            );
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = documentType ? `${originalName}.${documentType}` : originalName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('문서 다운로드 실패', error);
            alert('파일 다운로드 중 오류가 발생했습니다.')
        };
    };

    const handleDelete = async (documentNum: number) => {
        const confirmed = window.confirm('삭제하시겠습니까?');
        if(!confirmed) {
            return;
        }
        try {
            await api.delete(`/detail/document/deleteDocument/${documentNum}`);
            alert('참고 자료가 삭제되었습니다.')
            await getDocuments();
        }  catch (error) {
            console.error('문서 삭제 실패:', error);
            alert('문서 삭제 중 오류가 발생했습니다.');
        }
    }

    const handleEdit = (document: DocumentData) => {
        setEditingDocumentNum(document.document_num);
        setIsModalOpen(true);
    }
    const getDocuments = async () => {
        try {
            const response = await api.get<DocumentData[]>(`/detail/document/getDocuments/${groupNum}`);

            const responseData: DocumentData[] = response.data;
            setDocuments(responseData)
            // console.log("Documentlist 출력 성공.", responseData);

        } catch (error) {
            console.error("Documentlist 출력 실패. 원인:", error);
        }
    };

    

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>

                <h3 className={styles.section_title}>참고 자료</h3>
                <p className={styles.section_desc}>
                    참고용 자료를 업로드하여 멤버들끼리 공유하는 공간입니다.
                </p>
                <button
                    type="button"
                    className={styles.document_upload_btn}
                    onClick={() => setIsModalOpen(true)}
                >
                    자료 등록
                </button>

                <div className={styles.document_list}>

                    {documents.length === 0 ? (
                        <div className={styles.document_empty}>
                            등록된 참고 자료가 없습니다.
                        </div>
                    ) : (
                        documents.map((document) => (
                            <div
                                key={document.document_num}
                                className={styles.document_item}
                            >
                                <div className={styles.document_main}>
                                    <strong className={styles.document_title}>
                                        {document.document_title}
                                    </strong>

                                    <span className={styles.document_name}>
                                        {document.original_name}
                                    </span>
                                </div>

                                <div className={styles.document_info}>
                                    <span>
                                        작성자 : {document.member_nick}
                                    </span>
                                    <span>
                                        {formatFileSize(document.document_size)}
                                    </span>
                                    <span>
                                        다운로드 {document.hit}
                                    </span>
                                    <span>
                                        {document.updated_at ? document.updated_at : document.created_at}
                                    </span>
                                </div>
                                {document.can_manage === 1 && (
                                    <>
                                        <button 
                                            type="button"
                                            className={styles.document_edit_btn}
                                            onClick={() => handleEdit(document)}
                                        >
                                            수정
                                        </button>

                                        <button 
                                            type="button"
                                            className={styles.document_delete_btn}
                                            onClick={() => handleDelete(document.document_num)}
                                        >
                                            삭제
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className={styles.document_download_btn}
                                    onClick={() => handleDownload(
                                        document.document_num,
                                        document.original_name,
                                        document.document_type
                                    )}
                                >
                                    다운로드
                                </button>
                            </div>
                        ))
                    )}

                    <Detail_DocumentModal
                        isOpen={isModalOpen}
                        onClose={() => {setIsModalOpen(false); setEditingDocumentNum(null);}}
                        onSubmitSuccess={async () => {
                            setIsModalOpen(false);
                            setEditingDocumentNum(null);

                            await getDocuments();
                        }}
                        groupNum={groupNum}
                        mode={editingDocumentNum ? 'edit' : 'create'}
                        documentNum={editingDocumentNum ?? undefined}
                    />
                </div>
            </div>
        </div>
    )
}