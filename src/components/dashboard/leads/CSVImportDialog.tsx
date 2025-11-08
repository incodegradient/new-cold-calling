import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/hooks/useLeads';
import { useLeadGroups } from '@/hooks/useLeadGroups';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { UploadCloud, File, ChevronRight, ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const REQUIRED_FIELDS = ['name', 'phone'];
const ALL_FIELDS = ['name', 'phone', 'email', 'city', 'industries', 'where'];

const CSVImportDialog = ({ isOpen, onClose }: CSVImportDialogProps) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const { bulkInsertLeads } = useLeads();
  const { findOrCreateGroup } = useLeadGroups();

  const resetState = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setIsImporting(false);
    setImportProgress(0);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
        complete: (results) => {
          setHeaders(results.meta.fields || []);
          setRows(results.data);
          setStep(2);
        },
      });
    }
  };

  const handleMappingChange = (csvHeader: string, leadField: string) => {
    setMapping(prev => ({ ...prev, [csvHeader]: leadField }));
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    const leadsToInsert: any[] = [];
    const groupCache: Record<string, string> = {};

    const groupColumn = Object.keys(mapping).find(key => mapping[key] === 'group_name');

    for (const row of rows) {
      const lead: Record<string, any> = {};
      for (const csvHeader in mapping) {
        if (mapping[csvHeader] !== 'group_name' && mapping[csvHeader] !== 'ignore') {
          lead[mapping[csvHeader]] = row[csvHeader];
        }
      }

      if (groupColumn && row[groupColumn]) {
        const groupName = row[groupColumn];
        if (!groupCache[groupName]) {
          try {
            const group = await findOrCreateGroup(groupName);
            groupCache[groupName] = group.id;
          } catch (e) {
            console.error("Could not create group", e);
          }
        }
        lead.group_id = groupCache[groupName];
      }
      
      if (REQUIRED_FIELDS.every(field => lead[field])) {
        leadsToInsert.push(lead);
      }
    }
    
    try {
      // For UX, we just show progress, in reality it's one bulk insert
      await new Promise(res => setTimeout(res, 500));
      setImportProgress(50);
      await bulkInsertLeads(leadsToInsert);
      setImportProgress(100);
      await new Promise(res => setTimeout(res, 500));

      toast.success(`${leadsToInsert.length} leads imported successfully!`);
      resetState();
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
      setIsImporting(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 2) {
      const mappedLeadFields = Object.values(mapping);
      return !REQUIRED_FIELDS.every(field => mappedLeadFields.includes(field));
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={!isImporting ? resetState : undefined}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>Follow the steps to upload and map your lead data.</DialogDescription>
        </DialogHeader>
        
        {isImporting ? (
          <div className="py-8 text-center">
            <h3 className="text-lg font-semibold">Importing Leads...</h3>
            <Progress value={importProgress} className="w-full mt-4" />
            <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="py-8">
                <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">CSV file (up to 10MB)</p>
                  </div>
                  <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="py-4">
                <h3 className="font-semibold mb-2">Map CSV Columns to Lead Fields</h3>
                <p className="text-sm text-muted-foreground mb-4">Match the columns from your file to the corresponding fields in AuraCall. Required fields are marked with *.</p>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {headers.map(header => (
                    <div key={header} className="grid grid-cols-2 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium truncate" title={header}>{header}</span>
                      </div>
                      <Select onValueChange={(value) => handleMappingChange(header, value)} defaultValue={ALL_FIELDS.includes(header.toLowerCase()) ? header.toLowerCase() : undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignore">Ignore this column</SelectItem>
                          <SelectItem value="group_name">Lead Group Name</SelectItem>
                          {ALL_FIELDS.map(field => (
                            <SelectItem key={field} value={field}>
                              {field.charAt(0).toUpperCase() + field.slice(1)} {REQUIRED_FIELDS.includes(field) && '*'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleImport} disabled={isNextDisabled()}>
                Import Leads <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportDialog;
