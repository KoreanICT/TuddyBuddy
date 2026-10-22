package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import kr.co.ictedu.back.group.vo.GroupMemberVO;

class GroupMemberCrudTest extends GroupCrudFixtures {
    @Test
    void addsReadsTransfersLeadershipAndQuits() {
        Long group = group();
        Long leader = member();
        Long target = member();
        GroupMemberVO row = new GroupMemberVO();
        row.setGroup_num(group);
        row.setMember_num(leader);
        row.setIs_leader(1);
        groups.addGroupMember(row);
        row.setMember_num(target);
        row.setIs_leader(0);
        groups.addGroupMember(row);
        assertEquals(1, groups.countGroupMember(group, leader));
        assertEquals(2, groups.countGroupMembers(group));
        assertEquals(2, details.getMembers(group).size());
        assertNotNull(details.getHeader(leader, group));
        assertEquals(1, details.getIsMeLeader(group, leader));

        assertEquals(1, details.removeLeader(group, leader));
        assertEquals(1, details.grantLeader(group, target));
        assertEquals(0, details.getIsMeLeader(group, leader));
        assertEquals(1, details.getIsMeLeader(group, target));
        assertEquals(0, details.grantLeader(group, target));
        details.groupQuit(group, leader);
        assertEquals(0, groups.countGroupMember(group, leader));
        assertEquals(1, groups.countGroupMembers(group));
    }

    @Test
    void onlyLeaderCanKickNonleaderInSameGroup() {
        Long group = group();
        Long leader = member();
        Long target = member();
        Long outsider = member();
        membership(group, leader, 1);
        membership(group, target, 0);
        assertEquals(0, details.kickMember(group, outsider, target));
        assertEquals(0, details.kickMember(group, target, leader));
        assertEquals(1, details.kickMember(group, leader, target));
        assertEquals(0, groups.countGroupMember(group, target));
        assertEquals(1, groups.countGroupMember(group, leader));
    }
}
