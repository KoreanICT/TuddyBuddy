package kr.co.ictedu.back.member;

import static org.mockito.Mockito.verifyNoInteractions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import kr.co.ictedu.back.point.dao.PointDao;
import kr.co.ictedu.back.point.service.PointService;

@ExtendWith(MockitoExtension.class)
class ReferralOptionalUnitTest {
    @Mock PointDao dao;
    @InjectMocks PointService points;

    @Test
    void absentReferralNeverChangesBalanceOrHistory() {
        points.addReferralReward(null, "회원가입 추천인 보상");
        points.addReferralReward("", "회원가입 추천인 보상");
        points.addReferralReward("  ", "회원가입 추천인 보상");
        verifyNoInteractions(dao);
    }
}
