import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CRMRecord } from '../types/CRMData';

export const exportToExcel = (records: CRMRecord[], filename: string = 'processed_data.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(records.map(record => ({
    'Sl.No': record.slNo,
    'Lead Received Date': record.leadReceivedDate,
    'Full Name': record.fullName,
    'Email': record.email,
    'Phone': record.phone,
    'Place': record.place,
    'Counselor': record.counselor,
    'Region': record.region,
    'Branch': record.branch,
    'Preferred Country': record.preferredCountry,
    'IELTS': record.ielts,
    'Latest Remarks': record.latestRemarks,
    'Followup Date': record.followupDate
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CRM Data');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, filename);
};

export const exportDuplicatesToExcel = (duplicates: CRMRecord[][], type: 'email' | 'phone') => {
  const allDuplicates: any[] = [];
  
  duplicates.forEach((group, groupIndex) => {
    group.forEach((record, recordIndex) => {
      allDuplicates.push({
        'Group': groupIndex + 1,
        'Record': recordIndex + 1,
        'Sl.No': record.slNo,
        'Lead Received Date': record.leadReceivedDate,
        'Full Name': record.fullName,
        'Email': record.email,
        'Phone': record.phone,
        'Place': record.place,
        'Counselor': record.counselor,
        'Region': record.region,
        'Branch': record.branch,
        'Preferred Country': record.preferredCountry,
        'IELTS': record.ielts,
        'Latest Remarks': record.latestRemarks,
        'Followup Date': record.followupDate
      });
    });
  });
  
  const worksheet = XLSX.utils.json_to_sheet(allDuplicates);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Duplicates by ${type}`);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, `duplicates_by_${type}.xlsx`);
};