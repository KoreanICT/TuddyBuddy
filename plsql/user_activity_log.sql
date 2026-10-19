-- Run in SQLGate using the TuddyBuddy application schema.
-- Check the target schema and existing objects before executing CREATE statements.
-- This script creates new objects only; it does not drop or alter existing objects.

SELECT USER AS current_schema FROM dual;

SELECT object_name, object_type
FROM user_objects
WHERE object_name IN ('USER_ACTIVITY_LOG', 'USER_ACTIVITY_LOG_SEQ')
ORDER BY object_name;

-- Run the following statements only if the objects above do not already exist.
CREATE TABLE user_activity_log (
    activity_log_num NUMBER(19, 0) NOT NULL,
    event_id         VARCHAR2(36 CHAR) NOT NULL,
    member_num       NUMBER(19, 0) NOT NULL,
    occurred_at      TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    action           VARCHAR2(60 CHAR) NOT NULL,
    target_type      VARCHAR2(40 CHAR) NOT NULL,
    target_id        VARCHAR2(100 CHAR) NOT NULL,
    result           VARCHAR2(20 CHAR) NOT NULL,
    source           VARCHAR2(20 CHAR) NOT NULL,

    CONSTRAINT pk_user_activity_log PRIMARY KEY (activity_log_num),
    CONSTRAINT uq_activity_member_event UNIQUE (member_num, event_id),
    CONSTRAINT ck_activity_result CHECK (result IN ('SUCCESS', 'FAILURE')),
    CONSTRAINT ck_activity_source CHECK (source IN ('CLIENT', 'SERVER')),
    CONSTRAINT ck_activity_member CHECK (member_num > 0)
);

CREATE SEQUENCE user_activity_log_seq
    START WITH 1
    INCREMENT BY 1
    NOCYCLE
    CACHE 100;

CREATE INDEX ix_activity_member_time
    ON user_activity_log (member_num, occurred_at DESC, activity_log_num DESC);

COMMENT ON TABLE user_activity_log IS '회원별 화면 활동 및 서버 업무 결과 이력';
COMMENT ON COLUMN user_activity_log.activity_log_num IS '로그 고유 번호: user_activity_log_seq 사용';
COMMENT ON COLUMN user_activity_log.event_id IS '이벤트 UUID: 동일 이벤트 재전송 시 유지';
COMMENT ON COLUMN user_activity_log.member_num IS '서버 인증으로 확인한 행위자 회원 번호: 논리 참조';
COMMENT ON COLUMN user_activity_log.occurred_at IS '이벤트 발생 시각: 저장 시각이 아닌 전달받은 시각';
COMMENT ON COLUMN user_activity_log.action IS '활동 코드: PAGE_VIEW, GROUP_JOIN, QUIZ_SUBMIT, QUIZ_GENERATE, CHAT_MESSAGE_PROCESS 등';
COMMENT ON COLUMN user_activity_log.target_type IS '대상 종류: PAGE, GROUP, QUIZ_SESSION, CHAT_SESSION, OPERATION 등';
COMMENT ON COLUMN user_activity_log.target_id IS '대상 번호 또는 화면 코드: 대상 미확정 시 활동 코드';
COMMENT ON COLUMN user_activity_log.result IS '활동 결과: SUCCESS 또는 FAILURE';
COMMENT ON COLUMN user_activity_log.source IS '수집 출처: CLIENT 또는 SERVER';

-- Inspect the created objects; no sample member data is inserted.
SELECT column_name, data_type, data_precision, data_scale, nullable
FROM user_tab_columns
WHERE table_name = 'USER_ACTIVITY_LOG'
ORDER BY column_id;

SELECT constraint_name, constraint_type, status
FROM user_constraints
WHERE table_name = 'USER_ACTIVITY_LOG'
ORDER BY constraint_name;

SELECT sequence_name, increment_by, cache_size
FROM user_sequences
WHERE sequence_name = 'USER_ACTIVITY_LOG_SEQ';

SELECT index_name, column_name, descend
FROM user_ind_columns
WHERE table_name = 'USER_ACTIVITY_LOG'
ORDER BY index_name, column_position;
