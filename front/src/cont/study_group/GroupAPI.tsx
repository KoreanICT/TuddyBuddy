import axios from "axios";
import { AppEdge, AppNode, DetailTab, Repeat_type, TDLStatus } from "./Type";
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
 * 태그 관련 API 
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



/**
 * 태그 검색
 */
export const searchGroupTags = async (
    keyword: string
): Promise<TagItem[]> => {
    const response = await axios.get<TagItem[]>(
        `http://localhost/back/api/group/tags/search`,
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
export const createGroup = async (requestData: GroupCreateRequest, thumbnail: File | null) => {
    const formData = new FormData();

    formData.append(
        'groupData',
        new Blob(
            [JSON.stringify(requestData)],
            { type: 'application/json' }
        )
    );
    if (thumbnail) {
        formData.append('thumbnail', thumbnail);
    }
    const response = await axios.post(
        `http://localhost/back/api/group/add`,
        formData
    );
    return response.data.group_num;
};
export interface GroupCreateRequest {
    group: GroupData;
    tags: TagItem[];
}

/**
 * 스터디 그룹 변경
 */

export const patchGroup = async (groupNum: number, requestData: GroupUpdateRequest, thumbnail: File | null) => {
    const formData = new FormData();
    formData.append(
        'groupData',
        new Blob(
            [JSON.stringify(requestData)],
            { type: 'application/json' }
        )
    );
    if (thumbnail) {
        formData.append('thumbnail', thumbnail);
    }
    const response = await axios.patch(
        `http://localhost/back/api/group/detail/patchGroup/${groupNum}`,
        formData
    );
    return response.data;
};
export interface GroupUpdateRequest {
    group_title: string;
    group_desc: string;
    group_thumbnail: string | null;
    tags: TagItem[];
}
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
    onOpenInviteModal: () => void;
}
/**
 * 초대코드 모달 관련 API
 */

export const joinGroupByInviteCode = async (
    inviteCode: string
) => {
    const response = await axios.post(
        `http://localhost/back/api/group/join/invite`,
        {
            inviteCode
        }
    );
    return response.data;
};
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

/**
 * 문자열 첫 글자 가져오기 관련 API
 */
export const getFirstLetter = (title: string) => {
    const trimmed = title.trim();

    return Array.from(trimmed)[0] ?? '?';
}
/**
 * groupNum 조회 관련 API
 */
export interface GetGroupNum {
    groupNum: number;
}

/**
 * grouNum 및 is_leader 조회 관련 API
 */
export interface GetIsleaderandGroupNum {
    groupNum: number;
    isLeader: boolean;
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

/**
 * 다이어그램 관련 API
 */
export interface CustomNodeData extends Record<string, unknown> {
    label: string;
}
export interface DiagramData {
    nodes: AppNode[];
    edges: AppEdge[];
}
export interface DiagramSaveRequest {
    groupnum: number;
    title: string;
    diagram_data: string;
}
export interface DiagramResponse {
    group_num: number;
    title: string;
    diagram_data: string;
    created_at: string;
    updated_at?: string;
}
export const getDiagram = async (
    groupNum: number
): Promise<DiagramResponse | null> => {

    const response = await axios.get<DiagramResponse | null>(
        `http://localhost/back/api/detail/diagram/${groupNum}`
    );

    return response.data;
};

/**
 * 참조 문서 관련 API
 */
export const formatFileSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
};

/**
 * 날짜 포맷 관련 API
 * yyyy-MM-dd
 */
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};