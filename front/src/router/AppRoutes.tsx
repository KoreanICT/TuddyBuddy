
import Home from "../cont/Home";
import { ProductSelector } from "../cont/point/ProductSelector";
import PerformanceAnalytics from "../cont/statistics/PerformanceAnalytics";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "../cont/Home";
import SelfStudy from "../cont/SelfStudy";
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
        { path: '/point', element: <ProductSelector/> },
        { path: '/statistics', element: <PerformanceAnalytics/> }
        { path: '/selfStudy', element: <SelfStudy /> },
    ]
    return (
        <Routes>
            {
                routeList.map((route, idx) => (
                    <Route key={idx} {...route} />
                ))
            }
            
        </Routes>
    )
}

export default AppRoutes;