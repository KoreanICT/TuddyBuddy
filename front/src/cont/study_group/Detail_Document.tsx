import React, { useEffect, useState } from 'react'
import styles from './detail.module.css'
import { Detail_Document_insert } from './Detail_Document_insert';
import axios from 'axios';
interface DocumentData {
    document_num: number;
    group_num: number;
    member_nick: string;
    title: string;
    original_name: string;
    document_type: string;
    document_size: number;
    hit: number;
    created_at: string;
    updated_at?: string | null;
}

const backendUrl = process.env.REACT_APP_BACK_END_URL;

export const Detail_Document: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [documents, setDocuments] = useState<DocumentData[]>([{
        document_num: 1,
        group_num: 1,
        member_nick: '오진석',
        title: '파이썬 2강 교재',
        original_name: '파이썬',
        document_type: 'pdf',
        document_size: 87003,
        hit: 67,
        created_at: "2026.09.30",
    },
    {
        document_num: 2,
        group_num: 1,
        member_nick: '오진석',
        title: '파이썬 3강 교재',
        original_name: '파이썬',
        document_type: 'pdf',
        document_size: 78803,
        hit: 103,
        created_at: "2026.10.02",
    }]);

    const handleUploadSuccess = () => {
        setIsModalOpen(false);
    }

    const formatFileSize = (size: number) => {
        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`
        }

        return `${(size / (1024 * 1024)).toFixed(1)} MB`
    };

    // const documentdataHandle = (responseData:DocumentData[]) => {
    //     setDocuments(responseData)
    // }
    // useEffect(() => {

    //     if (!isModalOpen) return;

    //     const getDocuments = async () => {
    //         try {
    //             const response = await axios.get<DocumentData>(`${backendUrl}/api/`);

    //             const responseData:DocumentData = response.data;
    //             if (!responseData) {
    //                 return;
    //             } else {
    //                 documentdataHandle([responseData])
    //             }
    //             console.log("Documentlist 출력 성공.");


    //         } catch (error) {
    //             console.error("Documentlist 출력 실패. 원인:", error);
    //         }
    //     };
    //     getDocuments();
    // }, [])

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
                                        {document.title}
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
                                        조회 {document.hit}
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
                    />
                </div>
            </div>
        </div>
    )
}