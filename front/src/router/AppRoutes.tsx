
import Home from "../cont/Home";
import { ProductSelector } from "../cont/point/ProductSelector";
import PerformanceAnalytics from "../cont/statistics/PerformanceAnalytics";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import VideoSummary from "../cont/video/VideoSummary";
import { Group_Home } from "../cont/study_group/Group_Home";
import Group_Create from "../cont/study_group/Group_Create";
import { Group_Detail } from "../cont/study_group/Group_Detail";
import AdminHome from "../cont/admin/AdminHome";
import MemberManagement from "../cont/admin/member/MemberManagement";
import BoardManagement from "../cont/admin/board/BoardManagement";
import StudentCode from "../cont/friend/StudentCode";
import FriendAdd from "../cont/friend/FriendAdd";
import FriendList from "../cont/friend/FriendList";
import Community from "../cont/community/Community";
import ReportList from "../cont/admin/report/ReportList";
import ReportDetail from "../cont/admin/report/ReportDetail";
import ReportReply from "../cont/admin/report/ReportReply";

import Layout from "../layout/Layout";
import AdminLayout from "../layout/admin/AdminLayout";

import SelfStudy from "../cont/SelfStudy";
import ReportCreate from "../cont/report/ReportCreate";
interface RouteItem {
    path: string;
    element: React.ReactElement;
}

const AppRoutes: React.FC = () => {
    const { pathname } = useLocation();

    const isManage = pathname.startsWith("/admin");

    const routeList: RouteItem[] = [
        { path: '/', element: <Home /> },
        { path: '/videoSummary', element: <VideoSummary /> },
        { path: '/community', element: <Community /> }, 


        { path: '/createGroup', element: <Group_Create /> },
        { path: '/homeGroup', element: <Group_Home /> },
        { path: '/group/detail', element: <Group_Detail /> },


        // common
        { path: "/", element: <Home /> },
        { path: "/friend/code", element: <StudentCode /> },
        { path: "/friend/add", element: <FriendAdd /> },
        { path: "/friend/list", element: <FriendList /> },
        { path: '/point', element: <ProductSelector /> },
        { path: '/statistics', element: <PerformanceAnalytics /> },
        { path: '/selfStudy', element: <SelfStudy /> },
        { path: '/reportCreate', element: <ReportCreate /> },


        // admin
        { path: "/admin", element: <AdminHome /> },
        { path: "/admin/memberManagement", element: <MemberManagement /> },
        { path: "/admin/boardManagement", element: <BoardManagement /> },
        { path: "/admin/reportList", element: <ReportList /> },
        { path: "/admin/reportDetail/:id", element: <ReportDetail /> },
        { path: "/admin/reportReply/:id", element: <ReportReply /> },

        // user? auth? account?
    ];


    return (
        <>
            {isManage ? (
                <AdminLayout>
                    <Routes>
                        {routeList.map((route, idx) => (
                            <Route key={idx} {...route} />
                        ))}
                    </Routes>
                </AdminLayout>
            ) : (
                <Layout>
                    <Routes>
                        {routeList.map((route, idx) => (
                            <Route key={idx} {...route} />
                        ))}
                    </Routes>
                </Layout>
            )}
        </>
    );
};

export default AppRoutes;