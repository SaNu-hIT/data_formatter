import React, { useState } from 'react';
import { Copy, Download, Database, FileText } from 'lucide-react';

interface SQLOutputProps {
  sqlStatements: string[];
  tableName: string;
}

export const SQLOutput: React.FC<SQLOutputProps> = ({ sqlStatements, tableName }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'combined' | 'individual'>('combined');

  const fullSQL = `INSERT INTO ${tableName} VALUES\n${sqlStatements.join(',\n')};`;
  const individualSQL = sqlStatements.map((stmt, index) => 
    `INSERT INTO ${tableName} VALUES ${stmt}; -- Record ${index + 1}`
  ).join('\n');

  const handleCopy = async () => {
    try {
      const textToCopy = activeTab === 'combined' ? fullSQL : individualSQL;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'combined' ? fullSQL : individualSQL;
    const blob = new Blob([textToDownload], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_${activeTab}_statements.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (sqlStatements.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">SQL INSERT Statements</h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {sqlStatements.length} statement{sqlStatements.length !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md transition-colors duration-200 ${
                copied
                  ? 'border-green-300 text-green-700 bg-green-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('combined')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'combined'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Combined SQL
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'individual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-4 h-4 inline mr-1" />
            Individual Statements
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
          <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
            <code>{activeTab === 'combined' ? fullSQL : individualSQL}</code>
          </pre>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Usage Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {activeTab === 'combined' ? 'Copy the combined SQL statement for bulk insert of unique records only' : 'Copy individual statements for one-by-one execution of unique records'}</li>
            <li>• Ensure the table '{tableName}' exists with the correct schema</li>
            <li>• Duplicate records are automatically excluded from SQL generation</li>
            {activeTab === 'individual' && (
              <li>• Individual statements allow for better error handling and debugging</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};