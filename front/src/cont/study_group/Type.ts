import { Edge, Node } from "@xyflow/react";
import { CustomNodeData } from "./GroupAPI";

export type DetailTab = 'overview' | 'memo' | 'member' | 'calendar' | 'course' | 'discussion' | 'board' | 'document';

export type TDLStatus = 'To Do' | 'In Progress' | 'Done'

export type Repeat_type = null | 'Daily' | 'Weekly'

export type AppNode = Node<CustomNodeData>;
export type AppEdge = Edge;