import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BoardManagement from './board/BoardManagement';
import AdminSidebar from '../../layout/admin/AdminSidebar';
import { reportNotificationLink } from '../../notification/reportNotificationLink';
import ReportReplyDetail from '../report/ReportReplyDetail';
import StudyManagement from './study_group/StudyManagement';

jest.mock('axios');
jest.mock('../../login/authHttp', () => ({ BACKEND_URL: 'http://backend.test/back' }));
jest.mock('../../login/hooks/useAuth', () => ({useAuth: () => ({token: 'test-token', memberNum: 1})}));
jest.mock('../../login/hooks/useRoleAccess', () => ({useRoleAccess: () => ({hasRole: () => true})}));
jest.mock('../../login/auth/RoleGate', () => ({__esModule: true, default: ({children}: any) => children}));
jest.mock('react-router-dom', () => ({
    useLocation: () => ({pathname: '/admin'}),
    useParams: () => ({id: '7'}),
    useNavigate: () => jest.fn(),
    Link: ({to, children}: any) => <a href={to}>{children}</a>,
    NavLink: ({to, children}: any) => <a href={to}>{children}</a>,
}));
const http = axios as jest.Mocked<typeof axios>;
beforeEach(() => jest.clearAllMocks());

test('게시판의 실제 조회 결과를 표시하고 검색 조건을 전송한다', async () => {
    http.get.mockResolvedValue({data: {data: [{postNum: 7, title: '테스트 게시글', content: '본문', author: '회원', category: '꿀팁', createdAt: '2026-10-26'}], totalItems: 1, totalPages: 1, currentPage: 1}});
    render(<BoardManagement />);
    expect(await screen.findByText('테스트 게시글')).toBeInTheDocument();
    expect(screen.queryByText('본문')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: '상세보기'}));
    expect(screen.getByRole('dialog', {name: '게시글 상세'})).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByText('본문')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: '닫기'}));
    expect(screen.queryByText('본문')).not.toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe('hidden');
    fireEvent.change(screen.getByLabelText('제목·작성자 검색'), {target: {value: '회원'}});
    fireEvent.click(screen.getByRole('button', {name: '검색'}));
    await waitFor(() => expect(http.get).toHaveBeenLastCalledWith(expect.stringContaining('/api/admin/board'),
        expect.objectContaining({params: {page: 1, keyword: '회원'}})));
});

test('게시글 삭제는 확인 후 실제 삭제 API를 호출하고 목록을 갱신한다', async () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    http.get.mockResolvedValueOnce({data: {data: [{postNum: 7, title: '삭제 대상', content: '', author: '', category: '', createdAt: ''}], totalItems: 1, totalPages: 1, currentPage: 1}})
        .mockResolvedValue({data: {data: [], totalItems: 0, totalPages: 0, currentPage: 1}});
    http.delete.mockResolvedValue({data: {success: true}});
    render(<BoardManagement />);
    fireEvent.click(await screen.findByRole('button', {name: '삭제'}));
    await waitFor(() => expect(http.delete).toHaveBeenCalledWith(expect.stringContaining('/api/admin/board/7'), expect.anything()));
    expect(await screen.findByText('조회된 게시글이 없습니다.')).toBeInTheDocument();
    confirm.mockRestore();
});

test('대기 신고가 있을 때 ! 표시, 처리 후 갱신하면 제거', async () => {
    http.get.mockResolvedValueOnce({data: {total: 2}}).mockResolvedValue({data: {total: 0}});
    const view = render(<AdminSidebar />);
    expect(await screen.findByLabelText('처리 대기 신고 2건')).toHaveTextContent('!');
    fireEvent(window, new Event('report-status-changed'));
    await waitFor(() => expect(screen.queryByLabelText('처리 대기 신고 2건')).not.toBeInTheDocument());
    view.unmount();
});

test('신고 알림 링크는 허용된 내부 경로만 사용한다', () => {
    expect(reportNotificationLink('REPORT', '/report/replyDetail/7')).toBe('/report/replyDetail/7');
    expect(reportNotificationLink('REPORT', '/admin/reportDetail/7')).toBe('/admin/reportDetail/7');
    expect(reportNotificationLink('REPORT', 'https://external.test')).toBeNull();
    expect(reportNotificationLink('REPORT', '//external.test')).toBeNull();
    expect(reportNotificationLink('REPORT', '/admin/reportDetail/0')).toBeNull();
});

test('답변이 없는 상태 변경 알림도 신고 상태를 확인할 수 있다', async () => {
    http.get.mockImplementation((url: any) => Promise.resolve({data: String(url).endsWith('/reportDetail')
        ? {num: 7, member_num: 1, type: 'report', category: '문의', content: '신고 내용', status: 'REVIEWING', created_date: '2026-10-26'}
        : null}));
    render(<ReportReplyDetail />);
    expect(await screen.findByText('검토 중')).toBeInTheDocument();
    expect(screen.getByText('아직 답변이 등록되지 않았습니다.')).toBeInTheDocument();
});

test('스터디 관리에서 실제 데이터만 표시하고 삭제 확인 취소 시 요청하지 않는다', async () => {
    http.get.mockResolvedValue({data: {data: [{groupNum: 3, title: '실제 스터디', description: '설명', leader: '방장', isPrivate: 1, currentMembers: 2, maxMembers: 5, createdAt: '2026-10-26'}], totalItems: 1, totalPages: 1, currentPage: 1}});
    render(<StudyManagement />);
    expect(await screen.findByText('실제 스터디')).toBeInTheDocument();
    expect(screen.getByText('비공개')).toBeInTheDocument();
    expect(screen.queryByText('운영 중')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'실제 스터디 삭제'}));
    expect(screen.getByRole('alertdialog',{name:'정말 삭제하겠습니까?'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'취소'})).toHaveFocus();
    fireEvent.click(screen.getByRole('button',{name:'취소'}));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(http.delete).not.toHaveBeenCalled();
});

test('스터디 삭제 확인 후 API 호출과 목록 갱신', async () => {
    http.get.mockResolvedValueOnce({data: {data: [{groupNum: 3, title: '삭제할 스터디', leader: '방장', isPrivate: 0, currentMembers: 2, maxMembers: 5}], totalItems: 1, totalPages: 1, currentPage: 1}})
        .mockResolvedValue({data: {data: [], totalItems: 0, totalPages: 0, currentPage: 1}});
    http.delete.mockResolvedValue({data: {success:true}});
    render(<StudyManagement />);
    fireEvent.click(await screen.findByRole('button',{name:'삭제할 스터디 삭제'}));
    expect(http.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'삭제하기'}));
    await waitFor(() => expect(http.delete).toHaveBeenCalledWith(expect.stringContaining('/api/admin/studies/3'),expect.anything()));
    expect(await screen.findByText('조회된 스터디가 없습니다.')).toBeInTheDocument();
});
