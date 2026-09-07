import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "../cont/Home";
import VideoSummary from "../cont/video/VideoSummary";
import {Group_Home} from "../cont/study_group/Group_Home";
import Group_Create from "../cont/study_group/Group_Create";
import { Group_Detail } from "../cont/study_group/Group_Detail";
import AdminHome from "../cont/admin/AdminHome";

import Layout from "../layout/Layout";
import AdminLayout from "../layout/admin/AdminLayout";
import MemberManagement from "../cont/admin/member/MemberManagement";
import BoardManagement from "../cont/admin/board/BoardManagement";
import StudentCode from "../cont/friend/StudentCode";
import FriendAdd from "../cont/friend/FriendAdd";
import FriendList from "../cont/friend/FriendList";

interface RouteItem {
    path: string;
    element: React.ReactElement;
    private?: boolean;
    role?: string;
}

const AppRoutes: React.FC = () => {
    const { pathname } = useLocation();

    const isManage = pathname.startsWith("/admin");

    const routeList: RouteItem[] = [
        { path: '/', element: <Home /> },
        { path: '/videoSummary', element: <VideoSummary /> },


        { path: '/createGroup', element: <Group_Create /> },
        { path: '/homeGroup', element: <Group_Home/> },
        { path: '/group/detail', element: <Group_Detail/> },
      
      
        // common
        { path: "/", element: <Home /> },
        { path: "/friend/code", element: <StudentCode /> },
        { path: "/friend/add", element: <FriendAdd /> },
        { path: "/friend/list", element: <FriendList /> },


        // admin
        { path: "/admin", element: <AdminHome /> },
        { path: "/admin/memberManagement", element: <MemberManagement /> },
        { path: "/admin/boardManagement", element: <BoardManagement /> },

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