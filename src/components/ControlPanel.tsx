import React from 'react';
import { UrbanParams } from '../types';
import { Sliders, Zap, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { TEAM_DATA } from '../data/teams';

interface ControlPanelProps {
  params: UrbanParams;
  onChange: (newParams: UrbanParams) => void;
  onSimulate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export function ControlPanel({ params, onChange, onSimulate, onReset, isGenerating, disabled }: ControlPanelProps) {
  const handleChange = (key: keyof UrbanParams, value: any) => {
    if (!disabled) {
      onChange({ ...params, [key]: value });
    }
  };

  const toggleTeam = (teamId: string) => {
    if (disabled) return;
    const currentTeams = params.teams || [];
    const team = TEAM_DATA.find(t => t.id === teamId);
    
    if (currentTeams.includes(teamId)) {
      handleChange('teams', currentTeams.filter(t => t !== teamId));
      // Optionally remove features for this team
      if (params.teamFeatures) {
        const newFeatures = { ...params.teamFeatures };
        delete newFeatures[teamId];
        handleChange('teamFeatures', newFeatures);
      }
    } else {
      handleChange('teams', [...currentTeams, teamId]);
      // Auto-select all subfeatures when a team is connected
      if (team) {
        const newFeatures = { ...params.teamFeatures, [teamId]: team.features.map(f => f.id) };
        handleChange('teamFeatures', newFeatures);
      }
    }
  };

  const toggleFeature = (teamId: string, featureId: string) => {
    if (disabled) return;
    const teamFeats = params.teamFeatures?.[teamId] || [];
    let newTeamFeats;
    if (teamFeats.includes(featureId)) {
      newTeamFeats = teamFeats.filter(f => f !== featureId);
    } else {
      newTeamFeats = [...teamFeats, featureId];
    }
    handleChange('teamFeatures', { ...params.teamFeatures, [teamId]: newTeamFeats });
  };

  const [expandedTeam, setExpandedTeam] = React.useState<string | null>(null);

  const handleTeamExpand = (teamId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className={`h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto ${disabled ? 'opacity-80' : ''}`}>
      <div className="p-6 border-b border-gray-200 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Reimaginator
        </h2>
        <p className="text-sm text-gray-500 mt-1">Urban Simulator</p>
      </div>

      <div className={`p-6 space-y-8 flex-1 overflow-y-auto ${disabled ? 'pointer-events-none grayscale-[0.5]' : ''}`}>
        
        {/* Team Selector (Multi-select) */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Inspiration Sources
          </label>
          <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {TEAM_DATA.map((t) => {
              const checked = params.teams?.includes(t.id);
              const selectedFeatureCount = params.teamFeatures?.[t.id]?.length || 0;
              const isExpanded = expandedTeam === t.id;
              
              return (
                <div key={t.id} className="flex flex-col space-y-1 bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
                  <div className="flex items-center hover:bg-gray-50 transition-colors p-1.5 group">
                    <label className="flex items-start space-x-3 cursor-pointer flex-1">
                      <input 
                        type="checkbox" 
                        checked={checked}
                        onChange={() => toggleTeam(t.id)}
                        disabled={disabled}
                        className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <span className="text-xs text-gray-800 font-medium leading-tight group-hover:text-indigo-700 transition-colors">{t.label}</span>
                        {checked && (
                          <p className="text-[10px] text-gray-500 mt-0.5">{selectedFeatureCount} of {t.features.length} features selected</p>
                        )}
                      </div>
                    </label>
                    <button 
                      onClick={(e) => handleTeamExpand(t.id, e)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {/* Subfeatures */}
                  {isExpanded && (
                    <div className="px-3 pb-2 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-1.5">
                      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2 mt-1">Specific Features</div>
                      {t.features.map(f => (
                        <label key={f.id} className="flex items-start space-x-2.5 cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors group">
                          <input 
                            type="checkbox" 
                            checked={params.teamFeatures?.[t.id]?.includes(f.id) ?? false}
                            onChange={() => toggleFeature(t.id, f.id)}
                            disabled={disabled || !checked}
                            className="mt-0.5 h-3.5 w-3.5 text-indigo-500 rounded-sm border-gray-300 focus:ring-indigo-500 disabled:opacity-50"
                          />
                          <span className={`text-[11px] leading-tight ${(!checked || disabled) ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-900'}`}>{f.label}</span>
                        </label>
                      ))}
                      {!checked && (
                        <div className="text-[10px] text-amber-600 bg-amber-50 p-1.5 rounded mt-2 border border-amber-100">
                          Connect this source to include its features in the simulation.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus Area - Chat Prompt */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Strategic Focus
          </label>
          <div className="relative">
            <textarea
              value={params.focus}
              onChange={(e) => handleChange('focus', e.target.value)}
              disabled={disabled}
              placeholder="Describe the strategic focus you would like to include."
              className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <div className="px-2 py-1 bg-white/80 backdrop-blur rounded text-[10px] text-gray-400 border border-gray-100">
                AI Powered
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 italic">
            Tip: Try "A biophilic tech hub with 24/7 autonomous transit and urban farming."
          </p>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
        {disabled && !isGenerating ? (
          <button
            onClick={onReset}
            className="w-full py-3 px-4 rounded-xl text-white font-medium shadow-sm transition-all bg-gray-800 hover:bg-gray-900 hover:shadow-md active:transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Reset Configuration
          </button>
        ) : (
          <button
            onClick={onSimulate}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-sm transition-all ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:transform active:scale-[0.98]'
            }`}
          >
            {isGenerating ? 'Simulating...' : 'Run Simulation'}
          </button>
        )}
      </div>
    </div>
  );
}
