
'use client';
import React, { useState, useEffect } from 'react';
import { Tabs, Tag, Button, Input, Checkbox, DatePicker, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

// Sample familyHub data (replace with actual import from familyHub)
const familyHub = {
  events: [
    {
      date: '2025-05-22',
      title: 'Family Dinner',
      subtitle: 'At Italian Restaurant - 7 PM',
      tag: <Tag color='blue'>Confirmed</Tag>,
    },
    {
      date: '2025-05-24',
      title: 'School Play',
      subtitle: "Asfar's son - 3 PM",
      tag: <Tag color='purple'>Reminder</Tag>,
    },
  ],
  tasks: [
    {
      text: 'Plan family picnic',
      dueDate: '2025-05-23',
      owner: "Asfar's wife",
      done: false,
      status: 'today',
    },
    {
      text: 'Buy groceries for dinner',
      dueDate: '2025-05-22',
      owner: 'Asfar',
      done: true,
      completionDate: '2025-05-21',
      status: 'week',
    },
  ],
};

interface TodoItem {
  text: string;
  done: boolean;
  dueDate: string;
  completionDate?: string;
  owner?: string;
  status?: 'today' | 'week' | 'month' | 'archived';
}

interface UpcomingItem {
  date: string;
  title: string;
  subtitle: string;
  tag: React.ReactElement;
}

const UpcomingAndTodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      text: 'Call internet provider about bill',
      done: false,
      dueDate: '2025-05-21',
      owner: 'Asfar',
      status: 'today',
    },
    {
      text: 'Check email for shopping confirmation',
      done: true,
      dueDate: '2025-05-19',
      completionDate: '2025-05-19',
      owner: "Asfar's son",
      status: 'week',
    },
    ...familyHub.tasks.map(task => ({
      ...task,
      status: task.status as 'today' | 'week' | 'month' | 'archived' | undefined,
    })),
  ]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState<Dayjs | null>(null);
  const [newTaskOwner, setNewTaskOwner] = useState('Asfar');
  const [activeTab, setActiveTab] = useState('1');
  const [view, setView] = useState<'my' | 'family'>('my');

  const myUpcomingItems: UpcomingItem[] = [
    {
      date: '23 MAY',
      title: 'Mortgage Payment',
      subtitle: 'Chase Bank - $1,500',
      tag: <Tag color='orange'>Due Soon</Tag>,
    },
    {
      date: '25 MAY',
      title: 'Internet Bill',
      subtitle: 'Xfinity - $89.99',
      tag: <Tag color='orange'>Due Soon</Tag>,
    },
    {
      date: '01 JUN',
      title: 'Netflix Subscription',
      subtitle: 'Netflix - $19.99',
      tag: <Tag color='green'>Auto Pay-On</Tag>,
    },
    {
      date: '03 JUN',
      title: 'Auto Insurance',
      subtitle: 'Progressive - $132.50',
      tag: <Tag color='green'>Auto Pay-On</Tag>,
    },
  ];

  const familyUpcomingItems: UpcomingItem[] = [
    ...familyHub.events.map((event) => ({
      date: dayjs(event.date).format('DD MMM'),
      title: event.title,
      subtitle: event.subtitle,
      tag: event.tag,
    })),
    ...familyHub.tasks.map((task) => ({
      date: dayjs(task.dueDate).format('DD MMM'),
      title: task.text,
      subtitle: `Assigned to ${task.owner}${task.done ? ' - Completed' : ''}`,
      tag: task.done ? (
        <Tag color='green'>Completed</Tag>
      ) : (
        <Tag color='red'>Pending</Tag>
      ),
    })),
  ];

  const ownerColors: Record<string, string> = {
    Asfar: '#00FF00',
    "Asfar's son": '#FFFF00',
    "Asfar's wife": '#FF69B4',
  };

  // Extract unique owners from todos and familyHub.tasks
  const familyMembers = Array.from(
    new Set([
      'Asfar',
      ...todos.map((todo) => todo.owner || 'Asfar'),
      ...familyHub.tasks.map((task) => task.owner || 'Asfar'),
    ])
  );

  const handleAddTodo = (status: 'today' | 'week' | 'month') => {
    if (!newTask.trim()) {
      alert('Please enter a task description.');
      return;
    }
    if (!newDueDate || !newDueDate.isValid()) {
      alert('Please select a valid due date and time.');
      return;
    }

    const newTodo: TodoItem = {
      text: newTask,
      done: false,
      dueDate: newDueDate.format('YYYY-MM-DD HH:mm'),
      owner: newTaskOwner,
      status,
    };
    setTodos([...todos, newTodo]);
    setNewTask('');
    setNewDueDate(null);
    setNewTaskOwner('Asfar');
  };

  const toggleTodo = (index: number) => {
    const updated = [...todos];
    const todo = updated[index];
    todo.done = !todo.done;
    if (todo.done) {
      todo.completionDate = dayjs().format('YYYY-MM-DD');
      todo.status = 'week';
    } else {
      todo.completionDate = undefined;
      todo.status = 'today';
    }
    setTodos(updated);
  };

  const removeTodo = (index: number) => {
    const updated = [...todos];
    updated.splice(index, 1);
    setTodos(updated);
  };

  const migrateTasks = () => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (!todo.done || !todo.completionDate) return todo;
        const completionMoment = dayjs(todo.completionDate);
        const now = dayjs();
        const daysSinceCompletion = now.diff(completionMoment, 'day');

        if (todo.status === 'week' && daysSinceCompletion >= 7) {
          return { ...todo, status: 'month' };
        }
        if (todo.status === 'month' && daysSinceCompletion >= 30) {
          return { ...todo, status: 'archived' };
        }
        return todo;
      })
    );
  };

  useEffect(() => {
    migrateTasks();
  }, []);

  const todayTodos = todos.filter((todo) => todo.status === 'today');
  const weekTodos = todos.filter((todo) => todo.status === 'week');
  const monthTodos = todos.filter((todo) => todo.status === 'month');

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        padding: 20,
        fontFamily: 'Segoe UI, sans-serif',
        width: '100%',
      }}
    >
      <div style={{ marginBottom: 30 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Upcoming Activities
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              type={view === 'my' ? 'primary' : 'default'}
              onClick={() => setView('my')}
              style={{
                borderRadius: 6,
                background: view === 'my' ? '#1890ff' : '#f5f5f5',
                color: view === 'my' ? '#fff' : '#000',
              }}
            >
              My View
            </Button>
            <Button
              type={view === 'family' ? 'primary' : 'default'}
              onClick={() => setView('family')}
              style={{
                borderRadius: 6,
                background: view === 'family' ? '#1890ff' : '#f5f5f5',
                color: view === 'family' ? '#fff' : '#000',
              }}
            >
              Family View
            </Button>
          </div>
        </div>
        {(view === 'my' ? myUpcomingItems : familyUpcomingItems).map(
          (item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 15,
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div
                style={{
                  minWidth: 60,
                  height: 50,
                  background: '#e6f7ff',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 600,
                  color: '#007B8F',
                  marginRight: 16,
                }}
              >
                <div style={{ fontSize: 16 }}>{item.date.split(' ')[0]}</div>
                <div style={{ fontSize: 12 }}>{item.date.split(' ')[1]}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: '#888', fontSize: 14 }}>
                  {item.subtitle}
                </div>
              </div>
              {item.tag}
            </div>
          )
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: 12 }}>To-Do List</h3>
        <Tabs
          defaultActiveKey='1'
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              label: 'Today',
              key: '1',
              children: (
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                    <Input
                      placeholder='Add new task...'
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <DatePicker
                      showTime={{ format: 'HH:mm', defaultValue: dayjs('23:59', 'HH:mm') }}
                      format='YYYY-MM-DD HH:mm'
                      value={newDueDate}
                      onChange={(date) => setNewDueDate(date)}
                      placeholder='Select due date and time'
                      prefix={<CalendarOutlined />}
                      style={{ width: 200 }}
                    />
                    <Select
                      value={newTaskOwner}
                      onChange={(value) => setNewTaskOwner(value)}
                      style={{ width: 150 }}
                    >
                      {familyMembers.map((owner) => (
                        <Select.Option key={owner} value={owner}>
                          {owner}
                        </Select.Option>
                      ))}
                    </Select>
                    <Button
                      type='primary'
                      onClick={() => handleAddTodo('today')}
                    >
                      Add
                    </Button>
                  </div>
                  {todayTodos.map((todo, idx) => {
                    const isPastDue =
                      !todo.done &&
                      dayjs(todo.dueDate).isBefore(dayjs(), 'minute');
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 10,
                          borderLeft: `4px solid ${
                            ownerColors[todo.owner || 'Asfar']
                          }`,
                          paddingLeft: 8,
                        }}
                      >
                        <Checkbox
                          checked={todo.done}
                          onChange={() => toggleTodo(todos.indexOf(todo))}
                        />
                        <div
                          style={{
                            flex: 1,
                            marginLeft: 10,
                            textDecoration: todo.done ? 'line-through' : 'none',
                            color: todo.done ? '#888' : '#000',
                          }}
                        >
                          {todo.text}
                          <div style={{ fontSize: 12, color: '#888' }}>
                            Due: {dayjs(todo.dueDate).format('MMM DD, YYYY HH:mm')}
                            {isPastDue && (
                              <span
                                style={{ color: '#ff4d4f', marginLeft: 8 }}
                              >
                                PAST DUE: {dayjs(todo.dueDate).format('MMM DD, YYYY HH:mm')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          onClick={() => removeTodo(todos.indexOf(todo))}
                          style={{
                            color: '#ff4d4f',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              label: 'Week',
              key: '2',
              children: (
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                    <Input
                      placeholder='Add new task...'
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <DatePicker
                      showTime={{ format: 'HH:mm', defaultValue: dayjs('23:59', 'HH:mm') }}
                      format='YYYY-MM-DD HH:mm'
                      value={newDueDate}
                      onChange={(date) => setNewDueDate(date)}
                      placeholder='Select due date and time'
                      prefix={<CalendarOutlined />}
                      style={{ width: 200 }}
                    />
                    <Select
                      value={newTaskOwner}
                      onChange={(value) => setNewTaskOwner(value)}
                      style={{ width: 150 }}
                    >
                      {familyMembers.map((owner) => (
                        <Select.Option key={owner} value={owner}>
                          {owner}
                        </Select.Option>
                      ))}
                    </Select>
                    <Button
                      type='primary'
                      onClick={() => handleAddTodo('week')}
                    >
                      Add
                    </Button>
                  </div>
                  {weekTodos.map((todo, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 10,
                        borderLeft: `4px solid ${
                          ownerColors[todo.owner || 'Asfar']
                        }`,
                        paddingLeft: 8,
                      }}
                    >
                      <Checkbox checked={todo.done} disabled />
                      <div
                        style={{
                          flex: 1,
                          marginLeft: 10,
                          textDecoration: 'line-through',
                          color: '#888',
                        }}
                      >
                        {todo.text}
                        <div style={{ fontSize: 12, color: '#888' }}>
                          Completed: {todo.completionDate ? dayjs(todo.completionDate).format('MMM DD, YYYY') : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              label: 'Month',
              key: '3',
              children: (
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                    <Input
                      placeholder='Add new task...'
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <DatePicker
                      showTime={{ format: 'HH:mm', defaultValue: dayjs('23:59', 'HH:mm') }}
                      format='YYYY-MM-DD HH:mm'
                      value={newDueDate}
                      onChange={(date) => setNewDueDate(date)}
                      placeholder='Select due date and time'
                      prefix={<CalendarOutlined />}
                      style={{ width: 200 }}
                    />
                    <Select
                      value={newTaskOwner}
                      onChange={(value) => setNewTaskOwner(value)}
                      style={{ width: 150 }}
                    >
                      {familyMembers.map((owner) => (
                        <Select.Option key={owner} value={owner}>
                          {owner}
                        </Select.Option>
                      ))}
                    </Select>
                    <Button
                      type='primary'
                      onClick={() => handleAddTodo('month')}
                    >
                      Add
                    </Button>
                  </div>
                  {monthTodos.map((todo, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 10,
                        borderLeft: `4px solid ${
                          ownerColors[todo.owner || 'Asfar']
                        }`,
                        paddingLeft: 8,
                      }}
                    >
                      <Checkbox checked={todo.done} disabled />
                      <div
                        style={{
                          flex: 1,
                          marginLeft: 10,
                          textDecoration: 'line-through',
                          color: '#888',
                        }}
                      >
                        {todo.text}
                        <div style={{ fontSize: 12, color: '#888' }}>
                          Completed: {todo.completionDate ? dayjs(todo.completionDate).format('MMM DD, YYYY') : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default UpcomingAndTodoList;

