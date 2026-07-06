/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { SimulationView } from './components/SimulationView';
import { ImpactAnalysis } from './components/ImpactAnalysis';
import { HistoryView } from './components/HistoryView';
import { UrbanParams, SimulationResult, HistoryEntry } from './types';
import { generateUrbanImage, generateImpactAnalysis, generateFlythroughVideo } from './services/gemini';
import { Layout, Map, BarChart3, Key, ExternalLink, History } from 'lucide-react';

import { TEAM_DATA } from './data/teams';

// Declare global types for AI Studio
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);

  const [params, setParams] = useState<UrbanParams>({
    focus: 'A balanced ecosystem integrating nature and tech',
    teams: ['Aviation Innovation District'],
    teamFeatures: {
      'Aviation Innovation District': TEAM_DATA.find(t => t.id === 'Aviation Innovation District')?.features.map(f => f.id) || []
    }
  });

  const [result, setResult] = useState<SimulationResult>({
    analysis: "Adjust the parameters and run the simulation to see the impact analysis.",
    metrics: { economic: 0, social: 0, environmental: 0, feasibility: 0, innovation: 0 },
    loading: false
  });

  const [videoLoading, setVideoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'impact' | 'history'>('visual');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentSimId, setCurrentSimId] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Fallback for dev environments without the aistudio object
        setHasKey(!!process.env.GEMINI_API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleConnectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog closes, or re-check
      setHasKey(true);
      // Force a reload or state update if needed, but usually setting state is enough
    }
  };

  const handleSimulate = async () => {
    setResult(prev => ({ ...prev, loading: true }));
    
    try {
      // Run in parallel
      const [imageUrl, analysisData] = await Promise.all([
        generateUrbanImage(params),
        generateImpactAnalysis(params)
      ]);

      const updatedResult = {
        imageUrl,
        analysis: analysisData.text,
        metrics: analysisData.metrics,
        explanation: analysisData.explanation,
        loading: false
      };

      setResult(updatedResult);

      // Save to history
      const newSimId = Date.now().toString();
      setCurrentSimId(newSimId);
      
      const newEntry: HistoryEntry = {
        id: newSimId,
        timestamp: Date.now(),
        params: { ...params },
        result: updatedResult
      };

      setHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep only past 10
    } catch (error: any) {
      console.error("Simulation failed", error);
      const errorMsg = error.message || String(error);
      alert(`Simulation failed: ${errorMsg}`);
      
      // If permission denied or entity not found, it might mean the key is invalid or not selected properly
      if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('Requested entity was not found')) {
        setHasKey(false); // Force re-selection
      }
      setResult(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGenerateVideo = async () => {
    setVideoLoading(true);
    try {
      const videoUrl = await generateFlythroughVideo(params, result.imageUrl);
      setResult(prev => ({ ...prev, videoUrl }));

      // Update the history entry if video was generated
      if (currentSimId) {
        setHistory(prev => prev.map(entry => {
          if (entry.id === currentSimId) {
            return {
              ...entry,
              result: { ...entry.result, videoUrl }
            };
          }
          return entry;
        }));
      }
    } catch (error: any) {
      console.error("Video generation failed", error);
      alert(error.message || "An unexpected error occurred during video generation.");
    } finally {
      setVideoLoading(false);
    }
  };

  const handleReset = () => {
    setResult({
      imageUrl: undefined,
      videoUrl: undefined,
      analysis: "Adjust the parameters and run the simulation to see the impact analysis.",
      metrics: { economic: 0, social: 0, environmental: 0, feasibility: 0, innovation: 0 },
      loading: false,
      explanation: undefined
    });
    setVideoLoading(false);
    setCurrentSimId(null);
  };

  if (checkingKey) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Google Cloud</h1>
          <p className="text-gray-600 mb-8">
            To use the advanced urban planning simulation features (Gemini 3.1 & Veo), you need to connect a Google Cloud Project with billing enabled.
          </p>
          
          <button
            onClick={handleConnectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Connect API Key
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1"
            >
              Learn more about billing <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 h-full shadow-xl z-10">
        <ControlPanel 
          params={params} 
          onChange={setParams} 
          onSimulate={handleSimulate}
          onReset={handleReset}
          isGenerating={result.loading}
          disabled={!!result.imageUrl || result.loading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reimaginator</h1>
            <p className="text-sm text-gray-500">Urban District Revitalization Simulator</p>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'visual' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-4 h-4" />
              Visualization
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'impact' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Impact Analysis
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'history' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto h-full flex flex-col w-full">
            {activeTab === 'visual' && (
              <div className="flex-1 min-h-[400px]">
                <SimulationView 
                  imageUrl={result.imageUrl}
                  videoUrl={result.videoUrl}
                  loading={result.loading}
                  onGenerateVideo={handleGenerateVideo}
                  videoLoading={videoLoading}
                  teams={params.teams}
                  explanation={result.explanation}
                />
              </div>
            )}
            
            {activeTab === 'impact' && (
              <div className="flex-1">
                <ImpactAnalysis 
                  metrics={result.metrics}
                  analysis={result.analysis}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex-1">
                <HistoryView 
                  history={history}
                  onRestore={(entry) => {
                    setParams(entry.params);
                    setResult(entry.result);
                    setCurrentSimId(entry.id);
                    setActiveTab('visual');
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

