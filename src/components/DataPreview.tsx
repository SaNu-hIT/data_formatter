import React from 'react';
import { CRMRecord } from '../types/CRMData';
import { Download } from 'lucide-react';
import { exportToExcel } from '../utils/excelExporter';

interface DataPreviewProps {
  records: CRMRecord[];
  title: string;
  showExport?: boolean;
  className?: string;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ 
  records, 
  title, 
  showExport = true,
  className = ""
}) => {
  const handleExport = () => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
    exportToExcel(records, filename);
  };

  if (records.length === 0) return null;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </span>
          {showExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl.No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counselor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{record.slNo}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.leadReceivedDate}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{record.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{record.place}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{record.counselor}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{record.preferredCountry}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={record.latestRemarks}>
                  {record.latestRemarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};