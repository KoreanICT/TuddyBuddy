import api from './api';
//작성자 : 오진석
import React, { useEffect, useState } from 'react';
import styles from './group.module.css';
import { TagItem } from './GroupAPI';
import { NavLink } from 'react-router-dom';
import { getFirstLetter } from './GroupAPI';
interface GroupPublicProps {
    mode: 'my' | 'public';
    searchType: 'name' | 'tag';
    searchTerm: string;
    onEnterGroup: (groupNum: number) => void;
}

export interface GroupListItem {
    group_num: number;
    group_title: string;
    group_desc: string;

    group_isPrivate: number;
    group_maxMembers: number;

    group_thumbnail: string | null;
    group_invitecode: string | null;

    created_at: string;

    current_members: number;

    // 내 스터디룸에서 사용
    is_leader?: number;

    tags: TagItem[];
}

export interface PublicGroupListItem {
    group_num: number;
    group_title: string;
    group_desc: string;

    group_maxMembers: number;
    group_thumbnail: string | null;

    created_at: string;

    current_members: number;

    tags: TagItem[];
}

export const Group_List: React.FC<GroupPublicProps> = ({ mode, searchType, searchTerm, onEnterGroup }) => {
    const [groups, setGroups] = useState<GroupListItem[]>([]);
    const [mygroups, setMygroups] = useState<GroupListItem[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const loadGroups = async () => {

            if (mode === 'my') {
                try {
                    setLoading(true);
                    const data = await getMyGroups();
                    setMygroups(data);
                } catch (error) {
                    console.error('스터디룸 조회 실패', error)
                } finally {
                    setLoading(false);
                }
            } else if (mode === 'public') {
                try {
                    setLoading(true);
                    const data = await getPublicGroups();
                    setGroups(data);
                } catch (error) {
                    console.error('스터디룸 조회 실패', error)
                } finally {
                    setLoading(false);
                }
            };
        }
        loadGroups();
    }, [mode]);

    const currentList = Array.isArray(mode === 'my' ? mygroups : groups)
        ? (mode === 'my' ? mygroups : groups)
        : [];

    const filteredGroups = currentList.filter(group => {
        if (!searchTerm.trim()) {
            return true;
        }
        const keyword = searchTerm.toLowerCase();
        if (searchType === 'name') {
            return group.group_title?.toLowerCase().includes(keyword);
        }

        return group.tags?.some(tag => tag.tag_name?.toLowerCase().includes(keyword));
    });

    // 내 스터디룸
    const getMyGroups = async (): Promise<GroupListItem[]> => {
        const response = await api.get(
            `/group/getmyrooms`
        );

        return response.data;
    };
    // 공개 스터디룸
    const getPublicGroups = async (): Promise<GroupListItem[]> => {
        const response = await api.get(
            `/group/getpublicrooms`
        );

        return response.data;
    };

    return (
        <section className={styles.study_main_content}>

            <div className={styles.study_list_wrapper}>
                {loading ? (
                    <div>
                        스터디룸을 불러오는 중입니다.
                    </div>
                ) : filteredGroups.length > 0 ? (
                    filteredGroups.map(group => {
                        const isFull = group.current_members >= group.group_maxMembers;
                        return (
                            <div key={group.group_num} className={styles.study_card}>
                                <div className={styles.study_card_header}>
                                    <div className={styles.study_thumbnail}>
                                        {group.group_thumbnail ? (
                                            <img src={`http://localhost/back/api/group/thumbnail/` + encodeURIComponent(group.group_thumbnail)} alt="" className={styles.study_thumbnail_img} />
                                        ) : (
                                            <span>
                                                {getFirstLetter(group.group_title)}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.study_card_text}>
                                        <h3 className={styles.study_card_title}>{group.group_title}</h3>
                                        <p className={styles.study_card_desc}>{group.group_desc}</p>
                                    </div>

                                    {mode === 'my' && (
                                        <span className={`${styles.study_badge} ${styles.my_role}`}>
                                            {group.is_leader === 1 ? '방장' : '멤버'}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.study_card_divider} />

                                <div className={styles.study_card_footer}>
                                    <div className={styles.study_tags}>
                                        {group.tags.map(tag => (
                                            <span key={tag.tag_num ?? tag.tag_name} className={styles.study_tag} style={{ backgroundColor: tag.tag_color }}>
                                                {tag.tag_name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.study_card_info}>
                                        <span className={styles.study_capacity}>
                                            인원:{' '} {group.current_members} {' / '}{group.group_maxMembers}명
                                        </span>
                                        {mode === 'my' ? (
                                            <NavLink
                                                to={`/group/detail/${group.group_num}`}
                                                className={`${styles.study_action_btn} ${styles.primary}`}
                                            >
                                                입장하기
                                            </NavLink>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={isFull}
                                                className={`${styles.study_action_btn} ${isFull ? styles.disabled : styles.primary}`}
                                            >
                                                {isFull ? '정원 초과' : '참여하기'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.study_empty_card}>
                        조회된 스터디룸이 없습니다.
                    </div>
                )}
            </div>
        </section>
    );
};
