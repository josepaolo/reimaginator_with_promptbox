import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Loader2, 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Info,
  ChevronRight,
  LayoutTemplate
} from 'lucide-react';

interface SimulationViewProps {
  imageUrl?: string;
  videoUrl?: string;
  loading: boolean;
  onGenerateVideo: () => void;
  videoLoading: boolean;
  teams?: string[];
  explanation?: {
    theme: string;
    features: string[];
  };
}

export function SimulationView({ 
  imageUrl, 
  videoUrl, 
  loading, 
  onGenerateVideo, 
  videoLoading, 
  teams, 
  explanation 
}: SimulationViewProps) {
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'fit' | 'zoom'>('fit');
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to fetch video if videoUrl is provided
  React.useEffect(() => {
    if (videoUrl && !videoBlobUrl) {
      const fetchVideo = async () => {
        try {
          const res = await fetch(videoUrl, {
            headers: {
              'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || ''
            }
          });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setVideoBlobUrl(url);
        } catch (e) {
          console.error("Failed to fetch video", e);
        }
      };
      fetchVideo();
    }
  }, [videoUrl]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'fit' ? 'zoom' : 'fit');
  };

  return (
    <div className={`flex flex-col bg-white shadow-sm border border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full rounded-xl'}`}>
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-600" />
            Simulation Output
          </h2>
          {loading && <span className="text-xs text-indigo-600 animate-pulse font-medium">Generating...</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-px bg-gray-200 mx-1" />
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors ${viewMode === 'zoom' ? 'bg-gray-100 text-gray-900' : ''}`}
            title={viewMode === 'fit' ? "Zoom In" : "Fit to Screen"}
            disabled={!imageUrl}
          >
            {viewMode === 'fit' ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showInfoPanel 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            disabled={!explanation}
          >
            <Info className="w-4 h-4" />
            <span>Explanation</span>
          </button>

          <div className="flex flex-col items-center ml-2">
            <button 
              onClick={onGenerateVideo}
              disabled={videoLoading || !!videoBlobUrl || !imageUrl}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {videoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {videoBlobUrl ? 'Video Ready' : 'Generate Video'}
            </button>
            <span className="text-[10px] text-gray-400 mt-0.5">up to 1 min</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Image Canvas */}
        <div 
          ref={containerRef}
          className={`flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center ${viewMode === 'zoom' ? 'overflow-auto' : ''}`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-sm font-medium text-gray-500">Creating your urban vision...</p>
            </div>
          ) : imageUrl ? (
            <div className={`relative flex items-center justify-center ${viewMode === 'fit' ? 'w-full h-full p-4' : 'min-w-full min-h-full'}`}>
              <div className={`relative ${viewMode === 'fit' ? 'aspect-video max-w-full max-h-full' : 'w-full h-full'}`}>
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={imageUrl} 
                  alt="Urban Simulation" 
                  className={`transition-all duration-300 ${
                    viewMode === 'fit' 
                      ? 'w-full h-full object-contain' 
                      : 'w-auto h-auto min-w-full min-h-full object-cover'
                  }`}
                  style={viewMode === 'zoom' ? { maxWidth: 'none', maxHeight: 'none' } : {}}
                />
              </div>

              {/* Video Overlay */}
              {videoBlobUrl && (
                <div className="absolute inset-0 bg-black z-30 flex items-center justify-center">
                  <video 
                    src={videoBlobUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain" 
                  />
                  <button 
                    onClick={() => setVideoBlobUrl(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">Configure parameters and run simulation</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Explanation */}
        <AnimatePresence>
          {showInfoPanel && explanation && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="border-l border-gray-200 bg-white flex flex-col shrink-0 z-10 shadow-xl"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Analysis</h3>
                <button 
                  onClick={() => setShowInfoPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">Core Theme</span>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{explanation.theme}</h2>
                </div>

                {teams && teams.length > 0 && (
                  <div className="mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-1 block">Inspired By</span>
                    <div className="flex flex-wrap gap-2">
                      {teams.map(t => (
                        <span key={t} className="text-sm text-indigo-700 font-medium bg-white px-2 py-0.5 rounded shadow-sm border border-indigo-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Key Features</span>
                  <ul className="space-y-4">
                    {explanation.features.map((feature, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
