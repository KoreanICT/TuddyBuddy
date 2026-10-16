//작성자 : 오진석
import React, { useEffect, useState } from 'react';
import styles from './detail.module.css';
import { GetGroupNum } from './GroupAPI'
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

interface MemberData {
    member_num: number;
    member_nick: string;
    member_name: string;
    is_leader: number;
}

interface MemberRequestData {
    members: MemberData[];
    isMeLeader: boolean;
}

export const Detail_Member: React.FC<GetGroupNum> = ({ groupNum }) => {
    const [members, setMembers] = useState<MemberData[]>([]);
    const [isMeLeader, setIsMeLeader] = useState(false);

    const getMembers = async () => {
        try {
            const response = await axios.get(
                `http://localhost/back/api/group/detail/getMemberlist/${groupNum}`
            )
            const responseData: MemberRequestData = response.data;
            setIsMeLeader(response.data.isMeLeader);
            setMembers(responseData.members);
        } catch (error) {
            console.error('멤버 정보 조회 실패 :', error)
        }
    }

    useEffect(() => {
        getMembers();
    }, [groupNum])

    const navigate = useNavigate();

    const canLeaderQuit = isMeLeader && members.length === 1;
    const canNormalMemberQuit = !isMeLeader;
    const canQuit = canLeaderQuit || canNormalMemberQuit;

    const handleKick = async (memberNum: number, nickname: string) => {
        if (window.confirm(`${nickname} 님을 강퇴하시겠습니까?`)) {
            try {
                await axios.delete(
                    `http://localhost/back/api/group/detail/kickMember/${groupNum}/${memberNum}`
                )
            } catch (error) {
                console.error("강퇴하는데 실패했습니다. ", error);
            }
            console.log(`Kick member ID: ${memberNum}`);
        }
        await getMembers();
    };

    const handleQuit = async () => {
        if (isMeLeader) {
            if (!canQuit) {
                return;
            }
            const firstConfirm = window.confirm("지금 탈퇴하시면 이 스터디룸의 데이터는 모두 삭제됩니다. 정말 탈퇴하시겠습니까?");
            if (!firstConfirm) {
                return;
            }
            const secondConfirm = window.confirm("정말로 탈퇴하시겠습니까?");
            if (!secondConfirm) {
                return;
            }
            try {
                await axios.delete(
                    `http://localhost/back/api/group/detail/deleteGroup/${groupNum}`
                )
                navigate("/group");
            } catch (error) {
                console.error("탈퇴하는데 실패했습니다.")
            }
            return;
        }
        const confirmed = window.confirm("정말로 이 스터디룸을 탈퇴하시겠습니까?");
        if (!confirmed) {
            return;
        }
        try {
            await axios.delete(
                `http://localhost/back/api/group/detail/groupQuit/${groupNum}`
            )
        } catch (error) {
            console.error("탈퇴하는데 실패했습니다. 잠시후 다시 시도해주세요.");
        }
    }

    const handleTransferLeader = async (memberNum: number, member_nick: string) => {
        if (window.confirm(`${member_nick}님에게 방장을 위임하시겠습니까?`)) {
            try {
                await axios.patch(
                    `http://localhost/back/api/group/detail/transferLeader/${groupNum}/${memberNum}`
                )
            } catch (error) {
                console.error("위임에 오류가 생겼습니다.", error);
            }
        }
        await getMembers();
    }

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>멤버 목록 ({members.length})</h3>
                <button
                    type="button"
                    className={styles.transferbtn}
                    disabled={!canQuit}
                    onClick={handleQuit}
                >
                    스터디룸 탈퇴
                </button>
                {/* 멤버 카드 횡방향 목록 컨테이너 */}
                <div className={styles.member_grid}>
                    {members.map((member) => (
                        <div key={member.member_num} className={styles.member_card}>
                            {/* 우상단 강퇴 버튼 (x) */}
                            {isMeLeader && member.is_leader !== 1 && (
                                <>
                                    <button
                                        type="button"
                                        className={styles.kick_btn}
                                        onClick={() => handleKick(member.member_num, member.member_nick)}
                                        title="강퇴하기"
                                        aria-label="강퇴"
                                    >
                                        ✕
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTransferLeader(member.member_num, member.member_nick)}
                                    >
                                        방장 위임
                                    </button>
                                </>
                            )}

                            {/* 동그란 썸네일 */}
                            <div className={styles.avatar_wrapper}>
                                <img
                                    src={`https://picsum.photos/100?random=${member.member_num}`}
                                    alt={member.member_nick}
                                    className={styles.avatar_img}
                                />
                            </div>

                            {/* 닉네임 및 이름 */}
                            <div className={styles.member_info}>
                                <span className={styles.member_nickname}>{member.member_nick}</span>
                                <span className={styles.member_name}>({member.member_name})</span>
                            </div>

                            {/* 방장 라벨 */}
                            {member.is_leader === 1 && (
                                <span className={styles.leader_badge}>방장</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};