'use client';

import React, { useState } from 'react';
import {
    Button,
    Card,
    Checkbox,
    Modal,
    Progress,
    Tag,
    Input,
    DatePicker,
    Space,
    Avatar,
    Select,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

type Task = {
    id: number;
    title: string;
    assignee: string;
    type: string;
    completed: boolean;
    due: string;
    dueDate?: string;
};

type Project = {
    color?: string;
    project_id: string;
    title: string;
    description: string;
    due_date: string;
    progress: number;
    tasks: Task[];
};

const priorityColor: { [key: string]: string } = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
    default: '#6b7280',
};

const assignees = [
    { label: 'John', value: 'john' },
    { label: 'Sarah', value: 'sarah' },
    { label: 'Emma', value: 'emma' },
    { label: 'Liam', value: 'liam' },
    { label: 'All', value: 'all' },
];

interface Props {
    title?: string;
    projects?: Project[];
    onAddProject?: (project: {
        title: string;
        description: string;
        due_date: string;
    }) => void;
    onAddTask?: (projectId: string) => void;
    onToggleTask?: (projectId: string, taskId: number) => void;
    onUpdateTask?: (task: Task) => void;
    showAssigneeInputInEdit?: boolean;
    showAvatarInTask?: boolean;
}

const FamilyTasksComponent: React.FC<Props> = ({
    title = 'Family Tasks & Projects',
    projects = [],
    onAddProject,
    onAddTask,
    onToggleTask,
    onUpdateTask,
    showAssigneeInputInEdit = true,
    showAvatarInTask = true,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        due_date: '',
    });
    const [editingTask, setEditingTask] = useState<{
        projectId: string;
        task: Task | null;
    }>({
        projectId: '',
        task: null,
    });

    return (
        <Card style={{ padding: 24, borderRadius: 12 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                }}
            >
                <h2
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 20,
                        fontWeight: 600,
                    }}
                >
                    <CheckSquareOutlined /> {title}
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ height: 40, padding: '0 16px' }}
                    onClick={() => setModalVisible(true)}
                >
                    Add Project
                </Button>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 24,
                }}
            >
                {Array.isArray(projects) && projects.length > 0 ? (
                    projects.map((proj) => (
                        <Card
                            key={proj.project_id}
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: '#667eea',
                                        }}
                                    />
                                    <span>{proj.title}</span>
                                </div>
                            }
                            style={{
                                borderRadius: 12,
                                minHeight: 360,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                            }}
                            styles={{ body: { padding: 20 } }}
                        >
                            <div
                                style={{
                                    fontSize: 13,
                                    color: '#64748b',
                                    marginBottom: 8,
                                }}
                            >
                                {proj.description}
                            </div>
                            <Tag color="blue">
                                Due: {dayjs(proj.due_date).format('MMM D, YYYY')}
                            </Tag>
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: '#64748b',
                                        }}
                                    >
                                        Progress
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {proj.progress}%
                                    </span>
                                </div>
                                <Progress
                                    percent={proj.progress}
                                    showInfo={false}
                                    strokeColor="#667eea"
                                />
                            </div>

                            <div
                                style={{
                                    maxHeight: 160,
                                    overflowY: 'auto',
                                    marginTop: 12,
                                }}
                            >
                                {proj.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 12px',
                                            background: task.completed
                                                ? '#f0fdf4'
                                                : '#f8fafc',
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            border: `1px solid ${task.completed
                                                ? '#dcfce7'
                                                : '#e2e8f0'
                                                }`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                flex: 1,
                                            }}
                                        >
                                            <Checkbox
                                                checked={task.completed}
                                                onChange={() =>
                                                    onToggleTask?.(
                                                        proj.project_id,
                                                        task.id
                                                    )
                                                }
                                                style={{ transform: 'scale(0.9)' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        textDecoration: task.completed
                                                            ? 'line-through'
                                                            : 'none',
                                                        color: task.completed
                                                            ? '#6b7280'
                                                            : '#1e293b',
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {task.title}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: '#94a3b8',
                                                        display: 'flex',
                                                        gap: 6,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 4,
                                                            height: 4,
                                                            borderRadius: '50%',
                                                            backgroundColor:
                                                                priorityColor[task.type] ||
                                                                priorityColor.default,
                                                        }}
                                                    />
                                                    {task.due}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            {showAvatarInTask && (
                                                <Avatar
                                                    size={24}
                                                    style={{
                                                        background:
                                                            priorityColor[task.type],
                                                    }}
                                                >
                                                    {task.assignee[0]}
                                                </Avatar>
                                            )}
                                            <EditOutlined
                                                onClick={() => {
                                                    setEditingTask({
                                                        projectId: proj.project_id,
                                                        task,
                                                    });
                                                    setEditTaskModal(true);
                                                }}
                                                style={{
                                                    fontSize: 14,
                                                    cursor: 'pointer',
                                                    color: '#94a3b8',
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() =>
                                        onAddTask?.(proj.project_id)
                                    }
                                    style={{ fontWeight: 500 }}
                                >
                                    + Add task
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div style={{ color: '#999', textAlign: 'center' }}>
                        No projects available.
                    </div>
                )}
            </div>

            {/* Add Project Modal */}
            <Modal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => {
                    if (newProject.title && onAddProject) {
                        onAddProject(newProject);
                        setModalVisible(false);
                        setNewProject({
                            title: '',
                            description: '',
                            due_date: '',
                        });
                    }
                }}
                okText="Add Project"
                closable={false}
            >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Input
                        placeholder="Project Name"
                        value={newProject.title}
                        onChange={(e) =>
                            setNewProject({
                                ...newProject,
                                title: e.target.value,
                            })
                        }
                    />
                    <Input.TextArea
                        placeholder="Description"
                        rows={4}
                        value={newProject.description}
                        onChange={(e) =>
                            setNewProject({
                                ...newProject,
                                description: e.target.value,
                            })
                        }
                    />
                    <DatePicker
                        placeholder="Due Date"
                        style={{ width: '100%' }}
                        value={
                            newProject.due_date
                                ? dayjs(newProject.due_date)
                                : null
                        }
                        disabledDate={(current) =>
                            current && current < dayjs().startOf('day')
                        }
                        onChange={(_, dateString) => {
                            const dateStr = Array.isArray(dateString)
                                ? dateString[0] ?? ''
                                : dateString;
                            setNewProject({
                                ...newProject,
                                due_date: dateStr,
                            });
                        }}
                    />
                </Space>
            </Modal>

            {/* Edit Task Modal */}
            <Modal
                open={editTaskModal}
                onCancel={() => setEditTaskModal(false)}
                onOk={() => {
                    if (editingTask.task && onUpdateTask) {
                        onUpdateTask(editingTask.task);
                        setEditTaskModal(false);
                    }
                }}
                okText="Save"
                closable={false}
            >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Input
                        placeholder="Task Name"
                        value={editingTask.task?.title}
                        onChange={(e) =>
                            setEditingTask((prev) => ({
                                ...prev,
                                task:
                                    prev.task && {
                                        ...prev.task,
                                        title: e.target.value,
                                    },
                            }))
                        }
                    />
                    <DatePicker
                        placeholder="Due Date"
                        style={{ width: '100%' }}
                        value={
                            editingTask.task?.dueDate
                                ? dayjs(editingTask.task.dueDate)
                                : null
                        }
                        disabledDate={(current) =>
                            current && current < dayjs().startOf('day')
                        }
                        onChange={(_, dateString) => {
                            const dateStr = Array.isArray(dateString)
                                ? dateString[0] ?? ''
                                : dateString;
                            setEditingTask((prev) => ({
                                ...prev,
                                task:
                                    prev.task && {
                                        ...prev.task,
                                        dueDate: dateStr,
                                        due: dateStr
                                            ? `Due ${dayjs(dateStr).format(
                                                'MMM D'
                                            )}`
                                            : prev.task.due,
                                    },
                            }));
                        }}
                    />
                    {showAssigneeInputInEdit && (
                        <Select
                            placeholder="Select Assignee"
                            value={editingTask.task?.assignee}
                            onChange={(val) =>
                                setEditingTask((prev) => ({
                                    ...prev,
                                    task:
                                        prev.task && {
                                            ...prev.task,
                                            assignee: val,
                                            type: val,
                                        },
                                }))
                            }
                            options={assignees}
                            style={{ width: '100%' }}
                        />
                    )}
                </Space>
            </Modal>
        </Card>
    );
};

export default FamilyTasksComponent;
