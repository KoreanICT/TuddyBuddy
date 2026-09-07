import { Route, Routes } from "react-router-dom";
import Home from "../cont/Home";
import { ProductSelector } from "../cont/point/ProductSelector";
import PerformanceAnalytics from "../cont/statistics/PerformanceAnalytics";
interface RouteItem {
    path: string;
    element: React.ReactElement;
    private?: boolean;
    role?: string;
}

const AppRoutes: React.FC = () => {
    const routeList = [
        { path: '/', element: <Home /> },
        { path: '/point', element: <ProductSelector/> },
        { path: '/statistics', element: <PerformanceAnalytics/> }
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

export default AppRoutes