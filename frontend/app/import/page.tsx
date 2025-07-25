// frontend/app/import/page.tsx
"use client";
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { z } from 'zod';

// Import Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Import your API function
import {
    importDeals,
    FastAPIValidationError,
    FastAPIErrorDetailWithErrors,
    FastAPIErrorResponse,
    SimpleErrorResponse,
} from '@/lib/api';
import { Download } from 'lucide-react';

const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.coerce.number().positive("Value must be a positive number"),
  type: z.enum(["direct", "agency"]),
  user_id: z.coerce.number().int().positive("User ID must be a positive integer"),
  company_id: z.coerce.number().int().positive("Company ID must be a positive integer"),
  status: z.enum(["in_progress", "won", "lost", "cancelled"]).default("in_progress"),
  lead_source: z.string().optional(),
  product_name: z.string().optional(),
  forecast_accuracy: z.enum(["高", "中", "低"]).optional(),
});

type DealImport = z.infer<typeof dealSchema>;
type RawDealData = {
    [key: string]: string | undefined;
};


export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<DealImport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setParsedData([]);
      setError(null);
      setErrorList([]);
      setSuccessMessage(null);
    }
  };

  const handleParse = () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    Papa.parse<RawDealData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<RawDealData>) => {
        try {
          const validatedData = z.array(dealSchema).parse(results.data);
          setParsedData(validatedData);
          setError(null);
          setErrorList([]);
          setSuccessMessage(`Successfully parsed ${validatedData.length} records. Ready for upload.`);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const parsingErrors = validationError.issues.map(issue => {
                const rowIndex = (issue.path[0] as number) + 2;
                const field = issue.path.slice(1).join('.');
                return `Row ${rowIndex}, Field '${field || 'row'}': ${issue.message}.`;
            });
            setError("Validation errors found in the file. Please correct them and try again.");
            setErrorList(parsingErrors);
          } else {
            setError("An unknown validation error occurred during parsing.");
          }
        }
      },
      error: (parseError: Error) => {
        setError(`CSV Parsing Error: ${parseError.message}`);
      },
    });
  };

    const handleUpload = async () => {
    if (parsedData.length === 0) {
        setError("No valid data to upload. Please parse a file first.");
        return;
    }
    setIsUploading(true);
    setError(null);
    setErrorList([]);
    setSuccessMessage(null);

    try {
        const response = await importDeals(parsedData);
        setSuccessMessage(response.message || "Upload successful!");
        setParsedData([]);
        setFile(null);
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if(fileInput) fileInput.value = "";

    } catch (err: unknown) {
        console.error("Error during upload:", err);

        if (axios.isAxiosError(err)) {
        const apiError: AxiosError<unknown> = err;

        const responseData: FastAPIErrorResponse | SimpleErrorResponse | undefined = 
            apiError.response?.data as unknown as (FastAPIErrorResponse | SimpleErrorResponse | undefined);


        if (responseData) {
            if ('detail' in responseData) {
            const detailContent = responseData.detail; // TypeScript knows this is string | FastAPIErrorDetailWithErrors

            if (typeof detailContent === 'string') {
                setError(detailContent);
            } else if ('errors' in detailContent && Array.isArray(detailContent.errors)) {
                const detailWithErrors = detailContent as FastAPIErrorDetailWithErrors;
                setError(detailWithErrors.message || "Multiple import errors occurred.");
                setErrorList(detailWithErrors.errors.map((e: FastAPIValidationError) => `${e.loc?.join('.') || 'Unknown location'}: ${e.msg}`));
            } else {
                setError("An unhandled structured API error occurred. Check console for details.");
            }
            } else if ('message' in responseData && typeof responseData.message === 'string') {
            setError(responseData.message);
            } else {
            setError("An unhandled API response format. Check console for details.");
            }
        } else {
            setError("A network error occurred. Please check your connection or server status.");
        }
        } else if (err instanceof Error) {
        setError(`An unexpected error occurred: ${err.message}`);
        } else {
        setError("An unknown error occurred during upload. Please check the console.");
        }
    } finally {
        setIsUploading(false);
    }
    };
  
  const handleDownloadTemplate = () => {
    const headers = "title,value,type,user_id,company_id,status,lead_source,product_name,forecast_accuracy";
    const exampleRow = "Sample Deal Title,50000,direct,1,1,won,Web,Pro Plan,高";
    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "deals_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Import Deals from CSV</h1>
        <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select and Parse CSV File</CardTitle>
          <CardDescription>
            Select a CSV file with the required headers. Use the template for the correct format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input id="csv-file-input" type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs" />
            <Button onClick={handleParse} disabled={!file}>Parse File</Button>
          </div>
          {successMessage && !error && <p className="text-sm font-medium text-green-600">{successMessage}</p>}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {errorList.length > 0 && (
            <div className="p-4 mt-4 bg-destructive/10 rounded-md">
              <h3 className="font-semibold text-destructive">File Errors:</h3>
              <ul className="list-disc pl-5 mt-2 text-sm text-destructive space-y-1">
                {errorList.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Review and Upload Data ({parsedData.length} records)</CardTitle>
            <CardDescription>
              Review the parsed data below. If it looks correct, proceed with the upload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Company ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Forecast Acc.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>{row.value.toLocaleString()}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.user_id}</TableCell>
                      <TableCell>{row.company_id}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.forecast_accuracy || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleUpload} disabled={isUploading} className="w-full">
              {isUploading ? 'Uploading...' : `Confirm and Upload ${parsedData.length} Deals`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
