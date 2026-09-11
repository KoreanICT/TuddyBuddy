import { Route, Routes } from "react-router-dom";
import Home from "../cont/Home";
import Login from "../member/Login";
import Signup from "../member/Signup"
import MyPage from "../mypage/MyPage";

interface RouteItem {
    path: string;
    element: React.ReactElement;
    private?: boolean;
    role?: string;
}

const AppRoutes: React.FC = () => {
    const routeList = [
        { path: '/', element: <Home /> },
        { path: '/member', element: <Login/>},
        { path: '/signup', element: <Signup/>},
        { path: '/mypage', element: <MyPage/>},

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