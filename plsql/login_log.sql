-- 신규 환경에서 login_log 테이블과 login_log_seq 시퀀스가 없을 때만 실행합니다.
-- 기존 환경에서는 실행하지 않습니다. 기존 테이블 변경이나 데이터 삭제는 수행하지 않습니다.
-- 사용자 제공 DDL 기준이며, 외래 키나 추가 제약을 임의로 추가하지 않습니다.

CREATE TABLE login_log (
    Log_num NUMBER(10) PRIMARY KEY,
    login_email VARCHAR2(100) NOT NULL,
    login_ip VARCHAR2(100),
    login_user_agent VARCHAR2(200),
    login_stime DATE,
    login_etime DATE,
    status VARCHAR2(20),
    member_num NUMBER NOT NULL
);

CREATE SEQUENCE login_log_seq
    START WITH 1
    INCREMENT BY 1;
