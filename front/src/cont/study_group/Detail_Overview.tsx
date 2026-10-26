//작성자 : 오진석
import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from "recharts"
import styles from './detail.module.css';
import { GetGroupNum } from './GroupAPI'
import NoticeBanner from '../notice/NoticeBanner';
import api from './api';

interface TdlSummary {
    status: string;
    count: number;
}

interface OverviewTdl {
    tdl_num: number;
    tdl_name: string;
    status: string;
    due_at: string;
}

interface OverviewSchedule {
    schedule_num: number;
    schedule_name: string;
    schedule_date: string;
    start_at?: string;
}

export const Detail_Overview: React.FC<GetGroupNum> = ({ groupNum }) => {

    const [tdls, setTdls] = useState<OverviewTdl[]>([]);
    const [schedules, setSchedules] = useState<OverviewSchedule[]>([]);
    const [tdlSummary, setTdlSummary] = useState<TdlSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadOverview = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(
                `/detail/overview/getEvents/${groupNum}`
            );
            setTdlSummary(response.data.tdlSummary ?? []);
            setTdls(response.data.tdls ?? []);
            setSchedules(response.data.schedules ?? []);

        } catch (error) {
            console.error("개요 조회 실패", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadOverview();

    }, [groupNum]);

    const hasStudyData = tdlSummary.some((item) => item.count > 0) || tdls.length > 0 || schedules.length > 0;

    const chartData = useMemo(() => {
        return tdlSummary.map((item) => ({
            name: item.status === "To Do" ? "할 일" : item.status === "In Progress" ? "진행 중" : item.status === "Done" ? "완료" : item.status,
            value: item.count,
            fill: item.status === "To Do" ? "#f59e0b" : item.status === "In Progress" ? "#3b82f6" : "#22c55e"
        }));
    }, [tdlSummary])

    const totalTdl = tdlSummary.reduce((sum, item) => sum + item.count, 0);

    const doneTdl = tdlSummary.find((item) => item.status === "Done")?.count ?? 0;
    const completionRate = totalTdl === 0 ? 0 : Math.round((doneTdl / totalTdl) * 100);

    const getDday = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(dateString.substring(0, 10));

        targetDate.setHours(0, 0, 0, 0);
        const diff = targetDate.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 0) {
            return "D-DAY";
        }
        if (days > 0) {
            return `D-${days}`;
        }

        return `D+${Math.abs(days)}`;
    }

    return (
        <div className={styles.detail_content_wrapper}>
            {/* 공부 현황 요약 영역 */}
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>공부 현황</h3>
                {isLoading ? (
                    <div className={styles.empty_state}>
                        <p>공부 현황을 불러오는 중입니다.</p>
                    </div>
                ) : !hasStudyData ? (
                    <div className={styles.empty_state}>
                        <span className={styles.clock_icon}>⏰</span>
                        <p>아직 공부 기록이 없네요..</p>
                        <p className={styles.sub_text}>오늘도 열공! 아자아자!</p>
                    </div>
                ) : (
                    <div className={styles.overviewStudy}>
                        <section className={styles.overviewTdl}>
                            <h4>
                                TDL 진행 현황
                            </h4>
                            {totalTdl === 0 ? (
                                <p className={styles.overviewEmpty}>
                                    등록된 TDL이 없습니다.
                                </p>
                            ) : (
                                <>
                                    <div className={styles.tdlChartWrapper}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={220}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                >
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        <div className={styles.tdlRate}>
                                            <strong>
                                                {completionRate}%
                                            </strong>
                                            <span>
                                                완료
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.tdlSummaryList}>
                                        {chartData.map((item) => (
                                            <div key={item.name}>
                                                <span>
                                                    {item.name}
                                                </span>

                                                <strong>
                                                    {item.value}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </section>
                        <div className={styles.overviewDivider} />
                        <section className={styles.overviewUpcoming}>
                            <h4>
                                다가오는 일정
                            </h4>
                            {tdls.length === 0 &&
                                schedules.length === 0 ? (
                                <p className={styles.overviewEmpty}>
                                    예정된 일정이 없습니다.
                                </p>
                            ) : (
                                <div className={styles.upcomingList}>
                                    {/* TDL */}
                                    {tdls.map((tdl) => (
                                        <div 
                                            key={`tdl-${tdl.tdl_num}`}
                                            className={styles.upcomingItem}
                                        >
                                            <span className={styles.dday}>
                                                {getDday(tdl.due_at)}
                                            </span>

                                            <div>
                                                <strong>
                                                    {tdl.tdl_name}
                                                </strong>
                                                <span>
                                                    TDL · {tdl.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Schedule */}
                                    {schedules.map((schedule) => (
                                        <div
                                            key={`schedule-${schedule.schedule_num}`}
                                            className={styles.upcomingItem}
                                        >
                                            <span className={styles.dday}>
                                                {getDday(schedule.schedule_date)}
                                            </span>
                                            <div>
                                                <strong>
                                                    {schedule.schedule_name}
                                                </strong>
                                                <span>
                                                    일정
                                                    {schedule.start_at && ` · ${schedule.start_at.split("T")[1]?.substring(0, 5)}`}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {/* 최근 공지 영역 */}
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>최신 공지</h3>
                <NoticeBanner limit={5} />
            </div>
        </div>
    );
};