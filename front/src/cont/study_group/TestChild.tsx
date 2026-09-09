import React, { useState, useMemo } from 'react';
import { DynamicIcon, iconNames } from 'lucide-react/dynamic';

interface IconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIcon: string | null;
    onSelectIcon: (name: string) => void;
}

export const IconPickerModal = ({ isOpen, onClose, selectedIcon, onSelectIcon }: IconPickerModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    // 공식 이름 목록 배열에서 검색어 필터링
    const filteredIcons = useMemo(() => {
        return iconNames.filter((name) =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    if (!isOpen) return null;

    return (
        // 모달 전체 배경
        <div style={styles.overlay} onClick={onClose}>
            {/* 모달 박스 (크기를 이미지에 맞춰 컴팩트하게 줄임) */}
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                {/* 헤더 구역 */}
                <div style={styles.modalHeader}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#333' }}>아이콘</h4>
                    <button onClick={onClose} style={styles.closeButton}>제거</button>
                </div>

                {/* 검색 필드 */}
                <input
                    type="text"
                    placeholder="필터"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />

                {/* 촘촘한 아이콘 그리드 목록 (스크롤바 포함) */}
                <div style={styles.gridContainer} className="icon-picker-scroll">
                    {filteredIcons.map((name) => {
                        const isSelected = selectedIcon === name;

                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    onSelectIcon(name);
                                    onClose(); 
                                }}
                                title={name} // 마우스를 올렸을 때만 툴팁으로 이름 표시
                                style={{
                                    ...styles.iconButton,
                                    backgroundColor: isSelected ? '#efefef' : 'transparent',
                                    borderRadius: isSelected ? '6px' : '0px',
                                }}
                            >
                                {/* 아이콘 크기를 살짝 줄이고 회색 톤으로 배치 */}
                                <DynamicIcon 
                                    name={name as any} 
                                    size={20} 
                                    color={isSelected ? '#111' : '#555'} 
                                />
                            </button>
                        );
                    })}

                    {filteredIcons.length === 0 && (
                        <p style={styles.noResult}>결과 없음</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// 이미지 레이아웃에 맞춰 전면 수정된 인라인 스타일
const styles = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // 딤드를 연하게 변경
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        background: '#fff',
        borderRadius: '12px',
        padding: '16px',
        width: '340px', // [수정] 모달의 크기를 더 컴팩트하게 줄임
        height: '420px', // 고정 높이 지정
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '13px',
        cursor: 'pointer',
        color: '#9ca3af',
    },
    searchInput: {
        width: '100%',
        padding: '8px 12px',
        marginBottom: '14px',
        borderRadius: '8px',
        border: '1px solid #0284c7', // 이미지처럼 활성화된 느낌의 파란 테두리 적용
        boxSizing: 'border-box' as const,
        outline: 'none',
        fontSize: '14px',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 1fr)', // [수정] 한 줄에 9개씩 배치하여 촘촘하게 구성
        gap: '4px', // 여백 최소화
        overflowY: 'auto' as const,
        flex: 1,
        paddingRight: '2px',
    },
    iconButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '1', // 정사각형 유지
        padding: '4px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
    },
    noResult: {
        gridColumn: 'span 9',
        textAlign: 'center' as const,
        color: '#9ca3af',
        fontSize: '13px',
        padding: '20px 0',
    },
};