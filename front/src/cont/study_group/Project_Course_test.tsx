import React, { useState, useCallback } from 'react';
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
export interface CustomNodeData extends Record<string, unknown> {
    label: string;
}
export interface DiagramData {
    nodes: AppNode[];
    edges: AppEdge[];
}
export interface DiagramSaveRequest {
    group_num: number;
    title: string;
    diagram_data: string;
}
export interface DiagramResponse {
    diagram_num: number;
    group_num: number;
    title: string;
    diagram_data: string;
    created_at: string;
    updated_at?: string;
}
export type AppNode = Node<CustomNodeData>;
export type AppEdge = Edge;

const initialNodes: AppNode[] = [
    {
        id: 'node-1',
        position: { x: 100, y: 100 },
        data: { label: '시작 노드' },
    },
    {
        id: 'node-2',
        position: { x: 350, y: 100 },
        data: { label: '두 번째 노드' },
    },
];

const initialEdges: AppEdge[] = [
    {
        id: 'edge-1-2',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
        markerEnd: { type: 'arrowclosed' },
    },
];

export const Project_Course_test: React.FC = () => {

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

    // 현재 클릭/선택된 노드 상태
    const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<AppEdge | null>(null);
    const [nodeNameInput, setNodeNameInput] = useState<string>('');

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
        const newNodeId = `node-${nodes.length + 1}`;
        const newNode: AppNode = {
            id: newNodeId,
            position: {
                x: Math.random() * 300 + 50,
                y: Math.random() * 300 + 50,
            },
            data: { label: `새 노드 ${nodes.length + 1}` },
        };

        setNodes((nds: AppNode[]) => nds.concat(newNode));
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

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>해야할 일</h3>
                <p className={styles.section_desc}>
                    각자가 해야할 일을 일일별로 등록하거나, 멤버별로 등록할 수 있는 공간입니다.
                </p>
                <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
                    {/* 사이드바 패널 */}
                    <div
                        style={{
                            width: '260px',
                            padding: '20px',
                            borderRight: '1px solid #e0e0e0',
                            backgroundColor: 'transparent',
                            boxSizing: 'border-box',
                            zIndex: 10,
                        }}
                    >

                        <button
                            onClick={handleAddNode}
                            style={{
                                width: '180px',
                                padding: '10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                            }}
                        >
                            + 새 노드 생성
                        </button>

                        {/* 🗑️ 삭제 버튼 */}
                        <button
                            onClick={handleDeleteSelected}
                            disabled={!isAnythingSelected}
                            style={{
                                width: '180px',
                                padding: '10px',
                                backgroundColor: isAnythingSelected ? '#dc3545' : '#e0e0e0',
                                color: isAnythingSelected ? 'white' : '#a0a0a0',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isAnythingSelected ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            🗑️ 선택한 항목 삭제
                        </button>

                        {/* 선택 항목 상세 설정 */}
                        {selectedNode ? (
                            <div>
                                <h4>선택된 노드 설정</h4>
                                <p style={{ fontSize: '14px', color: '#555' }}>
                                    <strong>Node ID:</strong> {selectedNode.id}
                                </p>
                                <label
                                    htmlFor="node-name-input"
                                    style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}
                                >
                                    노드 이름 변경:
                                </label>
                                <input
                                    id="node-name-input"
                                    type="text"
                                    value={nodeNameInput}
                                    onChange={handleUpdateNodeName}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        ) : selectedEdge ? (
                            <div>
                                <h4>선택된 화살표 설정</h4>
                                <p style={{ fontSize: '14px', color: '#555' }}>
                                    <strong>Edge ID:</strong> {selectedEdge.id}
                                </p>
                                <p style={{ fontSize: '13px', color: '#666' }}>
                                    `{selectedEdge.source}` ➔ `{selectedEdge.target}`
                                </p>
                            </div>
                        ) : (
                            <p style={{ color: '#888', fontSize: '14px' }}>
                                노드나 화살표를 클릭하면 선택 및 삭제할 수 있습니다. (키보드 <kbd>Delete</kbd> 키도 지원)
                            </p>
                        )}
                    </div>

                    {/* React Flow 캔버스 */}
                    <div style={{ flex: 1, height: '100%' }}>
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
                        </ReactFlow>
                    </div>
                </div>
            </div>
        </div>
    )
}