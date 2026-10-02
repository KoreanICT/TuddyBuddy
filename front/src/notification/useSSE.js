import { useCallback, useEffect, useRef, useState } from 'react'

export const useSSE = (url) => {
    // 받은 데이터 저장(가장 최근 메시지만 저장)
    const [data, setData] = useState(null);
    //에러 상태 저장(연결 실패, 파싱 오류 등)
    const [error, setError] = useState(null);
    //연결 상태 (true: 연결됨, false: 연결 안됨/끊어짐)
    const [isConnected, setIsConnected] = useState(false);
    //EventSource 객체 참조 - 리렌더링 시에도 동일한 객체 유지
    const eventSourceRef = useRef(null);
    //재연결 타이머 참조 - 컴포넌트 언마운트 시 타이머 정리용
    const reconnectTimeoutRef = useRef(null);

    //SSE 연결 함수
    //useCallback으로 함수 메모이제이션 - 의존성(url)이 변경될 때만 새로 생성
    const connect = useCallback(() => {
        try {
            //기존 연결이 있다면 종료
            //중복 연결 방지를 위해 새 연결 전에 기조너 연결 정리
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            //새로운 EventSource 객체 생성
            //EventSource: 브라우저 내장 API, SSE 연결 관리
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            //연결 성공 시 이벤트 핸들러
            //onopen: EventSource가 서버와 성공적으로 연결되었을 때 실행
            eventSource.onopen = () => {
                console.log('SSE connection opened');
                setIsConnected(true);
                setError(null);
            };

            //메시지 수신 시 이벤트 핸들러
            //onmessage: 서버에서 "data: " 형식의 메시지를 보낼 때마다 실행
            eventSource.onmessage = (event) => {
                try {
                    //event.data: 서버에서 보낸 실제 데이터 (문자열 형태)
                    //JSON.parse: 문자열을 JavaScript 객체로 변환
                    const parsedData = JSON.parse(event.data);
                    setData(parsedData);//파싱된 데이터를 상태에 저장
                } catch (parseError) {
                    ///JSON 파싱 실패 시 에러 처리
                    console.error('Error parsing SSE data:', parseError);
                    setError('데이터 파싱 오류');
                }
            };

            //에러 발생 시 이벤트 핸들러
            //onerror: 연결 실패, 네트워크 오류 등이 발생했을 때 실행
            eventSource.onerror = (event) => {
                console.error('SSE connection error:', event);
                setIsConnected(false); //연결 상태를 false로 변경

                //연결이 완전히 끊어진 경우 자동 재연결 시도
                //EventSource.CLOSED: 연결이 영구적으로 닫힌 상태 (값: 2)
                if (eventSource.readyState === EventSource.CLOSED) {
                    setError('연결 끊김. 재연결 시도.');

                    //3초 후 재연결 시도 (너무 자주 시도하면 서버 부하 증가)
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();//재귀 호출로 연결 재시도
                    },3000);
                }
            };
        } catch (error) {
            //EventSource 객체 생성 자체가 실패한 경우
            console.error('Error creating SSE connection:', error);
            setError('연결 생성 오류');
        }
    },[url]); // url이 변경되면 새로운 connect 함수 생성

    //연결 해제 함수
    const disconnect = useCallback(() => {
        //EventSource 연결 종료
        if (eventSourceRef.current) {
            eventSourceRef.current.close(); //연결 닫기
            eventSourceRef.current = null; // 참조 초기화
        }
        // 재연결 타이머가 실행 중이면 취소
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        setIsConnected(false); //연결 상태 업데이트
    }, []);

    // 컴포넌트 마운트 시 연결, 언마운트 시 해제
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        }
    },[connect, disconnect]);

    return {
        data, error, isConnected, connect, disconnect
    };
};