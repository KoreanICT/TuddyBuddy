//최솔
import axios from 'axios';

export interface Category { categoryId: number; categoryName: string; }
export interface Subject { subjectId: number; categoryId: number; subjectName: string; }


const notConnected = (): never => {
  throw new Error('관리자 API 연결 전입니다. SelfStudyAdminController의 실제 매핑을 확인하세요.');
};

export const selfStudyAdminApi = {
  categories: async (): Promise<Category[]> => notConnected(),
  subjects: async (): Promise<Subject[]> => notConnected(),
  createCategory: async (_name: string): Promise<void> => notConnected(),
  updateCategory: async (_id: number, _name: string): Promise<void> => notConnected(),
  createSubject: async (_categoryId: number, _name: string): Promise<void> => notConnected(),
  updateSubject: async (_id: number, _name: string): Promise<void> => notConnected(),
};
