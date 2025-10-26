"use client"
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  title: string;
  text: string;
  created_at: string;
}

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState({ title: '', content: '' });

  // Fetch entries from database
  useEffect(() => {
    if (user?.id) {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchEntries = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get fresh session to ensure we have latest token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        console.error('Session error:', sessionError);
        setEntries([]);
        return;
      }
      
      // Get access token from fresh session
      const accessToken = freshSession?.access_token;
      
      if (!accessToken) {
        console.error('No access token available');
        setEntries([]);
        return;
      }

      const response = await fetch('/api/journal', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Fetch result:', result);

      if (result.success) {
        setEntries(result.data);
      } else {
        console.error('Failed to fetch entries:', result.error);
        toast.error('Failed to load entries: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Error loading journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!(newEntry.title || newEntry.content)) return;
    if (!user?.id) return;

    try {
      setSaving(true);
      
      // Get fresh session to ensure we have latest token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        console.error('Session error:', sessionError);
        return;
      }
      
      const accessToken = freshSession?.access_token;
      
      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      const title = newEntry.title || 'Untitled';
      const text = newEntry.content;

      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, text }),
      });

      console.log('Save response status:', response.status);
      const result = await response.json();
      console.log('Save result:', result);

      if (result.success) {
        // Add new entry to the list
        setEntries([result.data, ...entries]);
        setNewEntry({ title: '', content: '' });
        setIsWriting(false);
        toast.success('Entry saved successfully');
      } else {
        console.error('Failed to save entry:', result.error);
        toast.error('Failed to save entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Error saving entry');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditingEntry({ title: entry.title, content: entry.text });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingEntry({ title: '', content: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!user?.id) return;

    try {
      setSaving(true);
      
      // Get fresh session to ensure we have latest token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        console.error('Session error:', sessionError);
        return;
      }
      
      const accessToken = freshSession?.access_token;
      
      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      const title = editingEntry.title || 'Untitled';
      const text = editingEntry.content;

      const response = await fetch('/api/journal', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingId, title, text }),
      });

      console.log('Edit response status:', response.status);
      const result = await response.json();
      console.log('Edit result:', result);

      if (result.success) {
        // Update entry in the list
        setEntries(entries.map(entry => 
          entry.id === editingId ? { ...entry, title, text } : entry
        ));
        setEditingId(null);
        setEditingEntry({ title: '', content: '' });
        toast.success('Entry updated successfully');
      } else {
        console.error('Failed to update entry:', result.error);
        toast.error('Failed to update entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Error updating entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-cyan-900">My Journal</h1>
          <button 
            onClick={() => setIsWriting(!isWriting)}
            className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-full hover:bg-cyan-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Entry</span>
          </button>
        </div>
        {/* New Entry Form */}
        {isWriting && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border-2 border-cyan-200 animate-fadeIn">
            <div className="flex items-center gap-2 text-cyan-600 mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <input
              type="text"
              placeholder="Entry title..."
              value={newEntry.title}
              onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
              className="w-full text-2xl font-bold mb-4 px-0 border-0 focus:outline-none focus:ring-0 placeholder-cyan-300 text-cyan-900"
            />
            <textarea
              placeholder="What's on your mind today?"
              value={newEntry.content}
              onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
              rows={8}
              className="w-full px-0 border-0 focus:outline-none focus:ring-0 placeholder-cyan-300 text-cyan-800 leading-relaxed resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsWriting(false);
                  setNewEntry({ title: '', content: '' });
                }}
                disabled={saving}
                className="px-6 py-2 rounded-full text-cyan-700 hover:bg-cyan-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!newEntry.title && !newEntry.content)}
                className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-cyan-600">Loading entries...</p>
          </div>
        ) : (
          <>
            {/* Journal Entries */}
            <div className="space-y-6">
              {entries.map((entry, index) => (
                <article 
                  key={entry.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border border-cyan-100 group hover:scale-[1.01] duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {editingId === entry.id ? (
                    // Edit Mode
                    <div className="animate-fadeIn">
                      <div className="flex items-center gap-2 text-cyan-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {entry.created_at 
                            ? new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Unknown date'
                          }
                        </span>
                      </div>
                      <input
                        type="text"
                        value={editingEntry.title}
                        onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})}
                        className="w-full text-2xl font-bold mb-4 px-0 border-0 focus:outline-none focus:ring-0 bg-transparent text-cyan-900"
                        placeholder="Entry title..."
                      />
                      <textarea
                        value={editingEntry.content}
                        onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
                        rows={8}
                        className="w-full px-0 border-0 focus:outline-none focus:ring-0 bg-transparent text-cyan-800 leading-relaxed resize-none"
                        placeholder="What's on your mind today?"
                      />
                      <div className="flex gap-3 justify-end mt-4">
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-2 rounded-full text-cyan-700 hover:bg-cyan-100 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-3xl">📝</span>
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-cyan-900 group-hover:text-cyan-700 transition-colors">
                              {entry.title}
                            </h2>
                            <div className="flex items-center gap-2 text-cyan-600 text-sm mt-1">
                              <Calendar className="w-3 h-3" />
                              <time>
                                {entry.created_at 
                                  ? new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                  : 'Unknown date'
                                }
                              </time>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-cyan-700 hover:bg-cyan-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit entry"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                      </div>
                      <p className="text-cyan-800 leading-relaxed mb-4 whitespace-pre-wrap">
                        {entry.text}
                      </p>
                    </>
                  )}
                </article>
              ))}
            </div>

            {entries.length === 0 && !isWriting && (
              <div className="text-center py-20">
                <BookOpen className="w-20 h-20 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-cyan-700 mb-2">Your journal is empty</h3>
                <p className="text-cyan-600 mb-6">Start writing your first entry today</p>
                <button 
                  onClick={() => setIsWriting(true)}
                  className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-full hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Entry</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}