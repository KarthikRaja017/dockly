'use client';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, Checkbox, message, Space, Typography, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { addMaintenanceTask, getMaintenanceTasks, updateMaintenanceTask, deleteMaintenanceTask } from '../../services/home';

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
                setTasks(response.payload.tasks || []);
            } else {
                message.error(response.message);
                setTasks([]);
            }
        } catch (error) {
            message.error('Failed to fetch maintenance tasks');
            setTasks([]);
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
    const PRIMARY_COLOR = "#1890ff";
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
                type: 'primary',
            },
            cancelButtonProps: {
                type: 'default',
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
        <div
            style={{
                padding: '24px',
                maxWidth: '800px',
                margin: '0 auto',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                minHeight: '450px',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ fontSize: '24px', fontWeight: '600', margin: '0', color: '#1f2937' }}>
                    🔧 Home Maintenance
                </Title>
                <Space>
                    <Select
                        value={filter}
                        onChange={(value) => setFilter(value)}
                        style={{
                            width: '120px',
                            height: '32px',
                            borderRadius: '6px',
                            fontSize: '14px',
                        }}
                    >
                        <Option value="all">All</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="pending">Pending</Option>
                    </Select>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                        style={{
                            height: '32px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        {/* Add Task */}
                    </Button>
                </Space>
            </div>

            <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
                {displayTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280' }}>
                        <CheckCircleOutlined style={{ fontSize: '24px', color: '#6b7280', marginBottom: '12px' }} />
                        <Text style={{ fontSize: '16px' }}>All caught up! No tasks.</Text>
                    </div>
                ) : (
                    displayTasks.map((task) => {
                        const daysUntil = getDaysUntilDue(task.date);
                        const isOverdue = daysUntil < 0 && !task.completed;
                        const isDueToday = daysUntil === 0 && !task.completed;

                        return (
                            <div
                                key={task.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: task.completed ? '#f3f4f6' : '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    transition: 'background-color 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = task.completed ? '#f3f4f6' : '#ffffff';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                                    <Checkbox
                                        checked={task.completed}
                                        onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                                    />
                                    <div>
                                        <Text
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                color: task.completed ? '#9ca3af' : '#1f2937',
                                                textDecoration: task.completed ? 'line-through' : 'none',
                                            }}
                                        >
                                            {task.name}
                                        </Text>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                            <Space>
                                                <CheckCircleOutlined style={{ fontSize: '14px', color: '#6b7280' }} />
                                                <Text style={{ fontSize: '14px', color: '#6b7280' }}>{formatDate(task.date)}</Text>
                                            </Space>
                                            {!task.completed && isOverdue && (
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#dc2626',
                                                        fontWeight: '500',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#fee2e2',
                                                    }}
                                                >
                                                    {Math.abs(daysUntil)} days overdue
                                                </Text>
                                            )}
                                            {!task.completed && isDueToday && (
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#d97706',
                                                        fontWeight: '500',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#fef3c7',
                                                    }}
                                                >
                                                    Due today
                                                </Text>
                                            )}
                                            {!task.completed && daysUntil > 0 && (
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#16a34a',
                                                        fontWeight: '500',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#dcfce7',
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
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
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
                                        fontSize: '14px',
                                    }}
                                >

                                </Button>
                            </div>
                        );
                    })
                )}
                {tasks.length > 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={showViewModal}
                            style={{
                                borderRadius: '6px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '-24px',
                            }}
                        >
                            View All ({tasks.length})
                        </Button>
                    </div>
                )}
            </Space>

            <Modal
                title={
                    <Title level={4} style={{ margin: '0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                        Add New Task
                    </Title>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{
                    type: 'primary',
                    style: { borderRadius: '6px', fontSize: '14px' },
                }}
                cancelButtonProps={{
                    type: 'default',
                    style: { borderRadius: '6px', fontSize: '14px' },
                }}
                style={{ borderRadius: '12px' }}
                width={400}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
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
                                fontSize: '14px',
                            }}
                            placeholder="Select due date"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={
                    <Title level={4} style={{ margin: '0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                        All Tasks
                    </Title>
                }
                open={isViewModalOpen}
                onCancel={handleViewCancel}
                footer={[
                    <Button
                        key="cancel"
                        type="default"
                        onClick={handleViewCancel}
                        style={{ borderRadius: '6px', fontSize: '14px' }}
                    >
                        Close
                    </Button>,
                ]}
                width={600}
                style={{ borderRadius: '12px' }}
                bodyStyle={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}
            >
                <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
                    {tasks.map((task) => {
                        const daysUntil = getDaysUntilDue(task.date);
                        const isOverdue = daysUntil < 0 && !task.completed;
                        const isDueToday = daysUntil === 0 && !task.completed;

                        return (
                            <div
                                key={task.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: task.completed ? '#f3f4f6' : '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    transition: 'background-color 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = task.completed ? '#f3f4f6' : '#ffffff';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                                    <Checkbox
                                        checked={task.completed}
                                        onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                                    />
                                    <div>
                                        <Text
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                color: task.completed ? '#9ca3af' : '#1f2937',
                                                textDecoration: task.completed ? 'line-through' : 'none',
                                            }}
                                        >
                                            {task.name}
                                        </Text>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                            <Space>
                                                <CheckCircleOutlined style={{ fontSize: '14px', color: '#6b7280' }} />
                                                <Text style={{ fontSize: '14px', color: '#6b7280' }}>{formatDate(task.date)}</Text>
                                            </Space>
                                            {!task.completed && isOverdue && (
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#dc2626',
                                                        fontWeight: '500',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#fee2e2',
                                                    }}
                                                >
                                                    {Math.abs(daysUntil)} days overdue
                                                </Text>
                                            )}
                                            {!task.completed && isDueToday && (
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#d97706',
                                                        fontWeight: '500',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#fef3c7',
                                                    }}
                                                >
                                                    Due today
                                                </Text>
                                            )}
                                            {!task.completed && daysUntil > 0 && (
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#16a34a',
                                                        fontWeight: '500',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#dcfce7',
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
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
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
                                        fontSize: '14px',
                                    }}
                                >

                                </Button>
                            </div>
                        );
                    })}
                </Space>
            </Modal>
        </div>
    );
};

export default Maintenance;