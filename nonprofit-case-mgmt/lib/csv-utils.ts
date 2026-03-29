/**
 * CSV parsing and generation utilities
 */

export interface ClientCSVRow {
  fullName: string;
  dob?: string;
  email?: string;
  phone?: string;
  language?: string;
  householdSize?: string;
  gender?: string;
  configurable1?: string;
  configurable2?: string;
  configurable3?: string;
}

export interface ServiceCSVRow {
  clientName: string;
  clientId: string;
  date: string;
  serviceType: string;
  notes: string;
  staffName: string;
}

/**
 * Parse CSV string into array of objects
 * @param csvContent - Raw CSV content as string
 * @returns Array of parsed rows
 */
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current.trim());
  return values;
}

/**
 * Generate CSV content from array of objects
 * @param data - Array of objects to convert to CSV
 * @param headers - Optional custom headers (defaults to object keys)
 * @returns CSV string
 */
export function generateCSV(
  data: Record<string, any>[],
  headers?: string[]
): string {
  if (data.length === 0) return '';

  // Determine headers
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(h => escapeCSVField(h)).join(',');
  
  // Create data rows
  const dataRows = data.map(row =>
    csvHeaders.map(header => {
      const value = row[header];
      return escapeCSVField(value === null || value === undefined ? '' : String(value));
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV field if it contains special characters
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download CSV file to client
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate client CSV data
 */
export function validateClientCSVData(rows: Record<string, string>[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const lineNum = index + 2; // +2 for header row and 1-based indexing

    if (!row.fullName || row.fullName.trim() === '') {
      errors.push(`Row ${lineNum}: Full name is required`);
    }

    if (row.householdSize && isNaN(Number(row.householdSize))) {
      errors.push(`Row ${lineNum}: Household size must be a number`);
    }

    // Validate email format if provided
    if (row.email && row.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Row ${lineNum}: Invalid email format`);
      }
    }

    // Validate phone format if provided (basic check)
    if (row.phone && row.phone.trim() !== '') {
      const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
      if (!phoneRegex.test(row.phone)) {
        errors.push(`Row ${lineNum}: Invalid phone format`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
