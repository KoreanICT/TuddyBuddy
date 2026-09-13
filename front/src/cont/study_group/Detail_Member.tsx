import React from 'react';
import styles from './detail.module.css';

interface Member {
    id: number;
    nickname: string;
    name: string;
    avatarUrl: string;
    isLeader: boolean;
}

export const Detail_Member: React.FC = () => {
    // 샘플 멤버 데이터 (실제 연동 시 props 또는 API 데이터로 대체)
    const members: Member[] = [
        {
            id: 1,
            nickname: '자칭물리충',
            name: '오진석',
            avatarUrl: 'https://picsum.photos/100?random=1',
            isLeader: true,
        },
        {
            id: 2,
            nickname: 'ai화된인간',
            name: '김진규',
            avatarUrl: 'https://picsum.photos/100?random=2',
            isLeader: false,
        },
        {
            id: 3,
            nickname: '통계장인승표',
            name: '허승표',
            avatarUrl: 'https://picsum.photos/100?random=3',
            isLeader: false,
        },
        {
            id: 4,
            nickname: '죽순먹는판다',
            name: '주용현',
            avatarUrl: 'https://picsum.photos/100?random=4',
            isLeader: false,
        },
    ];

    const handleKick = (id: number, nickname: string) => {
        if (window.confirm(`${nickname} 님을 강퇴하시겠습니까?`)) {
            // 강퇴 로직 실행
            console.log(`Kick member ID: ${id}`);
        }
    };

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>멤버 목록 ({members.length})</h3>
                
                {/* 멤버 카드 횡방향 목록 컨테이너 */}
                <div className={styles.member_grid}>
                    {members.map((member) => (
                        <div key={member.id} className={styles.member_card}>
                            {/* 우상단 강퇴 버튼 (x) */}
                            {!member.isLeader && (
                                <button
                                    type="button"
                                    className={styles.kick_btn}
                                    onClick={() => handleKick(member.id, member.nickname)}
                                    title="강퇴하기"
                                    aria-label="강퇴"
                                >
                                    ✕
                                </button>
                            )}

                            {/* 동그란 썸네일 */}
                            <div className={styles.avatar_wrapper}>
                                <img
                                    src={member.avatarUrl}
                                    alt={member.nickname}
                                    className={styles.avatar_img}
                                />
                            </div>

                            {/* 닉네임 및 이름 */}
                            <div className={styles.member_info}>
                                <span className={styles.member_nickname}>{member.nickname}</span>
                                <span className={styles.member_name}>({member.name})</span>
                            </div>

                            {/* 방장 라벨 */}
                            {member.isLeader && (
                                <span className={styles.leader_badge}>방장</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};