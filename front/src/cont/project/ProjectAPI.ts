import { ProjectTab, TDLStatus } from "../study_group/Type";

export interface TabbarDirection {
    id: number;
    alias: ProjectTab;
    detail: string;
}

export interface TDLData {
    tdlid: number,
    groupid: number,
    stepid: number,
    creator: string,
    appointee: string,
    title: string,
    detail: string,
    status: TDLStatus,
    created_at: string,
    completed_at?: string,
    started_at: string,
    expired_at: string,
    updated_at?: string
}
