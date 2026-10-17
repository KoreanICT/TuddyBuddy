import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportCreateUrl, isValidReportTarget, ReportTarget } from './reportTarget';

export type ReportButtonProps = ReportTarget & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'
>;

/** 부모 화면은 대상 정보만 전달하고, 신고 페이지 이동은 이 버튼이 담당합니다. */
const ReportButton: React.FC<ReportButtonProps> = ({
    type, targetNum, children = '신고하기', disabled, onClick, ...buttonProps
}) => {
    const navigate = useNavigate();
    const validTarget = isValidReportTarget(type, targetNum);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || !validTarget || disabled) return;
        const target: ReportTarget = type === 'report'
            ? { type, targetNum: 0 }
            : { type, targetNum };
        navigate(getReportCreateUrl(target));
    };

    return (
        <button {...buttonProps} type="button" disabled={disabled || !validTarget} onClick={handleClick}>
            {children}
        </button>
    );
};

export default ReportButton;
