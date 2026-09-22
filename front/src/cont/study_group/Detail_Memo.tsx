import React from 'react';
import styles from './detail.module.css';
import { motion } from "motion/react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core"
import { Detail_Memoboard } from './Detail_Memoboard';
//@dnd-kit/core : 코어 라이브러리
//@dnd-kit/sortable : 정렬 기능
//@dnd-kit/utilities : 유틸리티
export const Detail_Memo: React.FC = () => {

    const Draggable = () => {
        const ref = useDraggable
    }
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>메모</h3>
                <p className={styles.section_desc}>
                    자유롭게 공부를 하다 생긴 질문이나 이해한 점을 작성하는 공간입니다.
                </p>
                {/*현재 공사중*/}
                <div>
                    <Detail_Memoboard />
                </div>
            </div>
        </div>
    )
}