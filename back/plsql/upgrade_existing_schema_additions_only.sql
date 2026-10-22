-- 기존 데이터 보존용 증분 스키마 업데이트
-- 이전 전체 DDL과 새 전체 DDL의 추가분만 반영합니다.
-- DROP, 기존 행 INSERT/UPDATE, 기존 컬럼 축소는 하지 않습니다.
-- SQLGate에서는 스크립트 실행(F5)으로 실행하세요.

SET SERVEROUTPUT ON;

-- user_activity_log 사전 확인
-- 현재 백엔드 매퍼는 아래 6개 컬럼을 사용합니다.
-- 기존 테이블이 다른 구조라면 CREATE를 건너뛰므로, 실행 전 이 결과를 확인하세요.
SELECT table_name, column_name, data_type
FROM user_tab_columns
WHERE table_name = 'USER_ACTIVITY_LOG'
ORDER BY column_id;

-- 기존 행은 기본값 Y를 받고, 새 행에도 Y/N만 허용합니다.
DECLARE
    v_count PLS_INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'CATEGORIES' AND column_name = 'CATEGORY_STATUS';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE q'~ALTER TABLE categories ADD (
            category_status CHAR(1) DEFAULT 'Y' NOT NULL
                CHECK (category_status IN ('Y', 'N'))
        )~';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'SUBJECTS' AND column_name = 'SUBJECT_STATUS';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE q'~ALTER TABLE subjects ADD (
            subject_status CHAR(1) DEFAULT 'Y' NOT NULL
                CHECK (subject_status IN ('Y', 'N'))
        )~';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'TDL' AND column_name = 'REPEAT_TYPE';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE tdl ADD (repeat_type VARCHAR2(20))';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'TDL' AND column_name = 'DUE_AT';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE tdl ADD (due_at DATE)';
    END IF;
END;
/

-- 추가 요청사항은 선택 입력이므로 NULL을 허용합니다.
-- 기존 데이터는 변경하지 않습니다.
DECLARE
    v_count PLS_INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_tab_columns
    WHERE table_name = 'QUIZ_SESSIONS'
      AND column_name = 'QUIZ_PROMPT';

    IF v_count = 1 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE quiz_sessions MODIFY (quiz_prompt NULL)';
    END IF;
END;
/

-- 새 attendance 테이블만 생성합니다. 이미 있으면 그대로 둡니다.
DECLARE
    v_count PLS_INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_tables
    WHERE table_name = 'ATTENDANCE';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE q'~CREATE TABLE attendance (
            attendance_num NUMBER PRIMARY KEY,
            member_num NUMBER NOT NULL,
            attendance_date DATE,
            reward_point NUMBER(10),
            regdate DATE
        )~';
    END IF;
END;
/

-- 현재 백엔드 ActivityLogDAO와 일치하는 신규 테이블 구조입니다.
-- 다른 구조의 USER_ACTIVITY_LOG가 이미 있으면 덮어쓰거나 변경하지 않습니다.
DECLARE
    v_count PLS_INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_tables
    WHERE table_name = 'USER_ACTIVITY_LOG';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE q'~CREATE TABLE user_activity_log (
            activity_log_num NUMBER(19) PRIMARY KEY,
            member_num NUMBER NOT NULL,
            activity_occurred_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            activity_category VARCHAR2(40) NOT NULL,
            activity_action VARCHAR2(60) NOT NULL,
            activity_result VARCHAR2(20) NOT NULL,
            CONSTRAINT ck_activity_result
                CHECK (activity_result IN ('SUCCESS', 'FAILURE'))
        )~';
    END IF;
END;
/

-- 새 시퀀스는 기존 데이터의 최대 번호 다음부터 시작합니다.
-- categories_seq / subjects_seq는 이전 스키마에도 있어 여기서 만들지 않습니다.
DECLARE
    v_count PLS_INTEGER;
    v_start NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_sequences
    WHERE sequence_name = 'ATTENDANCE_SEQ';

    IF v_count = 0 THEN
        SELECT NVL(MAX(attendance_num), 0) + 1 INTO v_start FROM attendance;
        EXECUTE IMMEDIATE 'CREATE SEQUENCE attendance_seq START WITH ' || v_start ||
            ' INCREMENT BY 1 NOCACHE NOCYCLE';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM user_sequences
    WHERE sequence_name = 'USER_ACTIVITY_LOG_SEQ';

    IF v_count = 0 THEN
        SELECT COUNT(*) INTO v_count
        FROM user_tab_columns
        WHERE table_name = 'USER_ACTIVITY_LOG'
          AND column_name = 'ACTIVITY_LOG_NUM';

        IF v_count = 1 THEN
            SELECT NVL(MAX(activity_log_num), 0) + 1 INTO v_start
            FROM user_activity_log;
        ELSE
            v_start := 1;
        END IF;

        EXECUTE IMMEDIATE 'CREATE SEQUENCE user_activity_log_seq START WITH ' || v_start ||
            ' INCREMENT BY 1 NOCACHE NOCYCLE';
    END IF;
END;
/

-- 새 테이블 관계만 추가합니다. 기존 데이터에 고아 참조가 있으면 FK는 건너뜁니다.
DECLARE
    v_count PLS_INTEGER;
    v_orphans PLS_INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_constraints
    WHERE constraint_name = 'ATTENDANCE_MEMBER_FK';

    IF v_count = 0 THEN
        SELECT COUNT(*) INTO v_orphans
        FROM attendance a
        WHERE NOT EXISTS (
            SELECT 1 FROM member m WHERE m.member_num = a.member_num
        );

        IF v_orphans = 0 THEN
            EXECUTE IMMEDIATE q'~ALTER TABLE attendance
                ADD CONSTRAINT attendance_member_fk
                FOREIGN KEY (member_num) REFERENCES member (member_num)
                ON DELETE CASCADE~';
        ELSE
            DBMS_OUTPUT.PUT_LINE('attendance FK 생략: member에 없는 member_num 행이 있습니다.');
        END IF;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM user_constraints
    WHERE constraint_name = 'USER_ACTIVITY_LOG_MEMBER_FK';

    IF v_count = 0 THEN
        SELECT COUNT(*) INTO v_orphans
        FROM user_activity_log a
        WHERE NOT EXISTS (
            SELECT 1 FROM member m WHERE m.member_num = a.member_num
        );

        IF v_orphans = 0 THEN
            EXECUTE IMMEDIATE q'~ALTER TABLE user_activity_log
                ADD CONSTRAINT user_activity_log_member_fk
                FOREIGN KEY (member_num) REFERENCES member (member_num)
                ON DELETE CASCADE~';
        ELSE
            DBMS_OUTPUT.PUT_LINE('activity log FK 생략: member에 없는 member_num 행이 있습니다.');
        END IF;
    END IF;
END;
/

-- 적용 후 확인
SELECT table_name, column_name, data_type
FROM user_tab_columns
WHERE (table_name = 'CATEGORIES' AND column_name = 'CATEGORY_STATUS')
   OR (table_name = 'SUBJECTS' AND column_name = 'SUBJECT_STATUS')
   OR (table_name = 'TDL' AND column_name IN ('REPEAT_TYPE', 'DUE_AT'))
   OR (table_name = 'USER_ACTIVITY_LOG')
ORDER BY table_name, column_id;

SELECT sequence_name, last_number
FROM user_sequences
WHERE sequence_name IN ('ATTENDANCE_SEQ', 'USER_ACTIVITY_LOG_SEQ');
