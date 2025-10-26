"use client"
import React, { useState } from 'react';
import { BookOpen, Plus, Calendar, Tag, Search } from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '2025-10-26',
      title: 'A Beautiful Sunday',
      content: 'Today was filled with peaceful moments and quiet reflection. The weather was perfect for a walk in the park...',
      tags: ['gratitude', 'nature'],
      mood: '😊'
    },
    {
      id: 2,
      date: '2025-10-25',
      title: 'Productive Day',
      content: 'Accomplished so much today! Finished the project I\'ve been working on and feeling really satisfied with the progress...',
      tags: ['work', 'achievement'],
      mood: '🎉'
    },
    {
      id: 3,
      date: '2025-10-24',
      title: 'Evening Thoughts',
      content: 'Sometimes the quiet evenings are the best. Just me, a cup of tea, and my thoughts wandering freely...',
      tags: ['reflection', 'peace'],
      mood: '☕'
    }
  ]);

  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', tags: '' });

  const handleSave = () => {
    if (newEntry.title || newEntry.content) {
      setEntries([{
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: newEntry.title || 'Untitled',
        content: newEntry.content,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        mood: '📝'
      }, ...entries]);
      setNewEntry({ title: '', content: '', tags: '' });
      setIsWriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cyan-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-cyan-600" />
              <h1 className="text-3xl font-bold text-cyan-900">My Journal</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-cyan-100 rounded-full transition-colors">
                <Search className="w-5 h-5 text-cyan-700" />
              </button>
              <button 
                onClick={() => setIsWriting(!isWriting)}
                className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Entry</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
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
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-cyan-600" />
              <input
                type="text"
                placeholder="Add tags (comma separated)"
                value={newEntry.tags}
                onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                className="flex-1 px-2 py-1 border-0 border-b border-cyan-200 focus:outline-none focus:border-cyan-400 placeholder-cyan-300 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsWriting(false);
                  setNewEntry({ title: '', content: '', tags: '' });
                }}
                className="px-6 py-2 rounded-full text-cyan-700 hover:bg-cyan-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg"
              >
                Save Entry
              </button>
            </div>
          </div>
        )}

        {/* Journal Entries */}
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <article 
              key={entry.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border border-cyan-100 group hover:scale-[1.01] duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entry.mood}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-900 group-hover:text-cyan-700 transition-colors">
                      {entry.title}
                    </h2>
                    <div className="flex items-center gap-2 text-cyan-600 text-sm mt-1">
                      <Calendar className="w-3 h-3" />
                      <time>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-cyan-800 leading-relaxed mb-4">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {entry.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium hover:bg-cyan-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
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
      </main>
    </div>
  );
}