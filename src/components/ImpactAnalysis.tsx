import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ImpactMetrics } from '../types';
import { motion } from 'motion/react';

interface ImpactAnalysisProps {
  metrics: ImpactMetrics;
  analysis: string;
}

export function ImpactAnalysis({ metrics, analysis }: ImpactAnalysisProps) {
  const data = [
    { subject: 'Economic', A: metrics.economic, fullMark: 100 },
    { subject: 'Social', A: metrics.social, fullMark: 100 },
    { subject: 'Eco', A: metrics.environmental, fullMark: 100 },
    { subject: 'Feasibility', A: metrics.feasibility, fullMark: 100 },
    { subject: 'Innovation', A: metrics.innovation, fullMark: 100 },
  ];

  const coreMetrics = [metrics.economic, metrics.social, metrics.environmental, metrics.feasibility, metrics.innovation];
  const overallScore = Math.round(coreMetrics.reduce((a, b) => a + b, 0) / 5);
  const topMetric = Object.entries(metrics)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return (
    <div className="flex flex-col space-y-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Dimensions</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Text Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assessment</h3>
          <div className="prose prose-sm text-gray-600 flex-1 overflow-y-auto space-y-4">
            <p className="leading-relaxed">{analysis}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Overall Score</p>
              <p className="text-2xl font-bold text-indigo-600">
                {overallScore}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Top Metric</p>
              <p className="text-sm font-bold text-gray-900 capitalize mt-1">
                {topMetric}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
