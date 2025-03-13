'use client';

import { useState } from 'react';
import { FaCheck, FaChevronDown, FaChevronUp, FaRegTrashAlt, FaPencilAlt, FaCode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { CodeEditor } from '@/components/CodeEditor';
import { TodoItem as TodoItemType } from '@/types';

interface TodoItemProps {
  item: TodoItemType;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onOpenEditModal: (item: TodoItemType) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ item, onDelete, onToggleComplete, onOpenEditModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Handle toggling the expand/collapse state
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  // Handle toggling the code display
  const toggleCode = () => setShowCode(!showCode);
  
  // Handle clicking the title or description to expand and show code
  const handleContentClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    
    if (!showCode && (item.codeSnippet || item.implementation)) {
      setShowCode(true);
    }
  };
  
  // Handle toggling completion status
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`border rounded-lg overflow-hidden mb-4 shadow-md transform hover:shadow-lg transition-all duration-300 ${
        item.completed ? 'border-green-500 bg-green-50 dark:bg-slate-900/40 dark:border-green-900' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div 
            className="flex-grow cursor-pointer"
            onClick={handleContentClick}
          >
            <h3 
              className={`font-semibold text-lg mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                item.completed ? 'text-green-700 dark:text-green-500 line-through' : 'text-slate-800 dark:text-white'
              }`}
            >
              {item.title}
              <span className="text-xs ml-2 inline-block font-normal text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                (click to expand)
              </span>
            </h3>
            
            <p 
              className={`text-sm ${
                item.completed ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-300'
              } ${isExpanded ? '' : 'line-clamp-2'} hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
            >
              {item.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleToggleComplete}
              className={`p-2 rounded-full transition-all duration-300 ${
                item.completed 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
              aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
              title={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <FaCheck className={`${item.completed ? 'scale-110' : 'scale-90 opacity-70'} transition-all`} />
            </button>
            
            <button
              onClick={() => onOpenEditModal(item)}
              className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-all"
              aria-label="Edit task"
              title="Edit task"
            >
              <FaPencilAlt />
            </button>
            
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
              aria-label="Delete task"
              title="Delete task"
            >
              <FaRegTrashAlt />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-2">
            {(item.codeSnippet || item.implementation) && (
              <button
                onClick={toggleCode}
                className={`flex items-center space-x-1 text-xs py-1 px-2 rounded ${
                  showCode 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                } transition-all`}
                aria-label={showCode ? 'Hide code' : 'Show code'}
              >
                <FaCode size={12} />
                <span>{showCode ? 'Hide Code' : 'Show Code'}</span>
              </button>
            )}
          </div>
          
          <button
            onClick={toggleExpand}
            className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4"
        >
          <div className="pt-2 pb-4 border-t border-slate-200 dark:border-slate-700 mt-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Details:</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{item.description}</p>
            
            {showCode && (item.codeSnippet || item.implementation) && (
              <div className="mt-4">
                <CodeEditor
                  code={item.codeSnippet || item.implementation || ''}
                  maxHeight="300px"
                  title={`Implementation - ${item.title}`}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TodoItem;