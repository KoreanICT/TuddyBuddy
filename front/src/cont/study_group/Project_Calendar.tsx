import React, { useMemo, useState } from "react";
import styles from "./project.module.css";
//import { useAuth } from "../../hooks/useAuth"
import { getMember } from "./getMembernum";
import axios from "axios";

interface Schedule {
    schedule_num: number;
    group_num: number;
    member_num: number;
    schedule_name: string;
    schedule_date: string;
    schedule_detail?: string;
    created_at?: string;
    updated_at?: string;
    start_at?: string;
    end_at?: string;
}

interface Tdl {
    tdl_num: number;
    title: string;
    expired_at: string;
}

/**
 * yyyy-MM-dd
 */
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

/**
 * 테스트용 일정 데이터
 *
 * 이후 Spring Boot API 데이터로 교체
 */
const initialSchedules: Schedule[] = [
    {
        schedule_num: 1,
        group_num: 1,
        member_num: 100,
        schedule_name: "프로젝트 회의",
        schedule_date: "2026-09-30",
        schedule_detail: "프론트엔드 진행상황 공유",
        start_at: "2026-09-30T14:00",
        end_at: "2026-09-30T15:00",
    },
    {
        schedule_num: 2,
        group_num: 1,
        member_num: 200,
        schedule_name: "스터디",
        schedule_date: "2026-09-30",
        schedule_detail: "Spring Boot 공부",
    },
];

/**
 * 테스트용 To Do List
 *
 * 이후 TDL API 데이터로 교체
 */
const initialTdls: Tdl[] = [
    {
        tdl_num: 1,
        title: "React 컴포넌트 완성",
        expired_at: "2026-09-30",
    },
    {
        tdl_num: 2,
        title: "Spring Boot API 구현",
        expired_at: "2026-10-03",
    },
];

export const Project_Calendar: React.FC = () => {

    const member = getMember();//멤버 정보 가져오기 임시 함수 import
    const currentMemberNum = member?.member_num;
    const today = new Date();

    /*
     * 현재 달력에서 보고 있는 년 / 월
     */
    const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
    /*
     * 사용자가 선택한 날짜
     */
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
    /*
     * 일정
     */
    const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
    /*
     * TDL
     */
    const [tdls] = useState<Tdl[]>(initialTdls);
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
     *
     * 일요일 = 0
     * 월요일 = 1
     * ...
     * 토요일 = 6
     */
    const startDayOfWeek = firstDay.getDay();

    /**
     * 날짜 셀 배열 생성
     *
     * 예:
     *
     *     1 2 3 4
     * 5 6 7 8 9 10 11
     */
    const calendarDays = useMemo(() => {
        const days: Array<number | null> = [];

        /*
         * 1일 이전의 빈 공간
         */
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        /*
         * 실제 날짜
         */
        for (let day = 1; day <= totalDays; day++) {
            days.push(day);
        }

        /*
         * 마지막 줄 채우기
         */
        while (days.length % 7 !== 0) {
            days.push(null);
        }

        return days;
    }, [year, month]);

    /**
     * 이전 달
     */
    const movePrevMonth = () => {
        setCurrentDate(
            new Date(year, month - 1, 1)
        );
    };

    /**
     * 다음 달
     */
    const moveNextMonth = () => {
        setCurrentDate(
            new Date(year, month + 1, 1)
        );
    };

    /**
     * 오늘로 이동
     */
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
        setScheduleName("");
        setScheduleDetail("");
        setStartAt("");
        setEndAt("");

        setIsRegisterOpen(true);
    };

    /**
     * 일정 등록
     *
     * 나중에는 이 부분을
     *
     * await axios.post(...)
     *
     * 로 변경하면 된다.
     */
    const handleRegisterSchedule = () => {
        if (currentMemberNum === undefined) {
            alert("로그인 사용자 정보를 확인할 수 없습니다.");
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

        const newSchedule: Schedule = {
            schedule_num: Date.now(),

            /*
             * 임시 group_num
             *
             * 나중에는 현재 스터디 그룹 번호 사용
             */
            group_num: 1,
            member_num: currentMemberNum,
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

        setSchedules((prev) => [
            ...prev,
            newSchedule,
        ]);

        setIsRegisterOpen(false);
    };

    /**
     * 일정 삭제
     *
     * 본인의 일정만 삭제 가능
     */
    const handleDeleteSchedule = (
        schedule: Schedule
    ) => {
        if (
            schedule.member_num !==
            currentMemberNum
        ) {
            alert(
                "본인이 등록한 일정만 삭제할 수 있습니다."
            );

            return;
        }

        const result = window.confirm(
            "해당 일정을 삭제하시겠습니까?"
        );

        if (!result) {
            return;
        }

        setSchedules((prev) =>
            prev.filter(
                (item) =>
                    item.schedule_num !== schedule.schedule_num
            )
        );
    };

    /**
     * 특정 날짜 일정 검색
     */
    const getSchedulesByDate = (
        date: string
    ) => {
        return schedules.filter(
            (schedule) =>
                schedule.schedule_date === date
        );
    };

    /**
     * 특정 날짜 TDL 검색
     */
    const getTdlsByDate = (
        date: string
    ) => {
        return tdls.filter(
            (tdl) =>
                tdl.expired_at.substring(0, 10) ===
                date
        );
    };

    /*
     * 선택한 날짜 데이터
     */
    const selectedSchedules =
        getSchedulesByDate(selectedDate);

    const selectedTdls =
        getTdlsByDate(selectedDate);

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>일정 관리</h3>
                <p className={styles.section_desc}>
                    멤버들의 개인 일정과 해야할 일(To Do List)을 정리하는 곳입니다.
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

                                const date =
                                    createDateString(day);

                                const daySchedules =
                                    getSchedulesByDate(date);

                                const dayTdls =
                                    getTdlsByDate(date);

                                const isToday =
                                    date === formatDate(today);

                                const dayOfWeek =
                                    index % 7;

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
                                                .map((tdl) => (
                                                    <div
                                                        key={tdl.tdl_num}
                                                        className={
                                                            styles.tdlItem
                                                        }
                                                    >
                                                        ✓ {tdl.title}
                                                    </div>
                                                ))}

                                            {daySchedules.length +
                                                dayTdls.length >
                                                4 && (
                                                    <div
                                                        className={
                                                            styles.moreItem
                                                        }
                                                    >
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
                                        className={
                                            styles.closeButton
                                        }
                                        onClick={() =>
                                            setIsDetailOpen(false)
                                        }
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* 일반 일정 */}

                                <section
                                    className={
                                        styles.scheduleSection
                                    }
                                >
                                    <div
                                        className={
                                            styles.sectionTitle
                                        }
                                    >
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
                                        <p
                                            className={
                                                styles.emptyMessage
                                            }
                                        >
                                            등록된 일정이 없습니다.
                                        </p>
                                    ) : (
                                        selectedSchedules.map(
                                            (schedule) => (
                                                <div
                                                    key={
                                                        schedule.schedule_num
                                                    }
                                                    className={
                                                        styles.detailItem
                                                    }
                                                >
                                                    <div>
                                                        <strong>
                                                            {
                                                                schedule.schedule_name
                                                            }
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

                                                    {schedule.member_num ===
                                                        currentMemberNum && (
                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.deleteButton
                                                                }
                                                                onClick={() =>
                                                                    handleDeleteSchedule(
                                                                        schedule
                                                                    )
                                                                }
                                                            >
                                                                삭제
                                                            </button>
                                                        )}
                                                </div>
                                            )
                                        )
                                    )}
                                </section>

                                {/* TDL */}

                                <section
                                    className={
                                        styles.scheduleSection
                                    }
                                >
                                    <h4>To Do List 마감</h4>

                                    {selectedTdls.length === 0 ? (
                                        <p
                                            className={
                                                styles.emptyMessage
                                            }
                                        >
                                            마감 예정인 To Do List가
                                            없습니다.
                                        </p>
                                    ) : (
                                        selectedTdls.map(
                                            (tdl) => (
                                                <div
                                                    key={tdl.tdl_num}
                                                    className={
                                                        styles.detailTdlItem
                                                    }
                                                >
                                                    <span>✓</span>

                                                    <span>{tdl.title}</span>
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
                                    <h3>일정 등록</h3>

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
                                        className={
                                            styles.registerButton
                                        }
                                        onClick={
                                            handleRegisterSchedule
                                        }
                                    >
                                        등록
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