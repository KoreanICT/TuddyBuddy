export type ReportTarget =
    | { type: 'community'; targetNum: number }
    | { type: 'report'; targetNum: 0 };

export const isValidReportTarget = (type: string, targetNum: number): boolean =>
    Number.isSafeInteger(targetNum) && (
        (type === 'community' && targetNum > 0) ||
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
    if (type === 'report' && targetNum === 0) return { type, targetNum: 0 };
    if (type === 'community' && isValidReportTarget(type, targetNum)) {
        return { type, targetNum };
    }
    return null;
};
