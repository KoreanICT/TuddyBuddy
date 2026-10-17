package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import kr.co.ictedu.back.group.dao.MemoDao;
import kr.co.ictedu.back.group.vo.MemoVO;

class MemoCrudTest extends GroupCrudFixtures {
    @Autowired private MemoDao memos;

    @Test
    void createsListsReadsUpdatesAndDeletesMemo() {
        Long group = group();
        Long member = member();
        membership(group, member, 1);
        MemoVO memo = new MemoVO();
        memo.setGroup_num(group);
        memo.setMember_num(member);
        memo.setMemo_content("fixture memo");
        memos.addMemo(memo);
        Long id = memo.getMemo_num();
        assertNotNull(id);
        assertEquals("fixture memo", memos.getMemoById(id, member).getMemo_content());
        assertEquals(1, memos.getMemos(group, member).size());
        assertEquals(1, memos.getMemos(group, member).get(0).getCan_manage());

        MemoVO patch = new MemoVO();
        patch.setMemo_content("changed memo");
        memos.patchMemo(id, patch);
        assertEquals("changed memo", memos.getMemoById(id, member).getMemo_content());
        assertNotNull(memos.getMemoById(id, member).getUpdated_at());
        memos.deleteMemo(id);
        assertNull(memos.getMemoById(id, member));
        assertTrue(memos.getMemos(group, member).isEmpty());
    }
}
