import { DetailTab } from "./Type";

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

/* 스터디룸 생성 컴포넌트 관련 API */

/**
 * 스터디룸 생성 모달 관련 API
 */
export interface GroupCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: (data: any) => void;
}

/**
 * 태그 관련 API !! 조만간 수정 예정
 */
export interface TagItem {
    id: string;
    text: string;
    color: string;
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