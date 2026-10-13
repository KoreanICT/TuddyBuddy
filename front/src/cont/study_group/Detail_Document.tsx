import React, { useEffect, useState } from 'react'
import styles from './detail.module.css'
import { Detail_Document_insert } from './Detail_Document_insert';
import { GetGroupNum, formatFileSize } from './GroupAPI'
import axios from 'axios';
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


const backendUrl = process.env.REACT_APP_BACK_END_URL;

export const Detail_Document: React.FC<GetGroupNum> = ({ groupNum }) => {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [documents, setDocuments] = useState<DocumentData[]>([]);

    const handleUploadSuccess = () => {
        setIsModalOpen(false);
    }

    const documentdataHandle = (responseData:DocumentData[]) => {
        setDocuments(responseData)
    }
    useEffect(() => {

        const getDocuments = async () => {
            try {
                const response = await axios.get<DocumentData[]>(`http://localhost/back/api/detail/document/getDocuments/${groupNum}`);

                const responseData:DocumentData[] = response.data;
                setDocuments(responseData)
                console.log("Documentlist 출력 성공.");

            } catch (error) {
                console.error("Documentlist 출력 실패. 원인:", error);
            }
        };
        getDocuments();
    }, [])

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
                                        {document.original_name}.{document.document_type}
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
                                        {document.created_at}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.document_download_btn}
                                >
                                    다운로드
                                </button>
                            </div>
                        ))
                    )}

                    <Detail_Document_insert
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmitSuccess={handleUploadSuccess}
                        groupNum={groupNum}
                    />
                </div>
            </div>
        </div>
    )
}