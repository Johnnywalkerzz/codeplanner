# CodePlanner

An AI-powered Next.js application that breaks down coding projects into actionable steps with implementation guides.

## Features

- **AI Task Generation**: Enter a project description and get detailed, step-by-step tasks with implementation guides
- **Multiple Viewing Modes**: Step-by-step, List, and Category views to organize your workflow
- **Interactive Code Editor**: Built-in syntax highlighting with support for multiple languages
- **Task Management**: Mark tasks as complete, reorder with drag-and-drop, and track progress
- **Dark Mode Support**: Comfortable UI for coding sessions
- **OpenAI Integration**: Uses GPT models to generate implementation details
- **Task Updates**: Update incomplete tasks with new requirements while preserving completed work

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Framer Motion for animations, React Beautiful DnD for drag and drop
- **Code Editing**: Prism.js for syntax highlighting, React Textarea Code Editor
- **API**: Edge Runtime, OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Johnnywalkerzz/codeplanner.git
   cd codeplanner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to start using CodePlanner.

## Usage

1. Enter a project description in the input form
2. Review the generated tasks and implementation guides
3. Mark tasks as complete as you implement them
4. Update incomplete tasks with new requirements as your project evolves

## License

MIT