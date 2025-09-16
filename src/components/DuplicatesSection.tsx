import React, { useState } from 'react';
import { CRMRecord } from '../types/CRMData';
import { AlertTriangle, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { exportDuplicatesToExcel } from '../utils/excelExporter';

interface DuplicatesSectionProps {
  duplicatesByEmail: CRMRecord[][];
  duplicatesByPhone: CRMRecord[][];
}

export const DuplicatesSection: React.FC<DuplicatesSectionProps> = ({
  duplicatesByEmail,
  duplicatesByPhone
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  const handleExportDuplicates = (type: 'email' | 'phone') => {
    const duplicates = type === 'email' ? duplicatesByEmail : duplicatesByPhone;
    exportDuplicatesToExcel(duplicates, type);
  };

  const currentDuplicates = activeTab === 'email' ? duplicatesByEmail : duplicatesByPhone;

  if (duplicatesByEmail.length === 0 && duplicatesByPhone.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-medium">✓</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">No Duplicates Found</h3>
            <p className="text-sm text-green-700 mt-1">
              All records have unique email addresses and phone numbers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">Duplicate Records Found</h3>
          </div>
          <button
            onClick={() => handleExportDuplicates(activeTab)}
            className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-1" />
            Export {activeTab === 'email' ? 'Email' : 'Phone'} Duplicates
          </button>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Please review these duplicate records before proceeding.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('email')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Email Duplicates ({duplicatesByEmail.length} groups)
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'phone'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Phone Duplicates ({duplicatesByPhone.length} groups)
          </button>
        </nav>
      </div>

      <div className="p-6">
        {currentDuplicates.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-0 border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleGroup(groupIndex)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">
                Group {groupIndex + 1} - {group.length} records
                {activeTab === 'email' && group[0].email && (
                  <span className="text-sm text-gray-600 ml-2">({group[0].email})</span>
                )}
                {activeTab === 'phone' && group[0].phone && (
                  <span className="text-sm text-gray-600 ml-2">({group[0].phone})</span>
                )}
              </span>
              {expandedGroups.has(groupIndex) ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedGroups.has(groupIndex) && (
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sl.No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Counselor</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.map((record, recordIndex) => (
                        <tr key={recordIndex} className={recordIndex % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.slNo}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.fullName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.phone}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.counselor}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.leadReceivedDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};