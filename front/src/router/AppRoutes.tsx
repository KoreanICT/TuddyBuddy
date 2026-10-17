import Home from "../cont/Home";

import Signup from "../member/Signup";
import MyPage from "../mypage/MyPage";
import { ProductSelector } from "../cont/point/ProductSelector";
import PerformanceAnalytics from "../cont/statistics/PerformanceAnalytics";
import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Group_Home } from "../cont/study_group/Group_Home";
import { Group_Detail } from "../cont/study_group/Group_Detail";
import AdminHome from "../cont/admin/AdminHome";
import MemberManagement from "../cont/admin/member/MemberManagement";
import BoardManagement from "../cont/admin/board/BoardManagement";
import FriendAdd from "../cont/friend/FriendAdd";
import FriendList from "../cont/friend/FriendList";
import ReportList from "../cont/admin/report/ReportList";
import ReportDetail from "../cont/admin/report/ReportDetail";
import ReportReply from "../cont/admin/report/ReportReply";

import Layout from "../layout/Layout";
import AdminLayout from "../layout/admin/AdminLayout";

import ReportCreate from "../cont/report/ReportCreate";
import StudyManagement from "../cont/admin/study_group/StudyManagement";
import AuthLayout from "../layout/auth/AuthLayout";
import SelfStudy from "../cont/selfStudy/SelfStudy";
import Community from "../cont/community/Community";

import PointHistory from "../mypage/PointHistory";
import Member_Edit from "../mypage/Member_edit";

import ReportReplyList from "../cont/report/ReportReplyList";
import ReportReplyDetail from "../cont/report/ReportReplyDetail";
import FriendRequestList from "../cont/friend/FriendRequestList";
import FriendSentList from "../cont/friend/FriendSentList";
import AdminNoticeList from "../cont/admin/notice/AdminNoticeList";
import AdminNoticeForm from "../cont/admin/notice/AdminNoticeForm";
import NoticeList from "../cont/notice/NoticeList";
import NoticeDetail from "../cont/notice/NoticeDetail";
import SelfStudyManagement from "../cont/admin/selfstudy/SelfStudyManagement";
import KakaoCallback from "../login/KakaoCallback";
import KakaoSignup from "../login/KakaoSignup";
import Login from "../login/Login";
import RequireAuth from "../login/auth/RequireAuthProps";
import { ROLE_ACCESS } from "../login/auth/roles";

interface RouteItem {
    path: string;
    element: React.ReactElement;
}

const AppRoutes: React.FC = () => {
    const { pathname } = useLocation();

    let routePath = pathname;
    try {
        routePath = decodeURIComponent(pathname);
    } catch {
        // 잘못된 인코딩은 원래 경로로 판단합니다.
    }
    routePath = routePath.toLowerCase();
    const isManage = routePath === "/admin" || routePath.startsWith("/admin/");
    const isAuth = pathname.startsWith("/auth");

    const routeList: RouteItem[] = [

        // contents
        { path: '/community', element: <Community /> },

        { path: '/group', element: <RequireAuth allowedRoles={ROLE_ACCESS.member}><Group_Home /></RequireAuth> },
        { path: '/group/detail/:groupNum', element: <RequireAuth allowedRoles={ROLE_ACCESS.member}><Group_Detail /></RequireAuth> },

        { path: "/", element: <Home /> },
        { path: "/friend/add", element: <FriendAdd /> },
        { path: "/friend/list", element: <FriendList /> },

        { path: "/friend/request", element: <FriendRequestList /> },
        { path: "/friend/sent", element: <FriendSentList /> },

        { path: '/point', element: <ProductSelector /> },
        { path: '/statistics', element: <RequireAuth allowedRoles={ROLE_ACCESS.member}><PerformanceAnalytics /></RequireAuth> },
        { path: '/selfStudy', element: <RequireAuth allowedRoles={ROLE_ACCESS.member}><SelfStudy /></RequireAuth> },
        { path: '/reportCreate', element: <ReportCreate /> },

        { path: '/reportReplyList', element: <ReportReplyList /> },
        { path: "/report/replyDetail/:id", element: <ReportReplyDetail /> },

        { path: "/notice", element: <NoticeList /> },
        { path: "/notice/:num", element: <NoticeDetail /> },

        // admin
        { path: "/admin", element: <AdminHome /> },
        { path: "/admin/memberManagement", element: <MemberManagement /> },
        { path: "/admin/boardManagement", element: <BoardManagement /> },
        { path: "/admin/reportList", element: <ReportList /> },
        { path: "/admin/reportDetail/:id", element: <ReportDetail /> },
        { path: "/admin/reportReply/:id", element: <ReportReply /> },
        { path: "/admin/studyManagement", element: <StudyManagement /> },
        { path: "/admin/notice", element: <AdminNoticeList /> },
        { path: "/admin/notice/add", element: <AdminNoticeForm /> },
        { path: "/admin/notice/edit/:num", element: <AdminNoticeForm /> },
        { path: "/admin/selfstudy", element: <RequireAuth allowedRoles={ROLE_ACCESS.manageSelfStudy}><SelfStudyManagement /></RequireAuth> },

        // auth
        { path: '/auth/member', element: <Login /> },
        { path: '/auth/signup', element: <Signup /> },
        { path: '/auth/kakao/callback', element: <KakaoCallback /> },
        { path: '/auth/mypage', element: <MyPage /> },
        
        { path: '/point_history', element: <PointHistory /> },
        { path: '/member_edit', element: <Member_Edit /> },
        { path: '/auth/kakao/signup', element: <KakaoSignup /> },
    ];

    return (
        <>
            {isManage ? (
                <RequireAuth allowedRoles={ROLE_ACCESS.admin}>
                    <AdminLayout>
                        <Routes>
                            {routeList.map((route, idx) => (
                                <Route key={idx} {...route} />
                            ))}
                        </Routes>
                    </AdminLayout>
                </RequireAuth>

            ) : isAuth ? (
                <AuthLayout>
                    <Routes>
                        {routeList.map((route, idx) => (
                            <Route key={idx} {...route} />
                        ))}
                    </Routes>
                </AuthLayout>

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
