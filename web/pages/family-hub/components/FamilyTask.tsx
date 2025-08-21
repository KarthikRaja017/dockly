"use client";
import { useEffect, useState } from 'react';
import { addContacts, addGuardians, addNote, addProject, addTask, getAllNotes, getGuardians, getPets, getProjects, getTasks, getUserContacts, updateNote, updateTask } from '../../../services/family'; // Adjust import based on your setup

import dayjs from 'dayjs';
import { message } from 'antd';
import FamilyTasksComponent from '../../components/familyTasksProjects';

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
    id: string;
    title: string;
    description: string;
    due_date: string;
    progress: number;
    tasks: Task[];
    visibility: string;
};

interface FamilyTasksProps {
    familyMembers: { name: string; email?: string; status?: string }[];
}

const FamilyTasks: React.FC<FamilyTasksProps> = ({ familyMembers }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const publicProjects = projects.filter(p => p.visibility === 'public' || p.visibility === 'undefined');
    useEffect(() => {
        fetchProjects();
    }, []);


    const fetchProjects = async () => {
        try {
            const projRes = await getProjects({ source: 'familyhub' }); // ✅ pass source
            const rawProjects = (projRes.data.payload.projects || []).filter(
                (proj: any) => proj.source === 'familyhub' || (proj.source === 'planner' && proj.meta?.visibility === 'public')

            );

            const projectsWithTasks = await Promise.all(
                rawProjects.map(async (proj: any) => {
                    const taskRes = await getTasks({ project_id: proj.id });
                    const rawTasks = taskRes.data.payload.tasks || [];

                    const tasks = rawTasks.map((task: any, i: number) => ({
                        id: task.id || i + 1,
                        title: task.title,
                        assignee: task.assignee,
                        type: task.type,
                        completed: task.completed,
                        due: task.completed
                            ? 'Completed'
                            : `Due ${dayjs(task.due_date).format('MMM D')}`,
                        dueDate: task.due_date,
                    }));

                    return {
                        id: proj.id,
                        title: proj.title,
                        description: proj.description,
                        due_date: proj.due_date,
                        color: proj.color || '#667eea',
                        progress: tasks.length
                            ? Math.round(
                                (tasks.filter((t: Task) => t.completed).length / tasks.length) * 100
                            )
                            : 0,
                        tasks,
                        visibility: proj.meta?.visibility || 'private',
                        source: proj.source || '',
                    };
                })
            );

            setProjects(projectsWithTasks);
        } catch (err) {
            message.error('Failed to load family hub projects');
        }
    };

    const handleAddProject = async (project: {
        title: string;
        description: string;
        due_date: string;
        visibility: 'public' | 'private';
    }) => {
        try {
            await addProject({
                ...project,
                source: 'familyhub',
                meta: {
                    visibility: project.visibility
                }
            });
            message.success('Project added');
            fetchProjects();
        } catch {
            message.error('Failed to add project');
        }
    };


    const handleAddTask = async (projectId: string,
        taskData?: { title: string; due_date: string; assignee?: string }
    ) => {
        if (!taskData) return;
        try {
            await addTask({
                project_id: projectId,
                title: taskData.title,
                assignee: taskData.assignee || 'All',
                type: 'low',
                due_date: taskData.due_date,
                completed: false,
            });
            fetchProjects();
        } catch {
            message.error('Failed to add task');
        }
    };


    const handleToggleTask = async (projectId: string, taskId: number) => {
        const project = projects.find((p) => p.id === projectId);
        const task = project?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        try {
            await updateTask({ id: taskId, completed: !task.completed });
            fetchProjects();
        } catch {
            message.error('Failed to toggle task');
        }
    };

    const handleUpdateTask = async (task: Task) => {
        try {
            await updateTask({
                id: task.id,
                title: task.title,
                due_date: task.dueDate,
                assignee: task.assignee,
                type: task.type,
            });
            message.success('Task updated');
            fetchProjects();
        } catch {
            message.error('Failed to update task');
        }
    };

    return (
        <div>
            <FamilyTasksComponent
                title="Projects & Tasks"
                projects={projects}
                onAddProject={handleAddProject}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onUpdateTask={handleUpdateTask}
                familyMembers={familyMembers}
                showVisibilityToggle={false}
                showAssigneeField={true}
                source="familyhub"
            />
        </div>
    );
};

export default FamilyTasks;