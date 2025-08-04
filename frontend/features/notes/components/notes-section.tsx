// frontend/features/notes/components/notes-section.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getNotes, createNote } from '@/lib/api';
import { Note } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


interface NotesSectionProps {
  relatedTo: 'deal' | 'company';
  relatedId: number;
}

export function NotesSection({ relatedTo, relatedId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const notesData = await getNotes(relatedTo, relatedId);
      setNotes(notesData);
    } catch (err) {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [relatedTo, relatedId]);

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    try {
      await createNote({
        content: newNote,
        related_to: relatedTo,
        related_id: relatedId,
      });
      setNewNote('');
      fetchNotes();
    } catch (err) {
      setError('Failed to add note. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>メモ</CardTitle>
        <CardDescription>このアイテムのすべてのメモのログ。</CardDescription>
      </CardHeader>
      <CardContent>
        {/* New Note Form */}
        <div className="flex flex-col space-y-4 mb-8">
          <Textarea
            placeholder={`Add a note as ${user?.name}...`}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button onClick={handleSubmitNote} disabled={!newNote.trim()} className="self-end">
            Add Note
          </Button>
        </div>

        {error && <p className="text-destructive text-center">{error}</p>}
        {loading && <p className="text-center">読み込み中</p>}

        {/* Notes List */}
        <div className="space-y-6">
          {notes.length > 0 ? (
            notes.map(note => (
              <div key={note.id} className="flex gap-4">
                <Avatar>
                  <AvatarFallback>{note.owner?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{note.owner?.name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-center text-muted-foreground">メモナシ</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}