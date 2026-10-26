-- report 테이블의 type과 target_num을 활용해 신고당한 인원 추적 프로시저

CREATE OR REPLACE PROCEDURE GET_REPORT_TARGET_MEMBER (
    p_type       IN  report.type%TYPE,
    p_target_num IN  report.target_num%TYPE,
    p_member_num OUT member.member_num%TYPE
)
IS
    v_type report.type%TYPE := LOWER(TRIM(p_type));
BEGIN
    -- 대상이 없는 경우 관리자에게 전달
    p_member_num := 1;

    IF v_type IS NULL
       OR v_type NOT IN (
           'report', 'community', 'user',
           'study', 'document', 'comment'
       )
    THEN
        RAISE_APPLICATION_ERROR(
            -20001, '지원하지 않는 신고 유형입니다.'
        );
    END IF;

    -- 일반 신고
    IF v_type = 'report' THEN
        IF p_target_num IS NULL OR p_target_num <> 0 THEN
            RAISE_APPLICATION_ERROR(
                -20002, '일반 신고의 대상 번호는 0이어야 합니다.'
            );
        END IF;

        RETURN;
    END IF;

    -- 특정 대상 신고는 양의 정수 번호 필수
    IF p_target_num IS NULL
       OR p_target_num <= 0
       OR p_target_num <> TRUNC(p_target_num)
    THEN
        RAISE_APPLICATION_ERROR(
            -20002, '신고 대상 번호는 양의 정수여야 합니다.'
        );
    END IF;

    CASE v_type
        -- 커뮤니티 게시글 작성자
        WHEN 'community' THEN
            SELECT member_num
              INTO p_member_num
              FROM community_section
             WHERE community_id = p_target_num;

        -- 신고 대상 회원
        WHEN 'user' THEN
            SELECT member_num
              INTO p_member_num
              FROM member
             WHERE member_num = p_target_num;

        -- 스터디 그룹 방장
        WHEN 'study' THEN
            SELECT gm.member_num
              INTO p_member_num
              FROM group_member gm
              JOIN studygroup sg
                ON sg.group_num = gm.group_num
             WHERE gm.group_num = p_target_num
               AND gm.is_leader = 1;

        -- 공유 자료 작성자
        WHEN 'document' THEN
            SELECT member_num
              INTO p_member_num
              FROM group_document
             WHERE document_num = p_target_num;

        -- 댓글 테이블 미확정: 관리자에게 전달
        WHEN 'comment' THEN
            p_member_num := 1;
    END CASE;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- 대상 삭제, 탈퇴, 방장 부재 등
        p_member_num := 1;

    WHEN TOO_MANY_ROWS THEN
        RAISE_APPLICATION_ERROR(
            -20003, '신고 대상 회원이 여러 명입니다. 대상 데이터를 확인해주세요.'
        );
END GET_REPORT_TARGET_MEMBER;
/

COMMIT;
