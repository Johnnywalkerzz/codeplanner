import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Verify API key and create OpenAI client
const verifyApiKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
};

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { existingTasks, completedTaskIds, requirements } = body;
    
    // Validate required fields
    if (!existingTasks || !requirements) {
      return NextResponse.json(
        { error: 'Missing required fields: existingTasks or requirements' },
        { status: 400 }
      );
    }
    
    // Create set of completed task IDs for quick lookup
    const completedTasksSet = new Set(completedTaskIds || []);
    
    // Filter to get only incomplete tasks that need updating
    const incompleteTasks = existingTasks.filter(
      (task: any) => !completedTasksSet.has(task.id)
    );
    
    if (incompleteTasks.length === 0) {
      return NextResponse.json({ 
        message: 'No incomplete tasks to update',
        tasks: existingTasks 
      });
    }
    
    // Process each incomplete task
    const openai = verifyApiKey();
    const updatedTasks = await Promise.all(
      incompleteTasks.map(async (task: any) => {
        try {
          // Skip updating already completed tasks
          if (completedTasksSet.has(task.id)) {
            return task;
          }
          
          // Construct prompt for task update
          const prompt = `
You are a senior developer helping update a task within a larger project. 
Given the task details below, please update the implementation guide and code snippet
to incorporate the new requirements without changing the core purpose of the task.

TASK DETAILS:
Title: ${task.title}
Description: ${task.description}
${task.implementation ? `Current Implementation: ${task.implementation}` : ''}
${task.codeSnippet ? `Current Code Snippet: ${task.codeSnippet}` : ''}

NEW REQUIREMENTS TO INCORPORATE:
${requirements}

Please provide:
1. An updated, detailed implementation guide that explains how to complete this task with the new requirements.
2. A practical code snippet that demonstrates the implementation.

IMPORTANT: Your response must maintain JSON format with ONLY two fields:
{
  "implementation": "Step-by-step implementation details incorporating the new requirements...",
  "codeSnippet": "// Code example that implements the solution with new requirements..."
}`;

          // Call OpenAI for task update
          const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
          });
          
          // Extract and parse response
          const response = completion.choices[0].message.content?.trim() || '';
          
          try {
            // Parse JSON response
            const parsedResponse = JSON.parse(response);
            
            // Update task with new implementation and code snippet
            return {
              ...task,
              implementation: parsedResponse.implementation || task.implementation,
              codeSnippet: parsedResponse.codeSnippet || task.codeSnippet,
            };
          } catch (parseError) {
            console.error('Failed to parse API response for task:', task.id, parseError);
            return task;
          }
        } catch (taskError) {
          console.error('Error updating task:', task.id, taskError);
          return task;
        }
      })
    );
    
    // Combine updated incomplete tasks with completed tasks
    const finalTasks = existingTasks.map((task: any) => {
      if (completedTasksSet.has(task.id)) {
        return task;
      }
      
      // Find the updated version of this task
      const updatedTask = updatedTasks.find(
        (updated: any) => updated.id === task.id
      );
      
      return updatedTask || task;
    });
    
    // Return updated tasks
    return NextResponse.json({
      message: 'Tasks updated successfully',
      tasks: finalTasks,
    });
  } catch (error: any) {
    console.error('Error updating tasks:', error);
    
    // Handle API key errors specifically
    if (error.message === 'OpenAI API key not configured') {
      return NextResponse.json(
        { error: 'API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to update tasks: ${error.message}` },
      { status: 500 }
    );
  }
}