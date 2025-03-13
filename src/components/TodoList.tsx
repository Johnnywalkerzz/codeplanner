'use client';

import { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaSortAmountDown, FaSortAmountUp, FaClipboardCheck, FaRegClipboard } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import TodoItem from './TodoItem';
import ProgressBar from './ProgressBar';
import { TodoItem as TodoItemType } from '@/types';

interface TodoListProps {
  items: TodoItemType[];
  onItemsChange: (items: TodoItemType[]) => void;
  onOpenEditModal: (item: TodoItemType) => void;
}

const TodoList: React.FC<TodoListProps> = ({ items, onItemsChange, onOpenEditModal }) => {
  // State for filtering and sorting
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [progress, setProgress] = useState(0);
  
  // Calculate progress whenever items change
  useEffect(() => {
    if (items.length === 0) {
      setProgress(0);
      return;
    }
    
    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    setProgress(percentage);
  }, [items]);
  
  // Filter and sort items based on current state
  const filteredAndSortedItems = items
    .filter(item => {
      // Apply status filter
      if (filter === 'completed') return item.completed;
      if (filter === 'active') return !item.completed;
      return true; // 'all' filter
    })
    .filter(item => {
      // Apply search filter
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Apply sort order
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    });
    
  // Handle toggling task completion status
  const handleToggleComplete = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    // Update localStorage
    try {
      localStorage.setItem('todos', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
    
    // Notify parent component
    onItemsChange(updatedItems);
  };
  
  // Handle deleting a task
  const handleDelete = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    
    // Update localStorage
    try {
      localStorage.setItem('todos', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
    
    // Notify parent component
    onItemsChange(updatedItems);
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
          Project Tasks
          <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
            ({items.length} {items.length === 1 ? 'task' : 'tasks'})
          </span>
        </h2>
        
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* Task filter dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-1 pl-8 pr-8 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tasks</option>
              <option value="active">Incomplete</option>
              <option value="completed">Completed</option>
            </select>
            <FaFilter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
          </div>
          
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-1 pl-8 pr-4 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
          </div>
          
          {/* Sort order toggle */}
          <button
            onClick={toggleSortOrder}
            className="bg-slate-100 dark:bg-slate-700 p-1 rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {sortOrder === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />}
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center">
            {filter === 'all' && (
              <>
                <FaClipboardCheck className="mr-1 text-green-500" size={14} />
                Project Progress
              </>
            )}
            {filter === 'completed' && (
              <>
                <FaClipboardCheck className="mr-1 text-green-500" size={14} />
                Completed Tasks
              </>
            )}
            {filter === 'active' && (
              <>
                <FaRegClipboard className="mr-1 text-blue-500" size={14} />
                Incomplete Tasks
              </>
            )}
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {progress}%
          </span>
        </div>
        <ProgressBar progress={progress} />
      </div>
      
      {/* Task list with animations */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredAndSortedItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TodoItem
                  item={item}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onOpenEditModal={onOpenEditModal}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {items.length === 0
              ? 'No tasks yet. Generate some tasks to get started!'
              : searchTerm
              ? `No tasks matching "${searchTerm}"`
              : filter === 'completed'
              ? 'No completed tasks yet'
              : filter === 'active'
              ? 'No incomplete tasks'
              : 'No tasks found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TodoList;