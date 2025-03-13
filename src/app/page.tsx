'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InputForm from '@/components/InputForm';
import TodoList from '@/components/TodoList';
import { TodoItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPencilAlt, FaSave, FaUndo } from 'react-icons/fa';

export default function Home() {
  // State
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editItem, setEditItem] = useState<TodoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Load todos from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        setTodos(JSON.parse(storedTodos));
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error);
      }
    }
    
    // Listen for custom event to show generator panel
    const handleToggleEvent = (e: CustomEvent) => {
      if (e.detail?.action === 'show') {
        setShowGenerator(true);
      }
    };
    
    window.addEventListener('toggleCodeGeneration', handleToggleEvent as EventListener);
    
    return () => {
      window.removeEventListener('toggleCodeGeneration', handleToggleEvent as EventListener);
    };
  }, []);
  
  // Handle generator panel toggle
  const toggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };
  
  // Handle tasks being generated or updated
  const handleTasksGenerated = (newTasks: TodoItem[]) => {
    setTodos(newTasks);
    setShowGenerator(false);
  };
  
  // Open edit modal for a task
  const handleOpenEditModal = (item: TodoItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };
  
  // Close edit modal
  const handleCloseEditModal = () => {
    setEditItem(null);
    setEditTitle('');
    setEditDescription('');
  };
  
  // Save edited task
  const handleSaveEdit = () => {
    if (!editItem) return;
    
    const updatedTodos = todos.map(todo => 
      todo.id === editItem.id 
        ? { ...todo, title: editTitle, description: editDescription, updatedAt: new Date().toISOString() }
        : todo
    );
    
    setTodos(updatedTodos);
    
    // Update localStorage
    try {
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
    
    handleCloseEditModal();
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl text-slate-900 dark:text-white min-h-screen transition-colors">
      <Header />
      
      <AnimatePresence mode="wait">
        {todos.length === 0 && !showGenerator && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Welcome to CodePlanner!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto">
              Break down your coding projects into manageable tasks with AI assistance.
              Get implementation guides and code snippets for each task.
            </p>
            <button
              onClick={toggleGenerator}
              className="btn btn-primary py-2 px-6 text-lg"
            >
              Generate Your First Tasks
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Task list - only show if we have todos */}
        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TodoList 
              items={todos} 
              onItemsChange={setTodos}
              onOpenEditModal={handleOpenEditModal}
            />
          </motion.div>
        )}
        
        {/* Code generation panel - show conditionally */}
        <AnimatePresence>
          {showGenerator && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <button
                  onClick={toggleGenerator}
                  className="absolute right-2 top-2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close generator"
                >
                  <FaTimes />
                </button>
                
                <InputForm onTasksGenerated={handleTasksGenerated} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Generate button - only show if we have todos and generator is hidden */}
        {todos.length > 0 && !showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex justify-center mt-4"
          >
            <button
              onClick={toggleGenerator}
              className="btn btn-primary py-2 px-6"
            >
              {todos.length > 0 ? 'Update Tasks' : 'Generate Tasks'}
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={handleCloseEditModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                    <FaPencilAlt className="mr-2 text-indigo-500" />
                    Edit Task
                  </h3>
                  <button
                    onClick={handleCloseEditModal}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Close edit modal"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label 
                    htmlFor="editTitle" 
                    className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Task Title
                  </label>
                  <input
                    id="editTitle"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div className="mb-6">
                  <label 
                    htmlFor="editDescription" 
                    className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Task Description
                  </label>
                  <textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    rows={5}
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCloseEditModal}
                    className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded transition-colors flex items-center"
                  >
                    <FaUndo className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}