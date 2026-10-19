package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import kr.co.ictedu.back.group.dto.GroupListDTO;
import kr.co.ictedu.back.group.dto.GroupUpdateDTO;
import kr.co.ictedu.back.group.dto.PublicGroupListDTO;
import kr.co.ictedu.back.group.vo.GroupVO;

class StudygroupCrudTest extends GroupCrudFixtures {
    @Test
    void createsReadsUpdatesAndDeletesGroup() {
        GroupVO group = new GroupVO();
        group.setGroup_title("crud group");
        group.setGroup_desc("initial description");
        group.setGroup_isPrivate("0");
        group.setGroup_maxMembers(5);
        group.setGroup_thumbnail("fixture.png");
        group.setGroup_invitecode(unique());
        groups.addGroup(group);

        assertNotNull(group.getGroup_num());
        Long id = group.getGroup_num();
        assertEquals(id, groups.findGroupByInviteCode(group.getGroup_invitecode()).getGroup_num());
        assertEquals("initial description", details.getDetail(id).getGroup_desc());

        GroupUpdateDTO patch = new GroupUpdateDTO();
        patch.setGroup_title("updated group");
        patch.setGroup_desc("updated description");
        details.updateGroup(id, patch);
        assertEquals("updated group", details.getDetail(id).getGroup_title());
        assertEquals("fixture.png", details.getDetail(id).getGroup_thumbnail());
        patch.setGroup_thumbnail("updated.png");
        details.updateGroup(id, patch);
        assertEquals("updated.png", details.getDetail(id).getGroup_thumbnail());

        details.deleteGroup(id);
        assertNull(details.getDetail(id));
        assertNull(groups.findGroupByInviteCode(group.getGroup_invitecode()));
    }

    @Test
    @SuppressWarnings("unchecked")
    void proceduresIncludeOwnGroupAndExcludeItFromPublicGroups() {
        Long member = member();
        Long own = group();
        Long available = group();
        membership(own, member, 1);
        Map<String, Object> mine = new HashMap<>();
        mine.put("member_num", member);
        groups.getMyGroupsProc(mine);
        List<GroupListDTO> owned = (List<GroupListDTO>) mine.get("group_cursor");
        assertTrue(owned.stream().anyMatch(g -> own.equals(g.getGroup_num())));
        assertFalse(owned.stream().anyMatch(g -> available.equals(g.getGroup_num())));

        Map<String, Object> publicGroups = new HashMap<>();
        publicGroups.put("member_num", member);
        groups.getPublicGroupsProc(publicGroups);
        List<PublicGroupListDTO> rows = (List<PublicGroupListDTO>) publicGroups.get("group_cursor");
        assertTrue(rows.stream().anyMatch(g -> available.equals(g.getGroup_num())));
        assertFalse(rows.stream().anyMatch(g -> own.equals(g.getGroup_num())));
    }
}
