import axios from "axios";
import { DetailTab, Repeat_type, TDLStatus } from "./Type";
/* 공개 스터디룸 컴포넌트 관련 API */

/**
 * 공개 스터디룸 정보 관련 API
 */
export interface PublicStudyItem {
    id: number;
    title: string;
    description: string;
    tags: string[];
    currentMembers: number;
    maxCapacity: number;
}

/* 비공개 스터디룸 컴포넌트 관련 API */

/**
 * 비공개 스터디룸 정보 관련 API
 */
export interface PrivateStudyItem {
    id: number;
    title: string;
    description: string;
    tags: string[];
    currentMembers: number;
    maxCapacity: number;
    role: string;
}

export interface StudyRoomItem {
    group_num: number;
    group_title: string;
    group_desc: string;
    group_isPrivate: number;
    group_thumbnail: string;
}
/* 스터디룸 생성 컴포넌트 관련 API */

/**
 * 태그 관련 API !! 조만간 수정 예정
 */
export interface TagItem {
    tag_num?: number;
    tag_name: string;
    tag_color: string;
}

export interface GroupData {
    group_num?: number;
    group_title: string;
    group_desc: string;
    group_isPrivate: number;
    group_maxMembers: number;
    group_thumbnail?: string | null;
    group_invitecode?: string | null;
}

export interface GroupCreateRequest {
    group: GroupData;
    tags: TagItem[];
}

/**
 * 태그 검색
 */
export const searchGroupTags = async (
    keyword: string
): Promise<TagItem[]> => {
    const response = await axios.get<TagItem[]>(
        `http://192.168.0.11/back/api/group/tags/search`,
        {
            params: {
                keyword
            }
        }
    );
    return response.data;
};

/**
 * 스터디 그룹 생성
 */
export const createGroup = async (requestData: GroupCreateRequest,thumbnail: File | null) => {
    const formData = new FormData();

    formData.append(
        'groupData',
        new Blob(
            [JSON.stringify(requestData)],
            { type: 'application/json' }
        )
    );
    if (thumbnail) {
        formData.append('thumbnail',thumbnail);
    }
    const response = await axios.post(
        `http://192.168.0.11/back/api/group/add`,
        formData
    );
    return response.data.group_num;
};
/* 스터디룸 선택 탭 사이드바 관련 API */

/**
 * 사이드바 상태 관련 API
 */
export interface GroupSidebarProps {
    currentTab: 'public' | 'my';
    onTabChange: (tab: 'public' | 'my') => void;
    onOpenCreateModal: () => void;
    searchType: 'name' | 'tag';
    onSearchTypeChange: (type: 'name' | 'tag') => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

/* 스터디룸 상세 탭 사이드바 관련 API */

/**
 * 사이드바 상태 관련 API
 */
export interface DetailSidebarProps {
    currentTab: DetailTab;
    onTabChange: (tab: DetailTab) => void;
    mode?: 'sidebar' | 'dropdown';
}

/**
 * 사이드바 리다이렉트 관련 API
 */
export interface SidebarDirection {
    id: number;
    alias: DetailTab;
    detail: string;
}
/* Member 컴포넌트 관련 API */

/**
 * MemberData 조회 관련 API
 */
export interface MemberData {
    id: number;
    nickname: string;
    name: string;
    avatarUrl: string;
    isLeader: boolean;
}

/* Memo 컴포넌트 군 관련 API */

/**
 * MemoData 조회 관련 API
 */
export interface MemoData {
    id: number;
    writer: string;
    content: string;
    created_at: string;
    updated_at?: string;
}

/**
 * MemoData 입력 관련 API
 */
export interface MemoInsertRequest {
    group_num: number;
    member_num: number;
    memo_content: string;
}

/**
 * MemoData 수정 관련 API
 */
export interface MemoUpdateRequest {
    memo_num: number;
    memo_content: string;
}

/**
 * 해야할 일(TDL) 관련 API
 */
export interface TDLData {
    tdlid: number;
    member: string;
    name: string;
    detail: string;
    status: TDLStatus;
    repeat_type: Repeat_type;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    due_at?: string;
}