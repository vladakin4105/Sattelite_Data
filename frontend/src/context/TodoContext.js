import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TodoContext = createContext();

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    axios.get('/todos').then(res => setTodos(res.data));
  }, []);

  const addTodo = (text) => {
    axios.post('/todos', { text, done: false })
      .then(res => setTodos(prev => [...prev, res.data]));
  };

  const deleteTodo = (id) => {
    axios.delete(`/todos/${id}`)
      .then(() => setTodos(prev => prev.filter(t => t.id !== id)));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
}