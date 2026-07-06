export interface TeamFeature {
  id: string;
  label: string;
}

export interface TeamData {
  id: string;
  label: string;
  description: string;
  features: TeamFeature[];
}

export const TEAM_DATA: TeamData[] = [
  {
    id: 'Aviation Innovation District',
    label: 'Team 1 (Aviation Innovation District)',
    description: '"Flower" district — petals for transit, education, industry, community & green; nucleus at the district core.',
    features: [
      { id: 'flower-layout', label: 'Flower District Layout' },
      { id: 'transit-petal', label: 'Transit Petal' },
      { id: 'education-petal', label: 'Education Petal' },
      { id: 'industry-petal', label: 'Industry Petal' },
      { id: 'community-petal', label: 'Community & Green Petal' }
    ]
  },
  {
    id: 'Changi Nexus',
    label: 'Team 2 (Changi Nexus)',
    description: 'Central Nexus hub + AI-managed Autonomous Loop bus circuit connecting all nodes.',
    features: [
      { id: 'nexus-hub', label: 'Central Nexus Hub' },
      { id: 'autonomous-loop', label: 'AI-Managed Autonomous Loop' },
      { id: 'bus-circuit', label: 'Bus Circuit Connectors' }
    ]
  },
  {
    id: 'Living Laboratory',
    label: 'Team 3 (Living Laboratory)',
    description: 'Decentralised nexus network linked by "Infinite Loop" walking/cycling path; 24/7 adaptive infrastructure.',
    features: [
      { id: 'decentralised-network', label: 'Decentralised Nexus Network' },
      { id: 'infinite-loop-path', label: '"Infinite Loop" Path' },
      { id: 'adaptive-infra', label: '24/7 Adaptive Infrastructure' }
    ]
  },
  {
    id: 'Liveable Development City',
    label: 'Team 4 (Liveable Development City)',
    description: 'AI-compute spine + robotics yard + Robowalk piezoelectric pavements — Global Physical AI reference site.',
    features: [
      { id: 'compute-spine', label: 'AI-Compute Spine' },
      { id: 'robotics-yard', label: 'Robotics Yard' },
      { id: 'robowalk', label: 'Robowalk Piezoelectric Pavements' },
      { id: 'physical-ai-site', label: 'Physical AI Reference Site' }
    ]
  },
  {
    id: 'Physical AI Oasis',
    label: 'Team 5 (Physical AI Oasis)',
    description: 'Compute-to-Comfort Loop: clean energy -> edge compute -> waste-heat Climate Oasis parks -> human footfall -> AI data.',
    features: [
      { id: 'compute-comfort', label: 'Compute-to-Comfort Loop' },
      { id: 'edge-compute', label: 'Edge Compute Infrastructure' },
      { id: 'climate-oasis', label: 'Climate Oasis Parks' },
      { id: 'footfall-data', label: 'Human Footfall Data' }
    ]
  },
  {
    id: 'Regenerative Innovation District',
    label: 'Team 6 (Regenerative Innovation District)',
    description: 'Transit, tech & urban food systems as one ecosystem; Origami Greenhouse agrivoltaics, wetlands, circular economy.',
    features: [
      { id: 'transit-tech-food', label: 'Transit, Tech & Food Ecosystem' },
      { id: 'origami-greenhouse', label: 'Origami Greenhouse Agrivoltaics' },
      { id: 'wetlands', label: 'Constructed Wetlands' },
      { id: 'circular-economy', label: 'Circular Economy Hubs' }
    ]
  },
  {
    id: 'Aviation Innovation Capital',
    label: 'Team 7 (Aviation Innovation Capital)',
    description: 'Technical + social capacity model: transport logistics, autonomous transport, residential clusters, childcare.',
    features: [
      { id: 'capacity-model', label: 'Technical & Social Capacity Model' },
      { id: 'logistics-centers', label: 'Transport Logistics Centers' },
      { id: 'autonomous-integration', label: 'Autonomous Transport Integration' },
      { id: 'residential-clusters', label: 'Residential & Childcare Clusters' }
    ]
  },
  {
    id: 'Aero-Blue Sandbox',
    label: 'Team 8 (Aero-Blue Sandbox)',
    description: '"Eco-Blue" floodable plaza (water park / stormwater basin / coastal R&D) + global talent housing + tech hub.',
    features: [
      { id: 'eco-blue', label: '"Eco-Blue" Floodable Plaza' },
      { id: 'stormwater-basin', label: 'Stormwater / Coastal R&D Basin' },
      { id: 'talent-housing', label: 'Global Talent Housing' },
      { id: 'tech-hub', label: 'Tech Hub' }
    ]
  }
];
