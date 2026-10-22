package kr.co.ictedu.back.group;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.dao.GroupDetailDao;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.GroupMemberVO;
import kr.co.ictedu.back.group.vo.TagVO;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.support.CoreCrudFixtures;

/** Isolated Oracle fixtures; every test transaction rolls back its own rows. */
@SpringBootTest
@Transactional
abstract class GroupCrudFixtures {
    @Autowired protected MemberDAO members;
    @Autowired protected GroupDao groups;
    @Autowired protected GroupDetailDao details;

    protected String unique() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    protected Long member() {
        return CoreCrudFixtures.member(members, "MEMBER");
    }

    protected Long group() {
        GroupVO row = new GroupVO();
        row.setGroup_title("fixture group");
        row.setGroup_desc("fixture description");
        row.setGroup_isPrivate("0");
        row.setGroup_maxMembers(10);
        row.setGroup_invitecode(unique());
        row.setGroup_thumbnail("fixture.png");
        groups.addGroup(row);
        return groups.findGroupByInviteCode(row.getGroup_invitecode()).getGroup_num();
    }

    protected Long tag() {
        TagVO row = new TagVO();
        row.setTag_name(unique());
        row.setTag_color("#123456");
        groups.addTag(row);
        return groups.findTagByName(row.getTag_name()).getTag_num();
    }

    protected void membership(Long group, Long member, int leader) {
        GroupMemberVO row = new GroupMemberVO();
        row.setGroup_num(group);
        row.setMember_num(member);
        row.setIs_leader(leader);
        groups.addGroupMember(row);
    }
}
