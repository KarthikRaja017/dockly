'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Checkbox, message, Space, Typography, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, EyeOutlined, ToolOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { addMaintenanceTask, getMaintenanceTasks, updateMaintenanceTask, deleteMaintenanceTask } from '../../../web/services/home';

const { Title, Text } = Typography;
const { Option } = Select;

interface MaintenanceTask {
    id: string;
    name: string;
    date: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

const Maintenance: React.FC<{ uid: string }> = ({ uid }) => {
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await getMaintenanceTasks({ uid });
            if (response.status === 1) {
                setTasks(response.payload.tasks || []); // Ensure tasks is an array
            } else {
                message.error(response.message);
                setTasks([]); // Reset to empty array on error
            }
        } catch (error) {
            message.error('Failed to fetch maintenance tasks');
            setTasks([]); // Reset to empty array on error
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                const response = await addMaintenanceTask({
                    uid,
                    name: values.name,
                    date: values.date.format('YYYY-MM-DD')
                });
                if (response.status === 1) {
                    form.resetFields();
                    setIsModalOpen(false);
                    message.success('Task added successfully');
                    fetchTasks();
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                message.error('Failed to add task');
            }
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleCheckboxChange = async (taskId: string, checked: boolean) => {
        try {
            const currentTask = tasks.find(t => t.id === taskId);
            const response = await updateMaintenanceTask(taskId, { completed: checked, date: currentTask?.date });
            if (response.status === 1) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === taskId ? { ...task, completed: checked, updated_at: moment().toISOString() } : task
                    )
                );
                message.success('Task updated successfully');
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this task?',
            onOk: async () => {
                try {
                    const response = await deleteMaintenanceTask(taskId);
                    if (response.status === 1) {
                        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
                        message.success('Task deleted successfully');
                    } else {
                        message.error(response.message);
                    }
                } catch (error) {
                    message.error('Failed to delete task');
                }
            },
            okButtonProps: {
                style: {
                    backgroundColor: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '4px 15px',
                    height: '32px',
                },
            },
            cancelButtonProps: {
                style: {
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#6b7280',
                    padding: '4px 15px',
                    height: '32px',
                },
            },
        });
    };

    const showViewModal = () => {
        setIsViewModalOpen(true);
    };

    const handleViewCancel = () => {
        setIsViewModalOpen(false);
    };

    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return 'No Date';
        const parsedDate = moment(dateStr, ['YYYY-MM-DD', 'DD-MM-YYYY'], true);
        return parsedDate.isValid() ? parsedDate.format('DD-MM-YYYY') : 'No Date';
    };

    const getDaysUntilDue = (date: string) => {
        if (!date) return 0;
        const today = moment();
        const dueDate = moment(date, ['YYYY-MM-DD', 'DD-MM-YYYY'], true);
        return dueDate.isValid() ? dueDate.diff(today, 'days') : 0;
    };

    const getDisplayTasks = () => {
        switch (filter) {
            case 'completed':
                return tasks.filter((task) => task.completed).slice(0, 3);
            case 'pending':
                return tasks.filter((task) => !task.completed).slice(0, 3);
            default:
                return tasks.slice(0, 3);
        }
    };

    const displayTasks = getDisplayTasks();

    return (
        <div style={{ padding: '16px' }}>
            <Card
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    width: '100%',
                    minHeight: '200px',
                    maxHeight: '600px',
                    marginTop: '-15px',
                    overflowY: displayTasks.length > 3 ? 'auto' : 'hidden',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ToolOutlined style={{ fontSize: '18px', color: '#1f2937' }} />
                        <Title
                            level={3}
                            style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: '0',
                                color: '#1f2937',
                            }}
                        >
                            Home Maintenance
                        </Title>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Select
                            value={filter}
                            onChange={(value) => setFilter(value)}
                            style={{
                                width: '120px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                backgroundColor: '#f9fafb',
                                color: '#6b7280',
                                fontSize: '14px',
                            }}
                            dropdownStyle={{ borderRadius: '6px' }}
                        >
                            <Option value="all">All</Option>
                            <Option value="completed">Completed</Option>
                            <Option value="pending">Pending</Option>
                        </Select>
                        <Button
                            type="default"
                            icon={<PlusOutlined />}
                            onClick={showModal}
                            style={{
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                backgroundColor: '#f9fafb',
                                color: '#6b7280',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 15px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.color = '#374151';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.color = '#6b7280';
                            }}
                        >
                            Add Task
                        </Button>
                    </div>
                </div>

                <div>
                    {displayTasks.length === 0 && tasks.length === 0 ? (
                        <div style={{ textAlign: 'left', padding: '16px 0', color: '#6b7280' }}>
                            <CheckCircleOutlined style={{ fontSize: '20px', color: '#6b7280', marginBottom: '8px' }} />
                            <Text style={{ fontSize: '14px' }}>All caught up! No tasks.</Text>
                        </div>
                    ) : (
                        <Space direction="vertical" style={{ width: '100%', gap: '8px' }}>
                            {displayTasks.map((task) => {
                                const daysUntil = getDaysUntilDue(task.date);
                                const isOverdue = daysUntil < 0 && !task.completed;
                                const isDueToday = daysUntil === 0 && !task.completed;

                                return (
                                    <Card
                                        key={task.id}
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: task.completed ? '#e5e7eb' : '#f9fafb',
                                            padding: '8px',
                                            transition: 'background-color 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!task.completed) {
                                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = task.completed ? '#e5e7eb' : '#f9fafb';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: '1' }}>
                                                <Checkbox
                                                    checked={task.completed}
                                                    onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                                                    style={{ marginTop: '2px' }}
                                                />
                                                <div style={{ flex: '1' }}>
                                                    <Text
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: task.completed ? '#9ca3af' : '#1f2937',
                                                            textDecoration: task.completed ? 'line-through' : 'none',
                                                        }}
                                                    >
                                                        {task.name}
                                                    </Text>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        <Space>
                                                            <CheckCircleOutlined style={{ fontSize: '12px', color: '#6b7280' }} />
                                                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(task.date)}</Text>
                                                        </Space>
                                                        {!task.completed && isOverdue && (
                                                            <Text
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color: '#6b7280',
                                                                    fontWeight: '500',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e5e7eb',
                                                                }}
                                                            >
                                                                {Math.abs(daysUntil)} days overdue
                                                            </Text>
                                                        )}
                                                        {!task.completed && isDueToday && (
                                                            <Text
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color: '#6b7280',
                                                                    fontWeight: '500',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e5e7eb',
                                                                }}
                                                            >
                                                                Due today
                                                            </Text>
                                                        )}
                                                        {!task.completed && daysUntil > 0 && (
                                                            <Text
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color: '#6b7280',
                                                                    fontWeight: '500',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e5e7eb',
                                                                    backgroundColor: '#a1f38c',
                                                                }}
                                                            >
                                                                {daysUntil} days remaining
                                                            </Text>
                                                        )}
                                                        {task.completed && (
                                                            <Text
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color: '#6b7280',
                                                                    fontWeight: '500',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e5e7eb',
                                                                    backgroundColor: '#d1d5db',
                                                                }}
                                                            >
                                                                Completed
                                                            </Text>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteTask(task.id)}
                                                style={{
                                                    borderRadius: '6px',
                                                    color: '#6b7280',
                                                    border: 'none',
                                                    background: 'none',
                                                    fontSize: '12px',
                                                    padding: '4px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                    e.currentTarget.style.color = '#374151';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'none';
                                                    e.currentTarget.style.color = '#6b7280';
                                                }}
                                            />
                                        </div>
                                    </Card>
                                );
                            })}
                            {tasks.length > 3 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={showViewModal}
                                        style={{
                                            backgroundColor: '#2563eb',
                                            color: '#ffffff',
                                            borderRadius: '6px',
                                            border: 'none',
                                            padding: '4px 15px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1d4ed8';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#2563eb';
                                        }}
                                    >
                                        View All ({tasks.length})
                                    </Button>
                                </div>
                            )}
                        </Space>
                    )}
                </div>
            </Card>

            <Modal
                title={
                    <Title level={4} style={{ margin: '0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                        Add New Task
                    </Title>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{
                    style: {
                        backgroundColor: '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '4px 15px',
                        height: '32px',
                    },
                }}
                cancelButtonProps={{
                    style: {
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        color: '#6b7280',
                        padding: '4px 15px',
                        height: '32px',
                    },
                }}
                style={{ borderRadius: '12px' }}
                width={400}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '12px' }}>
                    <Form.Item
                        name="name"
                        label={<Text style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Task Name</Text>}
                        rules={[{ required: true, message: 'Please enter task name!' }]}
                    >
                        <Input
                            placeholder="Enter task name"
                            style={{
                                borderRadius: '6px',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label={<Text style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Due Date</Text>}
                        rules={[{ required: true, message: 'Please select due date!' }]}
                    >
                        <DatePicker
                            format="DD-MM-YYYY"
                            style={{
                                width: '100%',
                                borderRadius: '6px',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                            }}
                            placeholder="Select due date"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={
                    <Title level={4} style={{ margin: '0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                        All Tasks
                    </Title>
                }
                open={isViewModalOpen}
                onCancel={handleViewCancel}
                footer={null}
                width={600}
                style={{ borderRadius: '12px' }}
                bodyStyle={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}
            >
                <Space direction="vertical" style={{ width: '100%', gap: '8px' }}>
                    {tasks.map((task) => {
                        const daysUntil = getDaysUntilDue(task.date);
                        const isOverdue = daysUntil < 0 && !task.completed;
                        const isDueToday = daysUntil === 0 && !task.completed;

                        return (
                            <Card
                                key={task.id}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: task.completed ? '#e5e7eb' : '#f9fafb',
                                    padding: '8px',
                                    transition: 'background-color 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = task.completed ? '#e5e7eb' : '#f9fafb';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: '1' }}>
                                        <Checkbox
                                            checked={task.completed}
                                            onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                                            style={{ marginTop: '2px' }}
                                        />
                                        <div style={{ flex: '1' }}>
                                            <Text
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: task.completed ? '#9ca3af' : '#1f2937',
                                                    textDecoration: task.completed ? 'line-through' : 'none',
                                                }}
                                            >
                                                {task.name}
                                            </Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <Space>
                                                    <CheckCircleOutlined style={{ fontSize: '12px', color: '#6b7280' }} />
                                                    <Text style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(task.date)}</Text>
                                                </Space>
                                                {!task.completed && isOverdue && (
                                                    <Text
                                                        style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            fontWeight: '500',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb',
                                                        }}
                                                    >
                                                        {Math.abs(daysUntil)} days overdue
                                                    </Text>
                                                )}
                                                {!task.completed && isDueToday && (
                                                    <Text
                                                        style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            fontWeight: '500',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb',
                                                        }}
                                                    >
                                                        Due today
                                                    </Text>
                                                )}
                                                {!task.completed && daysUntil > 0 && (
                                                    <Text
                                                        style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            fontWeight: '500',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb',
                                                            backgroundColor: '#a1f38c',
                                                        }}
                                                    >
                                                        {daysUntil} days remaining
                                                    </Text>
                                                )}
                                                {task.completed && (
                                                    <Text
                                                        style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            fontWeight: '500',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb',
                                                            backgroundColor: '#d1d5db',
                                                        }}
                                                    >
                                                        Completed
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteTask(task.id)}
                                        style={{
                                            borderRadius: '6px',
                                            color: '#6b7280',
                                            border: 'none',
                                            background: 'none',
                                            fontSize: '12px',
                                            padding: '4px',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            e.currentTarget.style.color = '#374151';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'none';
                                            e.currentTarget.style.color = '#6b7280';
                                        }}
                                    />
                                </div>
                            </Card>
                        );
                    })}
                </Space>
            </Modal>
        </div>
    );
};

export default Maintenance;