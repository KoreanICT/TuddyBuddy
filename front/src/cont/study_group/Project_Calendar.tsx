// 작성자 : 오진석
import React, { useEffect, useMemo, useState } from "react";
import styles from "./project.module.css";
//import { useAuth } from "../../hooks/useAuth"
import { GetGroupNum, TDLData, formatDate } from './GroupAPI'
import api from "./api";

interface ScheduleData {
    schedule_num: number;
    group_num: number;
    member_num: number;
    schedule_name: string;
    schedule_date: string;
    schedule_detail?: string;
    created_at: string;
    updated_at?: string;
    start_at?: string;
    end_at: string;
    can_manage: number;
}

interface ScheduleRequest {
    group_num: number;
    schedule_name: string;
    schedule_date: string;
    schedule_detail?: string;
    start_at?: string;
    end_at?: string;
}

interface SchedulePatchRequest {
    schedule_num: number;
    schedule_name: string;
    schedule_date: string;
    schedule_detail?: string;
    start_at?: string;
    end_at?: string;
}

export const Project_Calendar: React.FC<GetGroupNum> = ({ groupNum }) => {

    const today = new Date();
    const [editingScheduleNum, setEditingScheduleNum] = useState<number | null>(null);
    /*
     * 현재 달력에서 보고 있는 년 / 월
     */
    const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
    /*
     * 사용자가 선택한 날짜
     */
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));

    const [schedules, setSchedules] = useState<ScheduleData[]>([]);
    const [tdls, setTdls] = useState<TDLData[]>([]);
    /*
     * 일정 등록 Modal
     */
    const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
    /*
     * 일정 상세 Modal
     */
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    /*
     * 일정 등록 입력값
     */
    const [scheduleName, setScheduleName] = useState<string>("");
    const [scheduleDetail, setScheduleDetail] = useState<string>("");
    const [startAt, setStartAt] = useState<string>("");
    const [endAt, setEndAt] = useState<string>("");

    /*
     * 현재 달력 년 / 월
     */
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    /*
     * 이번 달 첫 날짜
     */
    const firstDay = new Date(year, month, 1);
    /*
     * 이번 달 마지막 날짜
     */
    const lastDay = new Date(year, month + 1, 0);
    /*
     * 이번 달 총 일수
     */
    const totalDays = lastDay.getDate();
    /*
     * 이번 달 1일의 요일
     */
    const startDayOfWeek = firstDay.getDay();

    
    const loadData = async () => {

        try {
            const response = await api.get(
                `/detail/schedule/getEvents/${groupNum}`
            )
            if (!response) {
                return;
            }
            setSchedules(response.data.schedules)
            setTdls(response.data.tdls);

        } catch (error) {

        }
    }

    useEffect(() => {
        loadData();
    }, [groupNum])

    /**
     * 날짜 셀 배열 생성
     */
    
    const calendarDays = useMemo(() => {
        const days: Array<number | null> = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= totalDays; day++) {
            days.push(day);
        }

        while (days.length % 7 !== 0) {
            days.push(null);
        }
        return days;
    }, [year, month]);

    const movePrevMonth = () => {
        setCurrentDate(
            new Date(year, month - 1, 1)
        );
    };

    const moveNextMonth = () => {
        setCurrentDate(
            new Date(year, month + 1, 1)
        );
    };

    const moveToday = () => {
        const now = new Date();

        setCurrentDate(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            )
        );
        setSelectedDate(formatDate(now));
    };

    /**
     * 특정 날짜 문자열 생성
     */
    const createDateString = (
        day: number
    ): string => {
        return formatDate(
            new Date(year, month, day)
        );
    };

    /**
     * 날짜 클릭
     */
    const handleDateClick = (
        day: number
    ) => {
        const date = createDateString(day);

        setSelectedDate(date);
        setIsDetailOpen(true);
    };

    /**
     * 일정 등록 버튼
     */
    const handleOpenRegister = () => {

        setEditingScheduleNum(null);

        setScheduleName("");
        setScheduleDetail("");
        setStartAt("");
        setEndAt("");

        setIsRegisterOpen(true);
    };

    const handleOpenUpdate = (schedule: ScheduleData) => {
        setEditingScheduleNum(schedule.schedule_num);
        setScheduleName(schedule.schedule_name);
        setScheduleDetail(schedule.schedule_detail ?? "");
        setSelectedDate(schedule.schedule_date.substring(0, 10));
        setStartAt(schedule.start_at ?.split("T")[1] ?.substring(0, 5) ?? "");
        setEndAt(schedule.end_at ?.split("T")[1] ?.substring(0, 5) ?? "");

        setIsDetailOpen(false);
        setIsRegisterOpen(true);
    };

    const handleRegisterSchedule = async () => {

        if (!selectedDate) {
            alert("날짜를 선택해주세요.");
            return;
        }

        if (!scheduleName.trim()) {
            alert("일정 이름을 입력해주세요.");
            return;
        }

        const newSchedule: ScheduleRequest = {
            group_num: groupNum,
            schedule_name: scheduleName,
            schedule_date: selectedDate,
            schedule_detail: scheduleDetail,
            start_at:
                startAt === ""
                    ? undefined
                    : `${selectedDate}T${startAt}`,

            end_at:
                endAt === ""
                    ? undefined
                    : `${selectedDate}T${endAt}`,
        };

        try {
            await api.post(
                `/detail/schedule/addSchedule/${groupNum}`,
                newSchedule
            )
            alert("등록 성공.");
            await loadData();
        } catch (error) {
            console.log('등록 실패', error);
            alert("등록에 실패하였습니다.");
        }
        setIsRegisterOpen(false); 
    };

    /**
     * 일정 삭제
     *
     * 본인의 일정만 삭제 가능
     */
    const handleDeleteSchedule = async (scheduleNum: number) => {

        if (window.confirm("해당 일정을 삭제하시겠습니까?")) {
            try {
                await api.delete(
                    `/detail/schedule/deleteSchedule/${scheduleNum}`
                )
                alert("삭제 완료.");
                setIsDetailOpen(false);
                loadData();
            } catch (error) {
                console.error("삭제 실패.", error);
            }
        }
    };

    const handleUpdateSchedule = async () => {
        if(editingScheduleNum === null) {
            return;
        }

        if (!selectedDate) {
            alert("날짜를 선택해주세요.");
            return;
        }

        if (!scheduleName.trim()) {
            alert("일정 이름을 입력해주세요.");
            return;
        }

        const updateSchedule: SchedulePatchRequest = {
            schedule_num: editingScheduleNum,
            schedule_name: scheduleName,
            schedule_date: selectedDate,
            schedule_detail: scheduleDetail,
            start_at:
                startAt === ""
                    ? undefined
                    : `${selectedDate}T${startAt}`,

            end_at:
                endAt === ""
                    ? undefined
                    : `${selectedDate}T${endAt}`,
        };

        try {
            await api.patch(
                `/detail/schedule/updateSchedule/${editingScheduleNum}`,
                updateSchedule
            )
            alert("수정 성공.");

            setIsRegisterOpen(false);
            setEditingScheduleNum(null);
            await loadData();
        } catch (error) {
            console.log('수정 실패', error);
            alert("수정에 실패하였습니다.");
        }

        setIsRegisterOpen(false);
        loadData();
    }
    /**
     * 특정 날짜 일정 검색
     */
    const getSchedulesByDate = (
        date: string
    ) => {
        return schedules.filter((schedule) => schedule.schedule_date?.substring(0, 10) === date);
    };

    /**
     * 특정 날짜 TDL 검색
     */
    const getTdlsByDate = (date: string) => {
        return tdls.filter((tdl) => tdl.due_at?.substring(0, 10) === date);
    };

    /*
     * 선택한 날짜 데이터
     */
    const selectedSchedules = getSchedulesByDate(selectedDate);
    const selectedTdls = getTdlsByDate(selectedDate);

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>일정 관리</h3>
                <p className={styles.section_desc}>
                    멤버들의 개인 일정과 해야할 일(To Do List)을 확인하는 곳입니다.
                </p>
                <div className={styles.calendarContainer}>
                    {/* ============================= */}
                    {/* 달력 Header */}
                    {/* ============================= */}

                    <div className={styles.calendarHeader}>
                        <div
                            className={
                                styles.calendarNavigation
                            }
                        >
                            <button
                                type="button"
                                className={styles.navButton}
                                onClick={movePrevMonth}
                            >
                                ‹
                            </button>

                            <h2>
                                {year}년 {month + 1}월
                            </h2>

                            <button
                                type="button"
                                className={styles.navButton}
                                onClick={moveNextMonth}
                            >
                                ›
                            </button>
                        </div>

                        <div className={styles.headerButtons}>
                            <button
                                type="button"
                                className={styles.todayButton}
                                onClick={moveToday}
                            >
                                Today
                            </button>

                            <button
                                type="button"
                                className={
                                    styles.registerButton
                                }
                                onClick={handleOpenRegister}
                            >
                                일정 등록
                            </button>
                        </div>
                    </div>

                    {/* ============================= */}
                    {/* 요일 */}
                    {/* ============================= */}

                    <div className={styles.weekHeader}>
                        <div className={styles.sunday}>
                            일
                        </div>

                        <div>월</div>
                        <div>화</div>
                        <div>수</div>
                        <div>목</div>
                        <div>금</div>

                        <div className={styles.saturday}>
                            토
                        </div>
                    </div>

                    {/* ============================= */}
                    {/* 실제 달력 */}
                    {/* ============================= */}

                    <div className={styles.calendarGrid}>
                        {calendarDays.map(
                            (day, index) => {
                                if (day === null) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className={
                                                styles.emptyCell
                                            }
                                        />
                                    );
                                }

                                const date = createDateString(day);

                                const daySchedules = getSchedulesByDate(date);

                                const dayTdls = getTdlsByDate(date);

                                const isToday = date === formatDate(today);

                                const dayOfWeek = index % 7;

                                return (
                                    <button
                                        type="button"
                                        key={date}
                                        className={`${styles.dayCell} ${isToday
                                            ? styles.today
                                            : ""
                                            }`}
                                        onClick={() =>
                                            handleDateClick(day)
                                        }
                                    >
                                        <div
                                            className={
                                                styles.dayNumber
                                            }
                                        >
                                            <span
                                                className={
                                                    dayOfWeek === 0
                                                        ? styles.sunday
                                                        : dayOfWeek === 6
                                                            ? styles.saturday
                                                            : ""
                                                }
                                            >
                                                {day}
                                            </span>
                                        </div>

                                        <div
                                            className={
                                                styles.eventList
                                            }
                                        >
                                            {daySchedules
                                                .slice(0, 2)
                                                .map((schedule) => (
                                                    <div
                                                        key={
                                                            schedule.schedule_num
                                                        }
                                                        className={
                                                            styles.scheduleItem
                                                        }
                                                    >
                                                        {
                                                            schedule.schedule_name
                                                        }
                                                    </div>
                                                ))}

                                            {dayTdls
                                                .slice(0, 2)
                                                .map((tdls) => (
                                                    <div
                                                        key={tdls.tdl_num}
                                                        className={
                                                            styles.tdlItem
                                                        }
                                                    >
                                                        ✓ {tdls.tdl_name}
                                                    </div>
                                                ))}

                                            {daySchedules.length +
                                                dayTdls.length > 4 && (
                                                    <div className={styles.moreItem}>
                                                        +
                                                        {daySchedules.length +
                                                            dayTdls.length -
                                                            4}
                                                        개
                                                    </div>
                                                )}
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>

                    {/* ============================= */}
                    {/* 날짜 상세 Modal */}
                    {/* ============================= */}

                    {isDetailOpen && (
                        <div
                            className={styles.modalOverlay}
                            onClick={() =>
                                setIsDetailOpen(false)
                            }
                        >
                            <div
                                className={styles.modal}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >
                                <div
                                    className={styles.modalHeader}
                                >
                                    <h3>{selectedDate}</h3>

                                    <button
                                        type="button"
                                        className={styles.closeButton}
                                        onClick={() => setIsDetailOpen(false)}
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* 일반 일정 */}

                                <section className={styles.scheduleSection} >
                                    <div className={styles.sectionTitle}>
                                        <h4>일정</h4>

                                        <button
                                            type="button"
                                            className={
                                                styles.smallAddButton
                                            }
                                            onClick={() => {
                                                setIsDetailOpen(false);
                                                handleOpenRegister();
                                            }}
                                        >
                                            + 등록
                                        </button>
                                    </div>

                                    {selectedSchedules.length ===
                                        0 ? (
                                        <p className={styles.emptyMessage}>
                                            등록된 일정이 없습니다.
                                        </p>
                                    ) : (
                                        selectedSchedules.map(
                                            (schedule) => (
                                                <div
                                                    key={schedule.schedule_num}
                                                    className={styles.detailItem}
                                                >
                                                    <div>
                                                        <strong>
                                                            {schedule.schedule_name}
                                                        </strong>

                                                        {schedule.schedule_detail && (
                                                            <p>
                                                                {
                                                                    schedule.schedule_detail
                                                                }
                                                            </p>
                                                        )}

                                                        {(schedule.start_at ||
                                                            schedule.end_at) && (
                                                                <span
                                                                    className={
                                                                        styles.timeText
                                                                    }
                                                                >
                                                                    {schedule.start_at
                                                                        ?.split("T")[1]
                                                                        ?.substring(
                                                                            0,
                                                                            5
                                                                        )}

                                                                    {schedule.end_at &&
                                                                        " ~ "}

                                                                    {schedule.end_at
                                                                        ?.split("T")[1]
                                                                        ?.substring(
                                                                            0,
                                                                            5
                                                                        )}
                                                                </span>
                                                            )}
                                                    </div>

                                                    {/* can_manage 조회하여 수정 및 삭제 버튼 구현*/}
                                                    {schedule.can_manage === 1 && (
                                                        <div className={styles.scheduleActions}>
                                                            <button
                                                                type="button"
                                                                className={styles.updateButton}
                                                                onClick={() => handleOpenUpdate(schedule)}
                                                            >
                                                                수정
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={styles.deleteButton}
                                                                onClick={() => handleDeleteSchedule(schedule.schedule_num)}
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )
                                    )}
                                </section>

                                {/* TDL */}
                                <section className={styles.scheduleSection}>
                                    <h4>To Do List 마감</h4>

                                    {selectedTdls.length === 0 ? (
                                        <p className={styles.emptyMessage}>
                                            마감 예정인 To Do List가
                                            없습니다.
                                        </p>
                                    ) : (
                                        selectedTdls.map(
                                            (tdls) => (
                                                <div
                                                    key={tdls.tdl_num}
                                                    className={styles.detailTdlItem}
                                                >
                                                    <span>✓</span>

                                                    <span>{tdls.tdl_name}</span>
                                                </div>
                                            )
                                        )
                                    )}
                                </section>
                            </div>
                        </div>
                    )}

                    {/* ============================= */}
                    {/* 일정 등록 Modal */}
                    {/* ============================= */}

                    {isRegisterOpen && (
                        <div
                            className={styles.modalOverlay}
                            onClick={() =>
                                setIsRegisterOpen(false)
                            }
                        >
                            <div
                                className={styles.modal}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >
                                <div
                                    className={styles.modalHeader}
                                >
                                    <h3>{editingScheduleNum === null ? "일정 등록" : "일정 수정"}</h3>

                                    <button
                                        type="button"
                                        className={
                                            styles.closeButton
                                        }
                                        onClick={() =>
                                            setIsRegisterOpen(false)
                                        }
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="schedule-date">
                                        날짜
                                    </label>

                                    <input
                                        id="schedule-date"
                                        type="date"
                                        value={selectedDate}
                                        onChange={(event) =>
                                            setSelectedDate(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="schedule-name">
                                        일정 이름
                                    </label>

                                    <input
                                        id="schedule-name"
                                        type="text"
                                        value={scheduleName}
                                        placeholder="일정 이름을 입력하세요."
                                        onChange={(event) =>
                                            setScheduleName(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div
                                    className={styles.timeContainer}
                                >
                                    <div
                                        className={styles.formGroup}
                                    >
                                        <label htmlFor="start-time">
                                            시작 날짜
                                        </label>

                                        <input
                                            id="start-time"
                                            type="time"
                                            value={startAt}
                                            onChange={(event) =>
                                                setStartAt(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div
                                        className={styles.formGroup}
                                    >
                                        <label htmlFor="end-time">
                                            종료 날짜
                                        </label>

                                        <input
                                            id="end-time"
                                            type="time"
                                            value={endAt}
                                            onChange={(event) =>
                                                setEndAt(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="schedule-detail">
                                        상세 내용
                                    </label>

                                    <textarea
                                        id="schedule-detail"
                                        rows={4}
                                        value={scheduleDetail}
                                        placeholder="일정 내용을 입력하세요."
                                        onChange={(event) =>
                                            setScheduleDetail(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className={styles.modalFooter}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() =>
                                            setIsRegisterOpen(false)
                                        }
                                    >
                                        취소
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.registerButton}
                                        onClick={editingScheduleNum === null ? handleRegisterSchedule : handleUpdateSchedule}
                                    >
                                        {editingScheduleNum === null ? "등록" : "수정"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};