import { Route, Routes } from "react-router-dom";
import Home from "../cont/Home";
import SelfStudy from "../cont/SelfStudy";
interface RouteItem {
    path: string;
    element: React.ReactElement;
    private?: boolean;
    role?: string;
}

const AppRoutes: React.FC = () => {
    const routeList = [
        { path: '/', element: <Home /> },
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

export default AppRoutes