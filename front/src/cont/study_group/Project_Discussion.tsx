import React from 'react'

interface QuestionList {
    questionid: number,
    groupid: number,
    memberid: number,
    created_at: string,
    updated_at: string,
    document_type: string,

}

interface QuestionDetail {

}

const Project_Discussion: React.FC = () => {

    
    return (
        <div>
            <h1>여기는 문서를 업로드 하여 질문과 답변을 할 수 있는 토론 컴포넌트입니다.</h1>
        </div>
    )
}

export default Project_Discussion