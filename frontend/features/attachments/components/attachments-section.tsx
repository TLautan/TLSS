// frontend/features/attachments/components/attachments-section.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { getAttachments, uploadAttachment } from '@/lib/api';
import { Attachment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Paperclip, UploadCloud } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface AttachmentsSectionProps {
  relatedTo: 'deal' | 'company';
  relatedId: number;
}

export function AttachmentsSection({ relatedTo, relatedId }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    try { setLoading(true); setAttachments(await getAttachments(relatedTo, relatedId)); } 
    catch (err) { setError('Failed to load attachments.'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAttachments(); }, [relatedTo, relatedId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('related_to', relatedTo);
    formData.append('related_id', String(relatedId));
    try {
      await uploadAttachment(formData);
      setFile(null);
      fetchAttachments();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添付ファイル</CardTitle>
        <CardDescription>関連ファイルをアップロードして管理します。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 border p-4 rounded-md">
          <Input id="file-upload" type="file" onChange={handleFileChange} className="flex-grow" />
          <Button onClick={handleUpload} disabled={!file || uploading}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        <Table className="mt-4">
          <TableHeader>
            <TableRow><TableHead>ファイル名</TableHead><TableHead>アップローダー</TableHead><TableHead>サイズ</TableHead><TableHead>Date</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center">読み込み中</TableCell></TableRow> : 
            attachments.length > 0 ? attachments.map(att => (
              <TableRow key={att.id}>
                <TableCell className="font-medium">
                  <a href={`${API_BASE_URL}/api/attachments/download/${att.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                    <Paperclip className="mr-2 h-4 w-4" />{att.file_name}
                  </a>
                </TableCell>
                <TableCell>{att.uploader?.name || 'N/A'}</TableCell>
                <TableCell>{formatBytes(att.file_size)}</TableCell>
                <TableCell>{new Date(att.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={4} className="text-center">添付ファイルがありません</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}