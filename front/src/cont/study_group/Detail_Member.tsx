import React, { useState } from 'react';
import styles from './detail.module.css';
import { MemberData } from './GroupAPI';
import { GetGroupNum } from './GroupAPI'
import axios from 'axios';

export const Detail_Member: React.FC<GetGroupNum> = ({ groupNum }) => {
    // 샘플 멤버 데이터 (실제 연동 시 props 또는 API 데이터로 대체)
    const [members, setMembers] = useState<MemberData[]>([
        {
            memberNum: 1,
            nickname: '물리충',
            name: '진석',
            avatarUrl: 'https://picsum.photos/100?random=1',
            is_leader: 1,
        }
    ]);
    const [meLeader, setMeLeader] = useState<number>(0);


    useState(() => {
        const getMembers = async () => {
            try {
                const response = await axios.get<MemberData[]>(
                    `http://localhost/back/api/getMembers/${groupNum}`
                )
                const responseData: MemberData[] = response.data; 
                setMembers(responseData);
                setMeLeader(responseData.meLeader);
            } catch (error) {
                console.error('멤버 정보 조회 실패 :', error)
            }
        }
    }, [])

    const handleKick = (id: number, nickname: string) => {
        if (window.confirm(`${nickname} 님을 강퇴하시겠습니까?`)) {
            // 강퇴 로직 실행
            console.log(`Kick member ID: ${id}`);
        }
    };

    const handleQuit = async () => {
        if (meLeader === 1) {
            return;
        }

        await axios.delete(
            `http://localhost/back/api/detail/groupQuit/${groupNum}`
        )
    }
    
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>멤버 목록 ({members.length})</h3>
                <button
                    type="button"
                    onClick{() => handleQuit()}
                >
                    스터디룸 탈퇴
                </button>
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