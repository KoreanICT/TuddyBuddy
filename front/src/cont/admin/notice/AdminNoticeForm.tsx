// 주용현

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';
import styles from './adminNoticeForm.module.css';
import { useAuth } from '../../../login/hooks/useAuth';

interface NoticeVO {
    num: number;
    member_num: number;
    title: string;
    content: string;
    imgn?: string;
    hit?: number;
    created_date?: string;
    updated_date?: string;
}

const API_URL = 'http://localhost:80/back/api/notice';

const AdminNoticeForm: React.FC = () => {
    const navigate = useNavigate();
    const { num } = useParams<{ num: string }>();
    const isEdit = !!num;
    const { memberNum } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imageName, setImageName] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);


    const adminNum = memberNum;

    // 공지사항 수정 시 기존 데이터 조회
    useEffect(() => {
        if (!isEdit) return;

        const fetchNotice = async () => {
            setLoading(true);

            try {
                const response = await axios.get<NoticeVO>(`${API_URL}/noticeDetail`, {
                    params: { num }
                });

                const notice = response.data;
                setTitle(notice.title || '');
                setContent(notice.content || '');
                setImageName(notice.imgn || '');
            } catch (error) {
                console.error('공지사항 조회 실패:', error);
                alert('공지사항을 불러오지 못했습니다.');
                navigate('/admin/notice');
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();
    }, [num, isEdit, navigate]);

    // 이미지 선택
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            e.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('이미지는 10MB 이하만 업로드할 수 있습니다.');
            e.target.value = '';
            return;
        }

        setImage(file);
        setImageName(file.name);
        setPreview(URL.createObjectURL(file));
    };

    // 새로 선택한 이미지 취소
    const handleRemoveImage = () => {
        setImage(null);
        setImageName('');
        setPreview(null);
    };

    // 공지사항 등록 / 수정
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        if (saving) return;
        setSaving(true);

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('member_num', String(adminNum));
        console.log(adminNum);

        if (image) formData.append('mfile', image);

        if (isEdit) formData.append('num', String(num));

        try {
            if (isEdit) {
                await axios.put(`${API_URL}/noticeUpdate`, formData);
            } else {
                await axios.post(`${API_URL}/noticeAdd`, formData);
            }

            alert(isEdit ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
            navigate('/admin/notice');
        } catch (error) {
            console.error('공지사항 저장 실패:', error);
            alert('공지사항 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>공지사항을 불러오는 중입니다.</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button type="button" className={styles.backButton} onClick={() => navigate('/admin/notice')}>
                        <ArrowLeft size={18} />
                        목록으로
                    </button>
                    <h1>{isEdit ? '공지사항 수정' : '공지사항 등록'}</h1>
                    <p>공지사항을 작성하고 관리할 수 있습니다.</p>
                </div>

                {/* Form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="noticeTitle">제목 <span>*</span></label>
                        <input id="noticeTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="공지사항 제목을 입력해주세요." maxLength={255} />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="noticeContent">내용 <span>*</span></label>
                        <textarea id="noticeContent" value={content} onChange={e => setContent(e.target.value)} placeholder="공지사항 내용을 입력해주세요." rows={14} />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="noticeImage">첨부 이미지</label>
                        <label className={styles.uploadBox} htmlFor="noticeImage">
                            <ImagePlus size={22} />
                            <span>이미지를 선택해주세요.</span>
                            <small>JPG, PNG, GIF 등 이미지 파일 (최대 10MB)</small>
                        </label>
                        <input id="noticeImage" type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />

                        {imageName && (
                            <div className={styles.imageInfo}>
                                {preview && <img src={preview} alt="첨부 이미지 미리보기" className={styles.preview} />}
                                <span>{imageName}</span>
                                <button type="button" onClick={handleRemoveImage} aria-label="이미지 선택 취소"><X size={17} /></button>
                            </div>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={() => navigate('/admin/notice')}>취소</button>
                        <button type="submit" className={styles.saveButton} disabled={saving}>
                            <Save size={17} />
                            {saving ? '저장 중...' : isEdit ? '수정하기' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminNoticeForm;