import React, { useState, useRef, useEffect } from 'react';
import styles from './detail.module.css';
import { TagItem, searchGroupTags, createGroup } from './GroupAPI';

const PRESET_COLORS = ['#e2e8f0', '#fef08a', '#bbf7d0', '#c0f2ff', '#bfdbfe', '#fbcfe8', '#fed7aa'];

interface GroupCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: (groupNum: number) => void;
}

export const Group_Create: React.FC<GroupCreateModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [maxMembers, setMaxMembers] = useState<number>(5);

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tags, setTags] = useState<TagItem[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
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

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const generateRandomCode = () => {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        setInviteCode(code);
    };

    const handlePrivateToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsPrivate(checked);
        if (checked && !inviteCode) {
            generateRandomCode();
        }
        if (!checked) {
            setInviteCode('');
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
                selectedTag.tag_name.toLowerCase()===tag.tag_name.toLowerCase()
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
        setTags(tags.filter((_,i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            alert('스터디룸 이름과 소개는 필수 입력 항목입니다.');
            return;
        }

        if (tags.length > 3) {
            alert('태그는 최대 3개까지 지정할 수 있습니다.');
            return;
        };

        const requestData = {
            group: {
                group_title: title.trim(),
                group_desc: description.trim(),
                group_isPrivate: isPrivate ? 1 : 0,
                group_maxMembers: maxMembers,
                group_thumbnail: null,
                group_invitecode: isPrivate ?  inviteCode : null
            },
            tags
        };
        
        try {
            setSubmitting(true);
            const groupNum = await createGroup(requestData, thumbnail);

            alert('스터디룸이 생성되었습니다.')
            if (onSubmitSuccess) onSubmitSuccess(groupNum);
            onClose();

        } catch(error) {
            console.error('스터디룸 생성 실패:', error);
            alert('스터디룸 생성 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
        console.log('thumbnail:' , thumbnail);
        console.log('thumbnail name: ', thumbnail?.name);
    };

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h2>새 스터디룸 생성</h2>
                    <button className={styles.close_btn} onClick={onClose}>&times;</button>
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
                        <div
                            className={
                                styles.title_field
                            }
                        >

                            <label
                                className={
                                    styles.form_label
                                }
                            >
                                스터디룸 이름

                                <span
                                    className={
                                        styles.required
                                    }
                                >
                                    *
                                </span>
                            </label>


                            <input
                                type="text"
                                className={
                                    styles.form_input
                                }
                                placeholder="예: 프론트엔드 CS 지식 면접 스터디"
                                value={title}
                                onChange={
                                    e =>
                                        setTitle(
                                            e.target.value
                                        )
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* =====================
                        설명
                       ===================== */}

                    <div
                        className={
                            styles.form_group
                        }
                    >

                        <label
                            className={
                                styles.form_label
                            }
                        >
                            스터디룸 소개

                            <span
                                className={
                                    styles.required
                                }
                            >
                                *
                            </span>
                        </label>


                        <textarea
                            className={
                                styles.form_textarea
                            }
                            placeholder="스터디 목적, 목표, 규칙 등을 간단히 입력해주세요."
                            value={description}
                            onChange={
                                e =>
                                    setDescription(
                                        e.target.value
                                    )
                            }
                            rows={3}
                            required
                        />

                    </div>


                    {/* =====================
                        태그
                       ===================== */}

                    <div
                        className={
                            styles.form_group
                        }
                    >

                        <label
                            className={
                                styles.form_label
                            }
                        >
                            태그 설정
                            {' '}
                            ({tags.length}/3)
                        </label>


                        <div
                            className={
                                styles.tag_color_picker
                            }
                        >

                            <span
                                className={
                                    styles.picker_title
                                }
                            >
                                새 태그 배경색:
                            </span>


                            {PRESET_COLORS.map(
                                color => (

                                    <button
                                        key={color}
                                        type="button"
                                        className={
                                            `${styles.color_dot} ${
                                                selectedColor === color
                                                    ? styles.selected_color
                                                    : ''
                                            }`
                                        }
                                        style={{
                                            backgroundColor:
                                                color
                                        }}
                                        onClick={() =>
                                            setSelectedColor(
                                                color
                                            )
                                        }
                                    />

                                )
                            )}

                        </div>


                        <div
                            className={
                                styles.inline_input_group
                            }
                        >

                            <input
                                type="text"
                                className={
                                    styles.form_input
                                }
                                placeholder="태그명 입력 (예: React)"
                                value={tagInput}
                                disabled={
                                    tags.length >= 3
                                }
                                onChange={
                                    e =>
                                        setTagInput(
                                            e.target.value
                                        )
                                }
                                onKeyDown={
                                    e => {

                                        if (
                                            e.key ===
                                            'Enter'
                                        ) {

                                            e.preventDefault();

                                            handleAddTag();
                                        }
                                    }
                                }
                            />


                            <button
                                type="button"
                                className={
                                    `${styles.action_btn} ${styles.secondary}`
                                }
                                onClick={
                                    handleAddTag
                                }
                                disabled={
                                    tags.length >= 3
                                }
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

                            <div
                                className={
                                    styles.tag_suggestions
                                }
                            >

                                {suggestedTags.map(
                                    tag => (

                                        <button
                                            type="button"
                                            key={
                                                tag.tag_num
                                            }
                                            className={
                                                styles.tag_suggestion_item
                                            }
                                            onClick={() =>
                                                handleSelectTag(
                                                    tag
                                                )
                                            }
                                        >

                                            <span
                                                style={{
                                                    backgroundColor:
                                                        tag.tag_color
                                                }}
                                            >
                                                {
                                                    tag.tag_name
                                                }
                                            </span>

                                        </button>

                                    )
                                )}

                            </div>
                        )}


                        {/* 선택된 태그 */}

                        <div
                            className={
                                styles.tag_list
                            }
                        >

                            {tags.map(
                                (tag, index) => (

                                    <span
                                        key={
                                            tag.tag_num
                                            ??
                                            `${tag.tag_name}-${index}`
                                        }
                                        className={
                                            styles.custom_tag
                                        }
                                        style={{
                                            backgroundColor:
                                                tag.tag_color
                                        }}
                                    >

                                        {
                                            tag.tag_name
                                        }


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveTag(
                                                    index
                                                )
                                            }
                                            className={
                                                styles.remove_tag_btn
                                            }
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

                    <div
                        className={
                            styles.form_group
                        }
                    >

                        <label
                            className={
                                styles.checkbox_label
                            }
                        >

                            <input
                                type="checkbox"
                                checked={
                                    isPrivate
                                }
                                onChange={
                                    handlePrivateToggle
                                }
                            />

                            <span>
                                비공개 스터디룸으로 설정
                            </span>

                        </label>


                        {isPrivate && (

                            <div
                                className={
                                    styles.invite_code_box
                                }
                            >

                                <label className={styles.form_label_sub}>
                                    초대 코드
                                </label>

                                <div className={styles.inline_input_group}>

                                    <input
                                        type="text"
                                        className={styles.form_input}
                                        value={inviteCode}
                                        onChange={e =>setInviteCode(e.target.value)}
                                        placeholder="초대 코드를 입력하세요"
                                    />

                                    <button
                                        type="button"
                                        className={`${styles.action_btn} ${styles.secondary}`}
                                        onClick={generateRandomCode}
                                    >
                                        랜덤 생성
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* =====================
                        최대 인원
                       ===================== */}

                    <div className={styles.bottom_member_row}>
                        <label className={styles.form_label_inline}>
                            최대 인원:
                        </label>
                        <select
                            className={styles.compact_select}
                            value={maxMembers}
                            onChange={e =>
                                    setMaxMembers(Number(e.target.value))
                            }
                        >
                            <option value={5}>
                                5명
                            </option>
                            <option value={10}>
                                10명
                            </option>
                            <option value={20}>
                                20명
                            </option>
                        </select>
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
                            {submitting ? '생성 중...' : '생성하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};