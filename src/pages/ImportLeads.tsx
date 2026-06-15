import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download,
  Users, Copy, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
// Modal available if needed
import { sanitizePhone, isValidPhone } from '@/utils/security';

// CSV field mapping options
const CRM_FIELDS = [
  { value: '', label: '— Skip —' },
  { value: 'full_name', label: 'Full Name' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'source', label: 'Lead Source' },
  { value: 'property_type', label: 'Property Type' },
  { value: 'budget_min', label: 'Min Budget' },
  { value: 'budget_max', label: 'Max Budget' },
  { value: 'preferred_location', label: 'Location' },
  { value: 'notes', label: 'Notes' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'tags', label: 'Tags' },
];

// Auto-detect column mapping
function autoMap(header: string): string {
  const h = header.toLowerCase().trim();
  if (/^(name|full.?name|client.?name|customer)$/i.test(h)) return 'full_name';
  if (/^(phone|mobile|contact|cell|whatsapp)$/i.test(h)) return 'phone';
  if (/^(email|e-mail|mail)$/i.test(h)) return 'email';
  if (/^(source|lead.?source|channel|platform|from)$/i.test(h)) return 'source';
  if (/^(type|property.?type|prop.?type|category)$/i.test(h)) return 'property_type';
  if (/^(budget|min.?budget|budget.?min|min.?price)$/i.test(h)) return 'budget_min';
  if (/^(max.?budget|budget.?max|max.?price)$/i.test(h)) return 'budget_max';
  if (/^(location|city|area|preferred.?location|locality)$/i.test(h)) return 'preferred_location';
  if (/^(notes|remarks|comment|description)$/i.test(h)) return 'notes';
  if (/^(temperature|temp|priority|hot|warm|cold)$/i.test(h)) return 'temperature';
  return '';
}

interface ParsedRow {
  rowNum: number;
  raw: Record<string, string>;
  mapped: Partial<Record<string, string>>;
  errors: string[];
  isDuplicate: boolean;
  isValid: boolean;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  // Simple CSV parser handling quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(l => parseLine(l)).filter(r => r.some(c => c.trim()));
  return { headers, rows };
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'done';

export function ImportLeadsPage() {
  const { addLeadBulk, findDuplicateLeads, leads, navigate, toast } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(false);

  // Results
  const [imported, setImported] = useState(0);
  const [duplicates, setDuplicates] = useState(0);
  const [errored, setErrored] = useState(0);
  const [importProgress, setImportProgress] = useState(0);

  // Handle file selection
  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|tsv|txt)$/i)) {
      toast('Please upload a CSV file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('File too large. Max 5 MB.', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      if (h.length === 0) { toast('Empty or invalid CSV file', 'error'); return; }
      if (r.length === 0) { toast('No data rows found in CSV', 'error'); return; }
      if (r.length > 1000) { toast('Max 1000 rows per import', 'error'); return; }

      setHeaders(h);
      setRawRows(r);

      // Auto-map columns
      const autoMapping: Record<number, string> = {};
      h.forEach((header, idx) => { autoMapping[idx] = autoMap(header); });
      setMapping(autoMapping);
      setStep('mapping');
    };
    reader.readAsText(file);
  }, [toast]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Validate & preview mapped data
  const handlePreview = () => {
    const hasName = Object.values(mapping).includes('full_name');
    const hasPhone = Object.values(mapping).includes('phone');
    if (!hasName) { toast('Please map a "Full Name" column', 'error'); return; }
    if (!hasPhone) { toast('Please map a "Phone" column', 'error'); return; }

    const rows: ParsedRow[] = rawRows.map((row, idx) => {
      const mapped: Record<string, string> = {};
      const errors: string[] = [];

      // Map columns
      Object.entries(mapping).forEach(([colIdx, field]) => {
        if (field && row[Number(colIdx)] !== undefined) {
          mapped[field] = row[Number(colIdx)].trim();
        }
      });

      // Validate phone
      if (!mapped.phone) {
        errors.push('Phone is required');
      } else {
        const cleaned = sanitizePhone(mapped.phone);
        if (!isValidPhone(cleaned)) {
          errors.push('Invalid phone number');
        }
      }

      // Validate name
      if (!mapped.full_name?.trim()) {
        errors.push('Name is required');
      }

      // Check duplicates against existing leads
      const phone = sanitizePhone(mapped.phone || '');
      const dupes = findDuplicateLeads(phone, mapped.email);
      const isDuplicate = dupes.length > 0;

      return {
        rowNum: idx + 2, // +2 for 1-indexed + header row
        raw: Object.fromEntries(headers.map((h, i) => [h, row[i] || ''])),
        mapped,
        errors,
        isDuplicate,
        isValid: errors.length === 0,
      };
    });

    setParsedRows(rows);
    setStep('preview');
  };

  // Execute import
  const handleImport = async () => {
    setStep('importing');
    let imp = 0;
    let dup = 0;
    let err = 0;

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      setImportProgress(Math.round(((i + 1) / parsedRows.length) * 100));

      if (!row.isValid) { err++; continue; }
      if (row.isDuplicate) { dup++; continue; }

      const result = addLeadBulk({
        full_name: row.mapped.full_name || 'Unknown',
        phone: row.mapped.phone || '',
        email: row.mapped.email || '',
        source: (row.mapped.source as any) || 'CSV Import',
        property_type: (row.mapped.property_type as any) || 'Apartment',
        budget_min: Number(row.mapped.budget_min?.replace(/[^\d]/g, '')) || 0,
        budget_max: Number(row.mapped.budget_max?.replace(/[^\d]/g, '')) || 0,
        preferred_location: row.mapped.preferred_location || '',
        notes: row.mapped.notes || '',
        temperature: (row.mapped.temperature as any) || 'Warm',
      });

      if (result.isDuplicate) { dup++; }
      else if (result.lead) { imp++; }
      else { err++; }

      // Small delay for UI feedback
      if (i % 10 === 0) await new Promise(r => setTimeout(r, 16));
    }

    setImported(imp);
    setDuplicates(dup);
    setErrored(err);
    setStep('done');
    toast(`Import complete: ${imp} imported, ${dup} duplicates skipped, ${err} errors`, imp > 0 ? 'success' : 'info');
  };

  // Reset
  const handleReset = () => {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setParsedRows([]);
    setImported(0);
    setDuplicates(0);
    setErrored(0);
    setImportProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Sample CSV download
  const downloadSample = () => {
    const csv = `Full Name,Phone,Email,Source,Property Type,Budget Min,Budget Max,Location,Notes
Rahul Sharma,+919876543210,rahul@email.com,Facebook Ads,Apartment,5000000,8000000,Gurgaon,Looking for 3BHK
Priya Singh,9988776655,priya@email.com,99acres,Villa,10000000,15000000,Noida,Wants garden area
Amit Kumar,+91-98765-43211,,Website,Plot,3000000,5000000,Dwarka,Near metro preferred`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'estateflow-sample-leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedRows.filter(r => r.isValid && !r.isDuplicate).length;
  const dupeCount = parsedRows.filter(r => r.isDuplicate).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-4 pb-4">
      {/* ── STEP 1: Upload ── */}
      {step === 'upload' && (
        <>
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-gray-900">Import Leads from CSV</h2>
            <p className="text-sm text-gray-500">Upload a CSV file with lead data. Max 1000 rows, 5 MB.</p>
          </div>

          {/* Drag & Drop Zone */}
          <Card padding="none">
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">Drag & drop your CSV file here</p>
              <p className="text-xs text-gray-400 mt-1">or tap to browse files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
          </Card>

          {/* Sample Download */}
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Need a template?</p>
                <p className="text-xs text-gray-500">Download our sample CSV with the right columns</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadSample}>
                <Download size={14} /> Sample CSV
              </Button>
            </div>
          </Card>

          {/* Supported Formats */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-gray-500 mb-2">SUPPORTED COLUMNS</p>
            <div className="flex flex-wrap gap-1.5">
              {['Full Name', 'Phone', 'Email', 'Source', 'Property Type', 'Budget Min', 'Budget Max', 'Location', 'Notes', 'Temperature'].map(col => (
                <Badge key={col} variant="outline" size="md">{col}</Badge>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Columns are auto-mapped by name. You can adjust mapping in the next step.</p>
          </Card>

          {/* Stats */}
          <div className="text-center text-xs text-gray-400">
            Current leads in CRM: <span className="font-medium text-gray-600">{leads.length}</span>
          </div>
        </>
      )}

      {/* ── STEP 2: Column Mapping ── */}
      {step === 'mapping' && (
        <>
          <Card padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet size={18} className="text-primary-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-500">{rawRows.length} rows • {headers.length} columns</p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Map CSV Columns to CRM Fields</h3>
            <p className="text-xs text-gray-500 mb-3">We auto-detected your columns. Adjust if needed.</p>
            <div className="space-y-2">
              {headers.map((header, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 truncate">
                    {header}
                    <span className="text-[10px] text-gray-400 ml-1">({rawRows[0]?.[idx] || '—'})</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 shrink-0" />
                  <div className="flex-1">
                    <Select
                      value={mapping[idx] || ''}
                      onChange={e => setMapping(m => ({ ...m, [idx]: e.target.value }))}
                      options={CRM_FIELDS}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleReset}>Cancel</Button>
            <Button className="flex-1" onClick={handlePreview}>Preview Import</Button>
          </div>
        </>
      )}

      {/* ── STEP 3: Preview ── */}
      {step === 'preview' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <Card padding="sm" className="text-center">
              <CheckCircle size={18} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-emerald-600">{validCount}</p>
              <p className="text-[10px] text-gray-500">Ready</p>
            </Card>
            <Card padding="sm" className="text-center">
              <Copy size={18} className="mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold text-amber-600">{dupeCount}</p>
              <p className="text-[10px] text-gray-500">Duplicates</p>
            </Card>
            <Card padding="sm" className="text-center">
              <AlertTriangle size={18} className="mx-auto text-red-500 mb-1" />
              <p className="text-lg font-bold text-red-600">{errorCount}</p>
              <p className="text-[10px] text-gray-500">Errors</p>
            </Card>
          </div>

          {/* Rows Preview */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Preview ({parsedRows.length} rows)
              </h3>
              <button onClick={() => setExpandedPreview(!expandedPreview)} className="text-xs text-primary-600 font-medium flex items-center gap-1">
                {expandedPreview ? 'Collapse' : 'Show All'}
                {expandedPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
              {(expandedPreview ? parsedRows : parsedRows.slice(0, 10)).map((row) => (
                <div
                  key={row.rowNum}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    row.isDuplicate ? 'bg-amber-50 border border-amber-200' :
                    !row.isValid ? 'bg-red-50 border border-red-200' :
                    'bg-gray-50'
                  }`}
                >
                  <span className="text-gray-400 w-6 text-right shrink-0">#{row.rowNum}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900">{row.mapped.full_name || '—'}</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-gray-600">{row.mapped.phone || '—'}</span>
                    {row.mapped.preferred_location && (
                      <span className="text-gray-400 ml-1">• {row.mapped.preferred_location}</span>
                    )}
                  </div>
                  {row.isDuplicate && <Badge variant="warning" size="sm">Duplicate</Badge>}
                  {!row.isValid && <Badge variant="danger" size="sm">Error</Badge>}
                  {row.isValid && !row.isDuplicate && <Badge variant="success" size="sm">OK</Badge>}
                </div>
              ))}
              {!expandedPreview && parsedRows.length > 10 && (
                <p className="text-xs text-gray-400 text-center py-1">
                  +{parsedRows.length - 10} more rows
                </p>
              )}
            </div>
          </Card>

          {/* Error details */}
          {errorCount > 0 && (
            <Card padding="sm">
              <button
                className="flex items-center justify-between w-full text-sm font-medium text-red-600"
                onClick={() => setShowErrors(!showErrors)}
              >
                <span className="flex items-center gap-1"><AlertTriangle size={14} /> {errorCount} rows with errors</span>
                {showErrors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showErrors && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {parsedRows.filter(r => !r.isValid).map(row => (
                    <div key={row.rowNum} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Row {row.rowNum}: {row.errors.join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('mapping')}>← Back</Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={validCount === 0}
            >
              <Upload size={14} /> Import {validCount} Leads
            </Button>
          </div>
        </>
      )}

      {/* ── STEP 4: Importing ── */}
      {step === 'importing' && (
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center mb-3 animate-pulse">
            <Upload size={28} className="text-primary-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Importing leads…</h2>
          <p className="text-sm text-gray-500 mb-4">Please don't close this page.</p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{importProgress}%</p>
        </Card>
      )}

      {/* ── STEP 5: Done ── */}
      {step === 'done' && (
        <>
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Import Complete!</h2>
            <p className="text-sm text-gray-500 mb-4">Your leads have been added to the CRM.</p>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Card padding="sm" className="text-center">
              <p className="text-xl font-bold text-emerald-600">{imported}</p>
              <p className="text-[10px] text-gray-500">Imported</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xl font-bold text-amber-600">{duplicates}</p>
              <p className="text-[10px] text-gray-500">Duplicates</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xl font-bold text-red-600">{errored}</p>
              <p className="text-[10px] text-gray-500">Errors</p>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleReset}>
              Import More
            </Button>
            <Button className="flex-1" onClick={() => navigate('leads')}>
              <Users size={14} /> View Leads
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
