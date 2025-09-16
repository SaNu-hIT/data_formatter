import React, { useState } from 'react';
import { FileSpreadsheet, Database, Users, AlertTriangle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { DuplicatesSection } from './components/DuplicatesSection';
import { SQLOutput } from './components/SQLOutput';
import { parseExcelFile, findDuplicates, generateSQLStatements } from './utils/excelProcessor';
import { CRMRecord, ProcessedData } from './types/CRMData';

function App() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    
    try {
      const records = await parseExcelFile(file);
      const duplicates = findDuplicates(records);
      
      // Filter out duplicate records to get only unique records
      const uniqueRecords = records.filter(record => !duplicates.allDuplicateRecords.has(record));
      const sqlStatements = generateSQLStatements(uniqueRecords);
      
      setProcessedData({
        records,
        uniqueRecords,
        duplicates,
        sqlStatements
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProcessedData(null);
    setError(null);
    setFileName('');
  };

  const totalDuplicates = processedData ? 
    processedData.duplicates ? processedData.duplicates.byEmail.length + processedData.duplicates.byPhone.length : 0 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CRM Data Processor
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your Excel file to process CRM data, detect duplicates, and generate SQL INSERT statements for temp_old_crm_data table
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {fileName && !isProcessing && (
              <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Processed: {fileName}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Upload New File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {processedData && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{processedData.records.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Records</p>
                    <p className="text-2xl font-bold text-gray-900">{processedData.uniqueRecords.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${totalDuplicates > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                    <Users className={`w-6 h-6 ${totalDuplicates > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Duplicate Groups</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDuplicates}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Duplicates Section */}
        {processedData && totalDuplicates > 0 && (
          <div className="mb-8">
            <DuplicatesSection
              duplicatesByEmail={processedData.duplicates.byEmail}
              duplicatesByPhone={processedData.duplicates.byPhone}
            />
          </div>
        )}

        {/* SQL Output */}
        {processedData && (
          <div className="mb-8">
            <SQLOutput
              sqlStatements={processedData.sqlStatements}
              tableName="temp_old_crm_data"
            />
          </div>
        )}

        {/* Data Preview */}
        {processedData && (
          <div className="mb-8">
            <DataPreview
              records={processedData.uniqueRecords}
              title="Unique Records (For SQL Insert)"
              showExport={true}
              className="mb-6"
            />
            <DataPreview
              records={processedData.records}
              title="All Records"
              showExport={true}
            />
          </div>
        )}

        {/* Expected Data Format */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expected Excel File Format</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Header Name</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['A', 'Sl.no', '1'],
                  ['B', 'Lead Received date(DD/MM/YYYY)', '06/06/2025'],
                  ['C', 'Full Name', 'John Doe'],
                  ['D', 'Email', 'john@example.com'],
                  ['E', 'Phone', '9876543210'],
                  ['F', 'Place', 'Bangalore'],
                  ['G', 'Counselor(employee id)', 'JRE221'],
                  ['H', 'Region', 'South'],
                  ['I', 'Branch', 'Bangalore'],
                  ['J', 'Preferred Country', 'AU'],
                  ['K', 'IELTS', '7.5'],
                  ['L', 'Latest Remarks', 'Follow up required'],
                  ['M', 'Followup Date (dd/mm/yyyy)', '31/07/2025']
                ].map(([col, header, example], index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{col}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{header}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">{example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;