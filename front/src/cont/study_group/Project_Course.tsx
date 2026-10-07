import React, { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Panel,
    Node,
    Edge,
    OnConnect,
    NodeMouseHandler,
    Connection,
    EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './project.module.css'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

export interface CustomNodeData extends Record<string, unknown> {
    label: string;
}
export interface DiagramData {
    nodes: AppNode[];
    edges: AppEdge[];
}
export interface DiagramSaveRequest {
    groupnum: number;
    title: string;
    diagram_data: string;
}
export interface DiagramResponse {
    group_num: number;
    title: string;
    diagram_data: string;
    created_at: string;
    updated_at?: string;
}
// export interface DiagramResponse {
//     diagram_num: number;
//     group_num: number;
//     title: string;
//     diagram_data: string;
//     created_at: string;
//     updated_at?: string;
// }
export type AppNode = Node<CustomNodeData>;
export type AppEdge = Edge;

const initialNodes: AppNode[] = [];

const initialEdges: AppEdge[] = [];

const backendUrl = process.env.REACT_APP_BACK_END_URL;

export const Project_Course: React.FC = () => {

    const [diagramTitle, setDiagramTitle] = useState<string>('새 다이어그램');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

    // 현재 클릭/선택된 노드 상태
    const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<AppEdge | null>(null);
    const [nodeNameInput, setNodeNameInput] = useState<string>('');

    const [searchParams, setSearchParams] = useSearchParams();
    const [groupnum, setGroupnum] = useState<number>(1)

    const gnum = searchParams.get('group_num');

    if (gnum !== null) {
        setGroupnum(parseInt(gnum))
    }
    // 1. 화살표(Edge) 연결
    const onConnect: OnConnect = useCallback(
        (connection: Connection) =>
            setEdges((eds: AppEdge[]) =>
                addEdge(
                    {
                        ...connection,
                        type: 'smoothstep',
                        markerEnd: { type: 'arrowclosed' },
                    },
                    eds
                )
            ),
        [setEdges]
    );

    // 2. 새 노드 추가
    const handleAddNode = (): void => {
        const newNodeId = `node-${Date.now()}`;

        const newNode: AppNode = {
            id: newNodeId,
            position: {
                x: Math.random() * 300 + 50,
                y: Math.random() * 300 + 50,
            },
            data: {
                label: `새 노드 ${nodes.length + 1}`,
            },
        };

        setNodes((nds) => nds.concat(newNode));
    };

    // 3. 노드 클릭 이벤트
    const onNodeClick: NodeMouseHandler<AppNode> = useCallback((_event, node: AppNode) => {
        setSelectedNode(node);
        setSelectedEdge(null); // 엣지 선택 해제
        setNodeNameInput(node.data.label);
    }, []);

    // 4. 화살표(Edge) 클릭 이벤트
    const onEdgeClick: EdgeMouseHandler<AppEdge> = useCallback((_event, edge: AppEdge) => {
        setSelectedEdge(edge);
        setSelectedNode(null); // 노드 선택 해제
        setNodeNameInput('');
    }, []);

    // 5. 선택된 노드 또는 화살표 삭제 함수 (핵심!)
    const handleDeleteSelected = (): void => {
        // 5-1. React Flow의 selected 속성을 활용한 일괄 삭제 (UI 및 키보드 선택 모두 대응)
        setNodes((nds: AppNode[]) => nds.filter((node: AppNode) => !node.selected && node.id !== selectedNode?.id));

        setEdges((eds: AppEdge[]) =>
            eds.filter((edge: AppEdge) => {
                // 선택된 엣지 자체 삭제
                if (edge.selected || edge.id === selectedEdge?.id) return false;
                // 삭제되는 노드에 연결되어 있던 엣지도 함께 삭제
                if (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)) {
                    return false;
                }
                return true;
            })
        );

        // 선택 상태 초기화
        setSelectedNode(null);
        setSelectedEdge(null);
        setNodeNameInput('');
    };

    // 6. 노드 이름 변경
    const handleUpdateNodeName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newText = e.target.value;
        setNodeNameInput(newText);

        if (!selectedNode) return;

        setNodes((nds: AppNode[]) =>
            nds.map((node: AppNode) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: newText,
                        },
                    };
                }
                return node;
            })
        );
    };

    // 캔버스 빈 영역 클릭 시 선택 해제
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
        setNodeNameInput('');
    }, []);

    // 삭제 버튼 활성화 조건 (노드나 엣지 또는 React Flow 내부 selected 항목이 있을 때)
    const isAnythingSelected =
        Boolean(selectedNode) ||
        Boolean(selectedEdge) ||
        nodes.some((n: AppNode) => n.selected) ||
        edges.some((e: AppEdge) => e.selected);



    const handleSaveDiagram = async (): Promise<void> => {
        if (!diagramTitle.trim()) {
            alert('다이어그램 제목을 입력해주세요.');
            return;
        }

        const diagramData: DiagramData = {
            nodes,
            edges,
        };

        const requestData: DiagramSaveRequest = {
            groupnum: groupnum,
            title: diagramTitle.trim(),
            diagram_data: JSON.stringify(diagramData),
        };

        try {
            setIsSaving(true);

            const response = await axios.post<DiagramResponse>(
                `http://192.168.0.11/back/api/diagram/add`,
                requestData
            );

            console.log('저장 완료:', response.data);

            alert('다이어그램이 저장되었습니다.');
        } catch (error) {
            console.error('다이어그램 저장 실패:', error);

            alert('다이어그램 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // useEffect(() => {
    //     const response = axios.get(
    //         `${backendUrl}/api/diagram/get/{}`
    //     )


    // }, [])

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>진행 다이어그램</h3>
                <p className={styles.section_desc}>
                    노드를 생성하고 연결하여 목표 계획 진행 구조를 시각적으로 관리할 수 있습니다.
                </p>

                {/* React Flow 캔버스 */}
                <div className={styles.diagram_canvas_wrapper}>
                    <ReactFlow<AppNode, AppEdge>
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        fitView
                    >
                        <Background gap={16} size={1} />

                        <Controls />

                        <MiniMap />

                        {/* React Flow 우상단 도구 패널 */}
                        <Panel
                            position="top-right"
                            className={styles.diagram_panel}
                        >
                            <div className={styles.diagram_panel_header}>
                                <strong>다이어그램 편집</strong>
                            </div>

                            {/* 다이어그램 제목 */}
                            <div className={styles.diagram_field}>
                                <label htmlFor="diagram-title">
                                    제목
                                </label>

                                <input
                                    id="diagram-title"
                                    type="text"
                                    value={diagramTitle}
                                    onChange={(e) =>
                                        setDiagramTitle(e.target.value)
                                    }
                                    placeholder="다이어그램 제목"
                                />
                            </div>

                            <div className={styles.diagram_button_group}>
                                <button
                                    type="button"
                                    className={styles.primary_button}
                                    onClick={handleAddNode}
                                >
                                    + 새 노드
                                </button>

                                <button
                                    type="button"
                                    className={styles.delete_button}
                                    onClick={handleDeleteSelected}
                                    disabled={!isAnythingSelected}
                                >
                                    선택 삭제
                                </button>
                            </div>

                            {/* 선택된 Node */}
                            {selectedNode && (
                                <div className={styles.selected_item}>
                                    <div className={styles.selected_item_title}>
                                        선택된 노드
                                    </div>

                                    <div className={styles.selected_item_id}>
                                        ID: {selectedNode.id}
                                    </div>

                                    <label htmlFor="node-name-input">
                                        노드 이름
                                    </label>

                                    <input
                                        id="node-name-input"
                                        type="text"
                                        value={nodeNameInput}
                                        onChange={handleUpdateNodeName}
                                    />
                                </div>
                            )}

                            {/* 선택된 Edge */}
                            {selectedEdge && (
                                <div className={styles.selected_item}>
                                    <div className={styles.selected_item_title}>
                                        선택된 연결선
                                    </div>

                                    <div className={styles.selected_item_id}>
                                        {selectedEdge.source}
                                        {' → '}
                                        {selectedEdge.target}
                                    </div>
                                </div>
                            )}

                            {!selectedNode && !selectedEdge && (
                                <div className={styles.no_selection}>
                                    노드나 연결선을 선택하면 편집할 수 있습니다.
                                </div>
                            )}

                            <button
                                type="button"
                                className={styles.save_button}
                                onClick={handleSaveDiagram}
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? '저장 중...'
                                    : '다이어그램 저장'}
                            </button>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </div>

    )
}