import React, { useEffect, useRef, useState } from 'react'
import styles from './detail.module.css';

interface GroupEditProps {
    groupNum: number;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export const Group_EditModal: React.FC<GroupEditProps> = ({ groupNum, isOpen, onClose, onUpdated }) => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_container} onClick={(e) => e.stopPropagation}>
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

                <form className={styles.create_form}>
                    {/* 수정 필드 */}
                </form>
            </div>
        </div>
    )
}
