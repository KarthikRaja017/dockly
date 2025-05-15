
'use client'
import React, { useState } from "react";
import { Tabs, Tag, Button, Input, Checkbox } from 'antd'; // Import necessary antd components

const UpcomingAndTodoList = () => {
  const [todos, setTodos] = useState([
    { text: "Call internet provider about bill", done: false },
    { text: "Check email for shopping confirmation", done: true },
  ]);
  const [newTask, setNewTask] = useState("");

  const upcomingItems = [
    {
      date: "23 APR",
      title: "Mortgage Payment",
      subtitle: "Chase Bank - $1,500",
      tag: <Tag color="orange">Due Soon</Tag>,
    },
    {
      date: "25 APR",
      title: "Internet Bill",
      subtitle: "Xfinity - $89.99",
      tag: <Tag color="orange">Due Soon</Tag>,
    },
    {
      date: "01 MAY",
      title: "Netflix Subscription",
      subtitle: "Netflix - $19.99",
      tag: <Tag color="green">Auto Pay-On</Tag>,
    },
    {
      date: "03 MAY",
      title: "Auto Insurance",
      subtitle: "Progressive - $132.50",
      tag: <Tag color="green">Auto Pay-On</Tag>,
    },
  ];

  const handleAddTodo = () => {
    if (newTask.trim()) {
      setTodos([...todos, { text: newTask, done: false }]);
      setNewTask("");
    }
  };

  const toggleTodo = (index: number) => {
    const updated = [...todos];
    updated[index].done = !updated[index].done;
    setTodos(updated);
  };

  const removeTodo = (index: number) => {
    const updated = [...todos];
    updated.splice(index, 1);
    setTodos(updated);
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
        padding: 20,
        fontFamily: "Segoe UI, sans-serif",
        width: 1100,
      }}
    >
      {/* Upcoming Activities */}
      <div style={{ marginBottom: 30 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          Upcoming Activities
          <a style={{ fontSize: 14 }}>View All</a>
        </div>
        {upcomingItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 15,
              padding: "10px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                minWidth: 60,
                height: 50,
                background: "#e6f7ff",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 600,
                color: "#007B8F",
                marginRight: 16,
              }}
            >
              <div style={{ fontSize: 16 }}>{item.date.split(" ")[0]}</div>
              <div style={{ fontSize: 12 }}>{item.date.split(" ")[1]}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{item.title}</div>
              <div style={{ color: "#888", fontSize: 14 }}>{item.subtitle}</div>
            </div>
            {item.tag}
          </div>
        ))}
      </div>

      {/* To-Do List */}
      <div>
        <h3 style={{ marginBottom: 12 }}>To-Do List</h3>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              label: "Today",
              key: "1",
              children: (
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                    <Input
                      placeholder="Add new task..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button type="primary" onClick={handleAddTodo}>
                      Add
                    </Button>
                  </div>
                  {todos.map((todo, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Checkbox
                        checked={todo.done}
                        onChange={() => toggleTodo(idx)}
                      />
                      <div
                        style={{
                          flex: 1,
                          marginLeft: 10,
                          textDecoration: todo.done ? "line-through" : "none",
                          color: todo.done ? "#888" : "#000",
                        }}
                      >
                        {todo.text}
                      </div>
                      <span
                        onClick={() => removeTodo(idx)}
                        style={{
                          color: "#ff4d4f",
                          cursor: "pointer",
                          marginLeft: 10,
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              label: "Week",
              key: "2",
              children: (
                <div style={{ color: "#aaa" }}>Weekly tasks coming soon...</div>
              ),
            },
            {
              label: "Month",
              key: "3",
              children: (
                <div style={{ color: "#aaa" }}>
                  Monthly planning feature WIP...
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

