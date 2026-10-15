//auth/RequireAuthProps.tsx
import { parseJwt } from '../comp/jwtUtils';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  allowedRoles
}) => {

  const location = useLocation();

  // 1. JWT 토큰 확인
  const token = localStorage.getItem('token');

  // 2. 로그인하지 않은 사용자
  if (!token) {
    return (
      <Navigate
        to={`/back/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // 3. JWT에서 사용자 권한 추출
  const decoded = parseJwt(token);
  const userRole = decoded?.role;

  // 4. 토큰이 잘못된 경우
  if (!decoded) {
    return <Navigate to="/back/login" replace />;
  }

  // 5. 권한 검사
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="container mt-5">
        <h3>접근 권한이 없습니다.</h3>
        <p>이 페이지는 ADMIN 또는 TEACHER만 접근할 수 있습니다.</p>
      </div>
    );
  }

  // 6. 인증과 권한 검사를 통과한 경우
  return <>{children}</>;
};

export default RequireAuth;

// import { parseJwt } from 'comp/jwtUtils';
// import React, { useEffect } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom';
// interface RequireAuthProps {
//   children:React.ReactNode;
//   allowedRoles?: string[]; // 허용된 역할 목록 (선택 사항)
// }
// const RequireAuth: React.FC<RequireAuthProps> = ({ children , allowedRoles}) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isAuthorized, setIsAuthorized] = React.useState(false);
//    // localStorage에 token 이 존재하지 않는다면 
//    // 로그인 페이지로 이동시키는 로직을 추가
//     useEffect(()=>{
//       const token = localStorage.getItem('token');
//       if(!token){ //로그인이 안된 경우 
//         setIsAuthorized(false);
//          // 로그인 페이지로 리다이렉트할 때 현재 경로를 쿼리 파라미터로 전달
//         navigate(`/back/login?redirect=${encodeURIComponent(location.pathname)}`);
//         return;
//       }
//       // JWT에서 role을 추출하여 allowedRoles와 비교
//       const decoded = parseJwt(token);
//       const userRole = decoded?.role; // JWT에서 role 추출
//       // 권한 체크
//       if (allowedRoles && !allowedRoles.includes(userRole)) {
//         // setIsAuthorized(false);
//         // alert('권한이 없습니다.'); // 권한이 없는 경우 알림
//         // navigate('/', { replace: true }); // 권한이 없는 경우 홈으로 이동
//         // return;
        
//       }
//       setIsAuthorized(true);

//     },[navigate,location.pathname]);
//     if(isAuthorized === null || !isAuthorized) {
//         return null; // 인증 상태가 확인되지 않았거나 인증되지 않은 경우 아무것도 렌더링하지 않음
//     }
//     // 로그인이 완료 되면 보여줄 페이지를 랜더링 한다. 
//   return (
//     <>
//       {children}
//     </>
//   )
// }

// export default RequireAuth