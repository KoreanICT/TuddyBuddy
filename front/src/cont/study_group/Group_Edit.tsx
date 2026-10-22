import api from './api';
//작성자 : 오진석
import React, { useEffect, useRef, useState } from 'react'
import styles from './detail.module.css';
import { TagItem, searchGroupTags, patchGroup, GroupUpdateRequest } from './GroupAPI';

const PRESET_COLORS = ['#e2e8f0', '#fef08a', '#bbf7d0', '#c0f2ff', '#bfdbfe', '#fbcfe8', '#fed7aa'];

interface GroupEditProps {
    groupNum: number;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (groupNum: number) => void;
}

export const Group_EditModal: React.FC<GroupEditProps> = ({ groupNum, isOpen, onClose, onUpdated }) => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [tags, setTags] = useState<TagItem[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [suggestedTags, setSuggestedTags] = useState<TagItem[]>([]);
    const [tagLoading, setTagLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const keyword = tagInput.trim();
        if (!keyword) {
            setSuggestedTags([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setTagLoading(true);
                const result = await searchGroupTags(keyword);
                setSuggestedTags(result);
            } catch (error) {
                console.error('태그 검색 실패:', error);
            } finally {
                setTagLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [tagInput]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const loadEditData = async () => {
            try {
                const response = await api.get(
                    `/group/detail/edit/${groupNum}`
                )
                const data = response.data;

                setTitle(data.group_title ?? '');
                setDescription(data.group_desc ?? '');
                setInviteCode(data.group_invitecode ?? '');
                setTags(data.tags ?? []);

                if (data.group_thumbnail) {
                    setPreviewUrl(
                        `http://localhost/back/api/group/thumbnail/${encodeURIComponent(
                            data.group_thumbnail
                        )}`
                    )
                } else {
                    setPreviewUrl('');
                }

                setThumbnail(null);
            } catch (error) {
                console.error('스터디룸 수정 정보 조회 실패', error);
            }
        };
        loadEditData();
    }, [isOpen, groupNum])

    if (!isOpen) {
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const handleSelectTag = (tag: TagItem) => {
        if (tags.length >= 3) {
            alert('태그는 최대 3개까지 지정할 수 있습니다.')
            return;
        };

        const duplicate = tags.some((selectedTag) => {
            if (
                tag.tag_num !== undefined &&
                selectedTag.tag_num !== undefined
            ) {
                return (
                    tag.tag_num === selectedTag.tag_num
                );
            }
            return (
                selectedTag.tag_name.toLowerCase() === tag.tag_name.toLowerCase()
            );
        });

        if (duplicate) {
            alert('이미 선택한 태그입니다.');
            return;
        }

        setTags(prev => [...prev, tag]);

        setTagInput('');
        setSuggestedTags([]);
    }

    const handleAddTag = () => {
        const tagName = tagInput.trim();

        if (!tagName) {
            return;
        }

        if (tags.length >= 3) {
            alert('태그는 최대 3개까지 지정할 수 있습니다.');
            return;
        }

        const existingTag = suggestedTags.find(
            tag => tag.tag_name.toLowerCase() === tagName.toLowerCase()
        );

        if (existingTag) {
            handleSelectTag(existingTag);
            return;
        }

        const duplicate =
            tags.some(
                tag => tag.tag_name.toLowerCase() === tagName.toLowerCase()
            );


        if (duplicate) {
            alert('이미 선택한 태그입니다.');
            return;
        }

        const newTag: TagItem = {
            tag_name: tagName,
            tag_color: selectedColor
        }
        setTags(prev => [...prev, newTag]);
        setTagInput('');
        setSuggestedTags([]);
    };

    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            alert('스터디룸 이름과 소개는 필수 입력 항목입니다.');
            return;
        }

        if (tags.length > 3) {
            alert('태그는 최대 3개까지 지정할 수 있습니다.');
            return;
        };

        const requestData: GroupUpdateRequest = {
            group_title: title.trim(),
            group_desc: description.trim(),
            group_thumbnail: null,
            tags
        };

        try {
            setSubmitting(true);
            
            await patchGroup(groupNum, requestData, thumbnail);

            alert('스터디룸이 변경되었습니다.')
            if (onUpdated) onUpdated(groupNum);
            onClose();

        } catch (error) {
            console.error('스터디룸 변경 실패:', error);
            alert('스터디룸 변경 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
        console.log('thumbnail:', thumbnail);
        console.log('thumbnail name: ', thumbnail?.name);
    };

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h2>
                        스터디룸 수정
                    </h2>

                    <button
                        type="button"
                        className={styles.close_btn}
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.create_form}>
                    {/* 상단 2컬럼 레이아웃: 좌측 정사각형 썸네일 + 우측 스터디룸 이름 */}
                    <div className={styles.top_row_group}>
                        {/* 1. 썸네일 이미지 등록 (정사각형) */}
                        <div className={styles.thumbnail_field}>
                            <div className={styles.square_image_upload_box}>
                                {previewUrl ? (
                                    <div className={styles.square_preview_wrapper}>
                                        <img src={previewUrl} alt="Thumbnail Preview" className={styles.square_thumbnail_preview} />
                                        <button
                                            type="button"
                                            className={styles.remove_img_btn}
                                            onClick={() => { setThumbnail(null); setPreviewUrl(''); }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={styles.square_upload_placeholder}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <span>📷 이미지 등록</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        {/* 2. 스터디룸 이름 (우측 공간 전체 차지) */}
                        <div className={styles.title_field}>
                            <label className={styles.form_label}>
                                스터디룸 이름
                                <span className={styles.required}>
                                    *
                                </span>
                            </label>
                            <input
                                type="text"
                                className={styles.form_input}
                                placeholder="예: 프론트엔드 CS 지식 면접 스터디"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>


                    {/* =====================
                        설명
                       ===================== */}

                    <div className={styles.form_group}>
                        <label className={styles.form_label}>
                            스터디룸 소개
                            <span className={styles.required}>
                                *
                            </span>
                        </label>

                        <textarea
                            className={styles.form_textarea}
                            placeholder="스터디 목적, 목표, 규칙 등을 간단히 입력해주세요."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    {/* =====================
                        태그
                       ===================== */}

                    <div className={styles.form_group}>

                        <label className={styles.form_label}>
                            태그 설정
                            {' '}
                            ({tags.length}/3)
                        </label>


                        <div className={styles.tag_color_picker}>
                            <span className={styles.picker_title}>
                                새 태그 배경색:
                            </span>

                            {PRESET_COLORS.map(
                                color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={
                                            `${styles.color_dot} ${selectedColor === color
                                                ? styles.selected_color
                                                : ''
                                            }`
                                        }
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                )
                            )}
                        </div>
                        <div className={styles.inline_input_group}>
                            <input
                                type="text"
                                className={styles.form_input}
                                placeholder="태그명 입력 (예: React)"
                                value={tagInput}
                                disabled={tags.length >= 3}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }
                                }
                            />
                            <button
                                type="button"
                                className={`${styles.action_btn} ${styles.secondary}`}
                                onClick={handleAddTag}
                                disabled={tags.length >= 3}
                            >
                                추가
                            </button>
                        </div>
                        {/* 검색중 */}
                        {tagLoading && (
                            <div>
                                태그 검색 중...
                            </div>
                        )}
                        {/* 태그 자동완성 */}
                        {suggestedTags.length > 0 && (
                            <div className={styles.tag_suggestions}>
                                {suggestedTags.map(tag => (
                                    <button
                                        type="button"
                                        key={tag.tag_num}
                                        className={styles.tag_suggestion_item}
                                        onClick={() =>
                                            handleSelectTag(tag)
                                        }
                                    >
                                        <span style={{ backgroundColor: tag.tag_color }}>
                                            {tag.tag_name}
                                        </span>
                                    </button>
                                )
                                )}
                            </div>
                        )}
                        {/* 선택된 태그 */}
                        <div className={styles.tag_list}>
                            {tags.map(
                                (tag, index) => (
                                    <span
                                        key={tag.tag_num ?? `${tag.tag_name}-${index}`}
                                        className={styles.custom_tag}
                                        style={{ backgroundColor: tag.tag_color }}
                                    >
                                        {tag.tag_name}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveTag(index)
                                            }
                                            className={styles.remove_tag_btn}
                                        >
                                            &times;
                                        </button>
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                    {/* =====================
                        비공개
                       ===================== */}

                    <div className={styles.form_group}>
                        {inviteCode && (
                            <div className={styles.invite_code_box}>
                                <label className={styles.form_label_sub}>
                                    초대 코드
                                </label>
                                <div className={styles.inline_input_group}>
                                    <input
                                        type="text"
                                        className={styles.form_input}
                                        value={inviteCode}
                                        readOnly
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* =====================
                        하단 버튼
                       ===================== */}

                    <div className={styles.modal_actions}>
                        <button
                            type="button"
                            className={`${styles.action_btn} ${styles.secondary}`}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className={`${styles.action_btn} ${styles.primary}`}
                            disabled={submitting}
                        >
                            {submitting ? '변경 중...' : '변경하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
