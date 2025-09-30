import * as XLSX from 'xlsx';
import { CRMRecord, ProcessedData } from '../types/CRMData';

const removeUnicode = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  // Remove Unicode characters, keep only ASCII characters (0-127)
  return text.replace(/[^\x00-\x7F]/g, '');
};

const normalizePhoneNumber = (phoneValue: any): string => {
  if (!phoneValue) return '';
  
  const phoneStr = String(phoneValue).trim();
  
  // Check for scientific notation (contains E or e)
  if (phoneStr.toLowerCase().includes('e')) {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phoneStr.replace(/\D/g, '');
  
  return digitsOnly;
};

export const parseExcelFile = (file: File): Promise<CRMRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
        
        // Skip header row
        const dataRows = jsonData.slice(1) as any[][];
        
        const records: CRMRecord[] = dataRows.map((row, index) => ({
          slNo: row[0] || index + 1,
          leadReceivedDate: formatDate(row[1]) || '',
          fullName: removeUnicode(row[2] || ''),
          email: removeUnicode(row[3] || ''),
          phone: normalizePhoneNumber(row[4]),
          place: removeUnicode(row[5] || ''),
          counselor: removeUnicode(row[6] || ''),
          region: removeUnicode(row[7] || ''),
          branch: removeUnicode(row[8] || ''),
          preferredCountry: removeUnicode(row[9] || 'Default'),
          ielts: removeUnicode(row[10] || ''),
          latestRemarks: removeUnicode(row[11] || ''),
          followupDate: formatDate(row[12]) || ''
        }));
        
        resolve(records.filter(record => record.fullName && record.phone && record.phone.length > 0)); // Filter out empty rows and records without valid phone numbers
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const formatDate = (dateValue: any): string => {
  if (!dateValue) return '';
  
  // If it's already a string (formatted by Excel), return as is
  if (typeof dateValue === 'string') {
    const trimmedDate = dateValue.trim();
    // Convert DD/MM/YYYY or DD/MM/YY format to DD MM YYYY
    return trimmedDate.replace(/\//g, ' ');
  }
  
  if (typeof dateValue === 'number') {
    // Excel date serial number
    const date = XLSX.SSF.parse_date_code(dateValue);
    return `${date.d.toString().padStart(2, '0')} ${date.m.toString().padStart(2, '0')} ${date.y}`;
  }
  
  // For any other type, convert to string
  const stringDate = String(dateValue);
  // Convert any forward slashes to spaces in the final string
  return stringDate.replace(/\//g, ' ');
};

export const findDuplicates = (records: CRMRecord[]) => {
  const emailGroups = new Map<string, CRMRecord[]>();
  const phoneGroups = new Map<string, CRMRecord[]>();
  const allDuplicateRecords = new Set<CRMRecord>();
  
  records.forEach(record => {
    // Group by email (only if email is present and not empty)
    if (record.email && typeof record.email === 'string' && record.email.trim() !== '' && record.email.trim().toLowerCase() !== 'nil') {
      const email = record.email.toLowerCase().trim();
      if (!emailGroups.has(email)) {
        emailGroups.set(email, []);
      }
      emailGroups.get(email)!.push(record);
    }
    
    // Group by phone (only records with valid phone numbers)
    if (record.phone && record.phone.length > 0) {
      if (!phoneGroups.has(record.phone)) {
        phoneGroups.set(record.phone, []);
      }
      phoneGroups.get(record.phone)!.push(record);
    }
  });
  
  const duplicatesByEmail = Array.from(emailGroups.values()).filter(group => group.length > 1);
  const duplicatesByPhone = Array.from(phoneGroups.values()).filter(group => group.length > 1);
  
  // Add only the extra duplicate records to the set (keep the first record from each group)
  duplicatesByEmail.forEach(group => {
    // Skip the first record (keep it), add the rest as duplicates
    group.slice(1).forEach(record => allDuplicateRecords.add(record));
  });
  duplicatesByPhone.forEach(group => {
    // Skip the first record (keep it), add the rest as duplicates
    group.slice(1).forEach(record => allDuplicateRecords.add(record));
  });
  
  return {
    byEmail: duplicatesByEmail,
    byPhone: duplicatesByPhone,
    allDuplicateRecords
  };
};

export const generateSQLStatements = (records: CRMRecord[]): string[] => {
  // Since records are already filtered during parsing, all should have valid phones
  return records.map(record => {
    const values = [
      record.slNo,
      `'${record.leadReceivedDate}'`,
      `'${record.fullName.replace(/'/g, "''")}'`,
      `'${record.email}'`,
      `'${record.phone}'`,
      `'${record.place}'`,
      `'${record.counselor}'`,
      `'${record.region}'`,
      `'${record.branch}'`,
      `'${record.preferredCountry}'`,
      `'${record.ielts}'`,
      `'${record.latestRemarks.replace(/'/g, "''")}'`,
      `'${record.followupDate}'`
    ].join(', ');
    
    return `(${values})`;
  });
};