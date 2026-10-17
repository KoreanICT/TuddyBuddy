export const REPORT_TYPES = ['report', 'community', 'user', 'study', 'document'] as const;
export type ReportType = typeof REPORT_TYPES[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    report: '일반 신고',
    community: '커뮤니티 게시글',
    user: '회원',
    study: '스터디',
    document: '자료'
};

export const isReportType = (type: string): type is ReportType =>
    REPORT_TYPES.some(value => value === type);

export type ReportTarget =
    | { type: Exclude<ReportType, 'report'>; targetNum: number }
    | { type: 'report'; targetNum: 0 };

export const isValidReportTarget = (type: string, targetNum: number): boolean =>
    Number.isSafeInteger(targetNum) && (
        (isReportType(type) && type !== 'report' && targetNum > 0) ||
        (type === 'report' && targetNum === 0)
    );

export const getReportCreateUrl = (target: ReportTarget): string => {
    if (!isValidReportTarget(target.type, target.targetNum)) {
        throw new Error('신고 대상 정보가 올바르지 않습니다.');
    }
    const params = new URLSearchParams({
        type: target.type,
        target_num: String(target.targetNum)
    });
    return `/reportCreate?${params.toString()}`;
};

export const readReportTarget = (params: URLSearchParams): ReportTarget | null => {
    // 기존 /reportCreate 직접 진입은 일반 신고로 처리합니다.
    if (!params.has('type') && !params.has('target_num')) {
        return { type: 'report', targetNum: 0 };
    }
    if (params.getAll('type').length !== 1 || params.getAll('target_num').length !== 1) {
        return null;
    }
    const type = params.get('type');
    const rawTargetNum = params.get('target_num') || '';
    if (!/^\d+$/.test(rawTargetNum)) return null;
    const targetNum = Number(rawTargetNum);
    if (!type || !isReportType(type) || !isValidReportTarget(type, targetNum)) return null;
    if (type === 'report') return { type, targetNum: 0 };
    return { type, targetNum };
};
