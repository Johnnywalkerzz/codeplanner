'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaRocket, FaInfoCircle, FaSyncAlt } from 'react-icons/fa';
import { TodoItem } from '@/types';

interface InputFormProps {
  onTasksGenerated: (tasks: TodoItem[]) => void;
  isUpdateMode?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onTasksGenerated, isUpdateMode = false }) => {
  // Form state
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateMode, setUpdateMode] = useState(isUpdateMode);
  const [charCount, setCharCount] = useState(0);

  // Update character count when project description changes
  useEffect(() => {
    setCharCount(projectDescription.length);
  }, [projectDescription]);

  // Set update mode based on prop
  useEffect(() => {
    setUpdateMode(isUpdateMode);
  }, [isUpdateMode]);

  // Handle form submission to generate or update tasks
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectDescription.trim()) {
      setError('Please provide a project description or new requirements');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If in update mode, fetch existing tasks and identify completed ones
      if (updateMode) {
        const existingItemsStr = localStorage.getItem('todos');
        
        if (!existingItemsStr) {
          setError('No existing tasks found to update');
          setIsLoading(false);
          return;
        }
        
        // Parse existing tasks and identify completed ones
        const existingItems = JSON.parse(existingItemsStr) as TodoItem[];
        const completedTaskIds = existingItems
          .filter((item: TodoItem) => item.completed)
          .map((item: TodoItem) => item.id);
        
        // API call to update tasks with new requirements
        const response = await fetch('/api/openai/update-tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            existingTasks: existingItems,
            completedTaskIds,
            requirements: projectDescription,
          }),
        });
        
        // Handle API response for task updates
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 500 && data.error?.includes('API key')) {
            setError('OpenAI API key missing or invalid. Please check your environment configuration.');
          } else {
            setError(data.error || 'Failed to update tasks');
          }
          setIsLoading(false);
          return;
        }
        
        // Update local storage and notify parent component of updated tasks
        try {
          localStorage.setItem('todos', JSON.stringify(data.tasks));
        } catch (storageError) {
          console.error('Failed to update local storage:', storageError);
        }
        
        onTasksGenerated(data.tasks);
        setProjectDescription('');
      } else {
        // Standard task generation mode
        const response = await fetch('/api/openai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: projectDescription }),
        });
        
        // Handle API response for new task generation
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 500 && data.error?.includes('API key')) {
            setError('OpenAI API key missing or invalid. Please check your environment configuration.');
          } else {
            setError(data.error || 'Failed to generate tasks');
          }
          setIsLoading(false);
          return;
        }
        
        // Store generated tasks and notify parent component
        try {
          localStorage.setItem('todos', JSON.stringify(data.tasks));
        } catch (storageError) {
          console.error('Failed to update local storage:', storageError);
        }
        
        onTasksGenerated(data.tasks);
        setProjectDescription('');
      }
    } catch (err: any) {
      setError(`Error: ${err.message || 'Failed to process request'}`);
      console.error('Error in form submission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between update and generate modes
  const toggleMode = () => {
    setUpdateMode(!updateMode);
    setProjectDescription('');
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {updateMode ? 'Update Tasks with New Requirements' : 'Generate Project Tasks'}
        </h2>
        <button
          onClick={toggleMode}
          className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-full flex items-center space-x-1 transition-colors"
          disabled={isLoading}
        >
          <FaSyncAlt className="mr-1" size={12} />
          <span>Switch to {updateMode ? 'Generate' : 'Update'} Mode</span>
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-start">
          <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="projectDescription" 
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {updateMode 
              ? 'Enter new requirements or information to update tasks:' 
              : 'Describe your coding project:'}
          </label>
          <textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder={updateMode 
              ? "Describe new requirements, features, or changes needed..." 
              : "Describe your project, main features, tech stack..."
            }
            rows={6}
            disabled={isLoading}
          ></textarea>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {updateMode 
                ? 'Completed tasks will remain unchanged'
                : 'Be specific for better results'
              }
            </span>
            <span className={`text-xs ${
              charCount > 2000 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {charCount}/2000
            </span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || charCount > 2000}
            className={`flex items-center px-4 py-2 rounded-md text-white transition-all ${
              isLoading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
            } ${
              charCount > 2000 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {updateMode ? 'Updating...' : 'Generating...'}
              </>
            ) : (
              <>
                <FaRocket className="mr-2" />
                {updateMode ? 'Update Tasks' : 'Generate Tasks'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;