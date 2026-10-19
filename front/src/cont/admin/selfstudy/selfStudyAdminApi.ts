//최솔
import axios from 'axios';
import { BACKEND_URL, installAuthInterceptors } from '../../../login/authHttp';

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryStatus: 'Y' | 'N';
}
export interface Subject {
  subjectId: number;
  categoryId: number;
  subjectName: string;
  subjectStatus: 'Y' | 'N';
}
export interface SelfStudyUsage {
  summary: {
    generatedCount: number;
    participantCount: number;
    submittedCount: number;
    averageScore: number;
  };
  dailyTrend: { date: string; generatedCount: number; submittedCount: number }[];
  categoryRanking: { categoryId: number; categoryName: string; generatedCount: number }[];
  subjectRanking: { subjectId: number; subjectName: string; categoryName: string; generatedCount: number }[];
}

type CategoryDto = { category_id: number; category_name: string; category_status: 'Y' | 'N' };
type SubjectDto = { subject_id: number; category_id: number; subject_name: string; subject_status: 'Y' | 'N' };
type Status = 'Y' | 'N';

const BASE_URL = `${BACKEND_URL}/api/selfstudy/admin`;
const client = axios.create({ baseURL: BASE_URL });
installAuthInterceptors(client);

const mapCategory = (c: CategoryDto): Category => ({ categoryId: c.category_id, categoryName: c.category_name, categoryStatus: c.category_status });
const mapSubject = (s: SubjectDto): Subject => ({ subjectId: s.subject_id, categoryId: s.category_id, subjectName: s.subject_name, subjectStatus: s.subject_status });

export const adminErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return '로그인이 필요합니다. 다시 로그인해주세요.';
    if (error.response?.status === 403) return 'ADMIN 권한이 없습니다.';
    const data = error.response?.data;
    if (typeof data?.message === 'string' && data.message) return data.message;
    if (typeof data?.detail === 'string' && data.detail) return data.detail;
    return `관리자 API 요청 실패 (${error.response?.status ?? '서버 연결 오류'})`;
  }
  return error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
};

export const selfStudyAdminApi = {
  categories: async (): Promise<Category[]> => (await client.get<CategoryDto[]>('/categories')).data.map(mapCategory),
  subjects: async (): Promise<Subject[]> => (await client.get<SubjectDto[]>('/subjects')).data.map(mapSubject),
  usage: async (from: string, to: string): Promise<SelfStudyUsage> =>
    (await client.get<SelfStudyUsage>('/usage', { params: { from, to } })).data,
  createCategory: async (name: string): Promise<void> => { await client.post('/categories', { category_name: name }); },
  updateCategory: async (id: number, name: string): Promise<void> => { await client.put(`/categories/${id}`, { category_name: name }); },
  setCategoryStatus: async (id: number, status: Status): Promise<void> => { await client.patch(`/categories/${id}/status`, { status }); },
  createSubject: async (categoryId: number, name: string): Promise<void> => { await client.post('/subjects', { category_id: categoryId, subject_name: name }); },
  updateSubject: async (id: number, name: string): Promise<void> => { await client.put(`/subjects/${id}`, { subject_name: name }); },
  setSubjectStatus: async (id: number, status: Status): Promise<void> => { await client.patch(`/subjects/${id}/status`, { status }); },
};
