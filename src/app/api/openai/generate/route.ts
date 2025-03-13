import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

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
    const { prompt } = body;
    
    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt: must be a non-empty string' },
        { status: 400 }
      );
    }
    
    // Prepare OpenAI client
    const openai = verifyApiKey();
    
    // Construct system prompt for task generation
    const systemPrompt = `
You are an expert software architect and developer. Your task is to break down a project description 
into specific, actionable tasks with implementation guides and code examples.

For the given project description, please provide a JSON array of tasks where each task includes:
1. A clear, specific title
2. A detailed description of what needs to be accomplished
3. A comprehensive step-by-step implementation guide
4. A code snippet example showing how to implement the task

The tasks should:
- Cover all key aspects of the project
- Be logically ordered from foundation to advanced features
- Be specific enough that each task can be completed in 1-3 hours
- Include both frontend and backend tasks as appropriate
- Consider best practices, security, and performance
- Start with infrastructure/setup tasks before feature implementation

IMPORTANT: Your response must be ONLY a valid JSON array of objects with these exact fields:
[
  {
    "id": "unique-id-string",
    "title": "Task title",
    "description": "Detailed task description",
    "implementation": "Step-by-step implementation guide",
    "codeSnippet": "// Code example for this task",
    "completed": false,
    "createdAt": "ISO date string"
  },
  ...
]
`;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    // Extract content from response
    const content = completion.choices[0].message.content?.trim();
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Parse and validate tasks
    try {
      let tasks = JSON.parse(content);
      
      // Ensure we have an array of tasks
      if (!Array.isArray(tasks)) {
        throw new Error('Response is not an array');
      }
      
      // Validate and enhance each task with default values where needed
      tasks = tasks.map(task => ({
        id: task.id || uuidv4(),
        title: task.title || 'Untitled Task',
        description: task.description || 'No description provided',
        implementation: task.implementation || '',
        codeSnippet: task.codeSnippet || '',
        completed: false,
        createdAt: task.createdAt || new Date().toISOString()
      }));
      
      return NextResponse.json({ tasks });
    } catch (parseError: any) {
      console.error('Failed to parse OpenAI response:', parseError);
      return NextResponse.json(
        { error: \`Failed to parse task data: \${parseError.message}\` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating tasks:', error);
    
    // Handle API key errors specifically
    if (error.message === 'OpenAI API key not configured') {
      return NextResponse.json(
        { error: 'API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: \`Failed to generate tasks: \${error.message}\` },
      { status: 500 }
    );
  }
}