import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getReportCreateUrl, isValidReportTarget, ReportTarget } from './reportTarget';
import styles from './reportButton.module.css';

export type ReportButtonProps = ReportTarget & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'
>;

/** 일반 신고는 대상 0, 커뮤니티·회원·스터디·자료 신고는 해당 식별번호를 전달합니다. */
const ReportButton: React.FC<ReportButtonProps> = ({
    type, targetNum, children = '신고하기', disabled, onClick, className, ...buttonProps
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const validTarget = isValidReportTarget(type, targetNum);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || !validTarget || disabled) return;
        const target: ReportTarget = type === 'report'
            ? { type, targetNum: 0 }
            : { type, targetNum };
        navigate(getReportCreateUrl(target), {
            state: { reportReturnTo: location.pathname + location.search + location.hash }
        });
    };

    return (
        <button {...buttonProps} className={className ?? styles.button} type="button" disabled={disabled || !validTarget} onClick={handleClick}>
            {children}
        </button>
    );
};

export default ReportButton;
