'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FaCopy, FaCode, FaCheck, FaChevronDown, FaChevronUp, FaDownload } from 'react-icons/fa';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

// Dynamically import the code editor with SSR disabled
const ReactCodeEditor = dynamic(
  () => import('@uiw/react-textarea-code-editor').then((mod) => mod.default),
  { ssr: false }
);

interface CodeEditorProps {
  code: string;
  language?: string;
  editable?: boolean;
  onChange?: (code: string) => void;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  title?: string;
  filename?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language: propLanguage,
  editable = false,
  onChange,
  showLineNumbers = true,
  maxHeight = '300px',
  className = '',
  title = 'Code',
  filename,
}) => {
  const [language, setLanguage] = useState(propLanguage || 'typescript');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  const lineCount = code.split('\n').length;
  
  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Detect language from code content or filename
  useEffect(() => {
    if (!propLanguage) {
      let detectedLanguage = 'typescript'; // default
      
      // Try to detect from filename if provided
      if (filename) {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (extension) {
          // Map file extensions to languages
          const extensionMap: Record<string, string> = {
            'js': 'javascript',
            'ts': 'typescript',
            'jsx': 'jsx',
            'tsx': 'tsx',
            'py': 'python',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'h': 'c',
            'hpp': 'cpp',
            'cs': 'csharp',
            'php': 'php',
            'css': 'css',
            'scss': 'scss',
            'html': 'html',
            'xml': 'xml',
            'md': 'markdown',
            'json': 'json',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sh': 'bash',
            'sql': 'sql',
          };
          
          if (extension in extensionMap) {
            detectedLanguage = extensionMap[extension];
          }
        }
      }
      
      // If no language detected from filename or no filename provided, try from content
      if (detectedLanguage === 'typescript' && code) {
        // Simple language detection based on patterns
        if (code.includes('import React') || code.includes('useState') || code.includes('export default') || code.includes('function Component')) {
          detectedLanguage = 'jsx';
        } else if (code.includes('.tsx') || (code.includes('<') && code.includes('>') && code.includes(':'))) {
          detectedLanguage = 'tsx';
        } else if (code.includes('def ') && code.includes(':') && !code.includes('{')) {
          detectedLanguage = 'python';
        } else if (code.includes('let mut') || code.includes('impl ') || code.includes('fn ') && code.includes('->')) {
          detectedLanguage = 'rust';
        } else if (code.includes('package main') || code.includes('func ') && code.includes('interface {}')) {
          detectedLanguage = 'go';
        } else if (code.includes('public class') || code.includes('public static void main')) {
          detectedLanguage = 'java';
        } else if (code.includes('npm ') || code.includes('yarn ') || code.includes('$') || code.includes('bash')) {
          detectedLanguage = 'bash';
        } else if (code.includes('{') && code.includes('}') && code.includes(':') && !code.includes('function')) {
          detectedLanguage = 'json';
        } else if (code.includes('.css') || code.includes('@media') || code.includes(':hover')) {
          detectedLanguage = 'css';
        } else if (code.includes('##') || code.includes('###') || code.includes('```')) {
          detectedLanguage = 'markdown';
        } else if (code.includes('SELECT ') && code.includes('FROM ') && (code.includes('WHERE ') || code.includes('JOIN '))) {
          detectedLanguage = 'sql';
        }
      }
      
      setLanguage(detectedLanguage);
    } else {
      setLanguage(propLanguage);
    }
  }, [code, propLanguage, filename]);
  
  // Apply syntax highlighting with Prism
  useEffect(() => {
    if (codeRef.current && !editable) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language, editable, mounted, isExpanded]);

  // Copy code to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }, [code]);
  
  // Download code as file
  const downloadCode = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename || `code.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [code, language, filename]);
  
  // Get proper language for prism classes
  const getLanguageClass = () => {
    // Map our language names to Prism's
    switch (language) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'jsx': return 'jsx';
      case 'tsx': return 'tsx';
      case 'py': return 'python';
      case 'sh': return 'bash';
      default: return language;
    }
  };

  return (
    <div className={`code-editor-container ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 rounded-t-md">
        <div className="flex items-center">
          <FaCode className="text-indigo-400 mr-2 text-xs" />
          <div className="text-xs text-slate-400 flex items-center">
            <span className="mr-2 font-medium text-slate-300">{title || language.toUpperCase()}</span>
            {filename && (
              <span className="mr-2 text-xs bg-slate-800 px-2 py-0.5 rounded">
                {filename}
              </span>
            )}
            <span className="rounded-full px-2 py-0.5 bg-slate-800 text-xs">
              {lineCount} lines
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!editable && code.split('\n').length > 10 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-300 hover:text-white transition-colors px-2 py-1 rounded flex items-center bg-slate-800 hover:bg-slate-700 btn-hover-effect"
              aria-label={isExpanded ? 'Collapse code' : 'Expand code'}
            >
              {isExpanded ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button
            onClick={downloadCode}
            className="text-xs text-slate-300 hover:text-white transition-colors px-2 py-1 rounded flex items-center bg-slate-800 hover:bg-slate-700 btn-hover-effect"
            aria-label="Download code"
          >
            <FaDownload className="mr-1" />
            Download
          </button>
          <button
            onClick={copyToClipboard}
            className={`text-xs ${copied ? 'text-green-500 bg-green-900/30' : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'} transition-colors px-2 py-1 rounded flex items-center btn-hover-effect`}
            aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          >
            {copied ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div 
        className={`relative bg-slate-950 rounded-b-md ${
          !isExpanded && !editable ? `max-h-${maxHeight.replace('px', '')} overflow-y-auto` : ''
        }`}
      >
        {editable && mounted ? (
          <ReactCodeEditor
            value={code}
            language={language}
            placeholder="Enter code here..."
            onChange={(e) => onChange?.(e.target.value)}
            padding={15}
            style={{
              fontSize: '0.875rem',
              fontFamily: '"Fira Code", monospace',
              backgroundColor: 'transparent',
            }}
            className="min-h-[100px] w-full border-none focus:outline-none"
            data-color-mode="dark"
          />
        ) : (
          <div className={`${showLineNumbers ? 'line-numbers' : ''}`}>
            <pre 
              ref={codeRef} 
              className={`p-3 text-sm overflow-x-auto text-slate-200 language-${getLanguageClass()}`}
              style={{
                fontFamily: '"Fira Code", monospace',
                backgroundColor: 'transparent',
                margin: 0,
                borderRadius: 0,
              }}
            >
              <code className={`language-${getLanguageClass()}`}>
                {code}
              </code>
            </pre>
          </div>
        )}
        
        {!isExpanded && !editable && code.split('\n').length > 10 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* Additional CSS for line numbers and code highlighting */}
      <style jsx global>{`
        /* Enhance line numbers visibility */
        .line-numbers .line-numbers-rows {
          border-right: 1px solid #4b5563;
          padding-right: 5px;
        }
        
        .line-numbers .line-numbers-rows > span:before {
          color: #6b7280;
        }
        
        /* Improve token colors for better readability */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #8b9eb0;
        }
        
        .token.punctuation {
          color: #c9d1d9;
        }
        
        .token.property,
        .token.keyword,
        .token.tag {
          color: #ff79c6;
        }
        
        .token.class-name {
          color: #f1fa8c;
        }
        
        .token.boolean,
        .token.constant {
          color: #bd93f9;
        }
        
        .token.symbol,
        .token.deleted {
          color: #f14668;
        }
        
        .token.number {
          color: #bd93f9;
        }
        
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #50fa7b;
        }
        
        .token.variable {
          color: #8be9fd;
        }
        
        .token.operator {
          color: #ff79c6;
        }
        
        .token.function {
          color: #f1fa8c;
        }
        
        .token.regex {
          color: #ffb86c;
        }
        
        .token.important {
          color: #ffb86c;
          font-weight: bold;
        }
        
        .token.entity {
          color: #abb2bf;
          cursor: help;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;