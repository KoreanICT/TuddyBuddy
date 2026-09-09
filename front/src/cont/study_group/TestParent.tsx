import React, { useState } from 'react';
import { IconPickerModal } from './TestChild';
// [핵심] 부모 컴포넌트에서도 동적 컴포넌트를 사용합니다. 기본 Plus 아이콘도 같이 가져옵니다.
import { DynamicIcon } from 'lucide-react/dynamic';
import { Plus } from 'lucide-react';

export default function TestParent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 상태값은 대문자 아이콘 명이 아니라, 소문자 케밥 케이스(예: 'smile', 'home')를 기본으로 사용합니다.
    const [selectedIcon, setSelectedIcon] = useState<string | null>('smile');

    return (
        <div style={{ padding: '4px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>카테고리 생성</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                <div
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        width: '64px',
                        height: '64px',
                        border: '2px dashed #d1d5db',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f9fafb'
                    }}
                >
                    {/* [해결] 선택된 문자열이 있으면 DynamicIcon으로 렌더링, 없으면 플러스 아이콘 */}
                    {selectedIcon ? (
                        <DynamicIcon name={selectedIcon as any} size={32} />
                    ) : (
                        <Plus size={32} />
                    )}
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                    >
                        아이콘 선택하기
                    </button>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        선택된 아이콘: {selectedIcon || '없음'}
                    </p>
                </div>
            </div>

            <IconPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedIcon={selectedIcon}
                onSelectIcon={setSelectedIcon}
            />
        </div>
    );
}