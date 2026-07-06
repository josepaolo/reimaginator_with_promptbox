import React from 'react';
import { HistoryEntry } from '../types';
import { Clock, History, LayoutTemplate, Map, BarChart3, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryViewProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
}

export function HistoryView({ history, onRestore }: HistoryViewProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 pt-16">
        <History className="w-16 h-16 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No History Yet</h3>
        <p className="text-sm">Run your first simulation to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
      {history.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col pt-1"
        >
          <div className="relative aspect-video bg-gray-100 flex items-center justify-center border-b border-gray-100">
            {entry.result.imageUrl ? (
              <img 
                src={entry.result.imageUrl} 
                alt="Simulation Thumbnail" 
                className="w-full h-full object-cover"
              />
            ) : (
              <LayoutTemplate className="w-8 h-8 text-gray-300" />
            )}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {entry.result.videoUrl && (
              <div className="absolute top-2 left-2 bg-indigo-600 font-medium text-white px-2 py-1 rounded text-[10px] uppercase shadow">
                Video
              </div>
            )}
          </div>
          
          <div className="p-5 flex-1 flex flex-col space-y-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1" title={entry.result.explanation?.theme || 'Simulation'}>
                {entry.result.explanation?.theme || 'Urban Simulation'}
              </h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                <span className="font-medium text-gray-700">Focus:</span> {entry.params.focus}
              </p>
              
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Map className="w-3.5 h-3.5 text-gray-400" />
                  <span>{entry.params.teams.length} Sources</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Score: {
                    Math.round(Object.values(entry.result.metrics).reduce((a, b) => a + b, 0) / 5)
                  }</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onRestore(entry)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restore State
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
