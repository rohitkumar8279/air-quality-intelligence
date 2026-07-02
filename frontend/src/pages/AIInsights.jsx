import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { CityContext } from '../context/CityContext';
import { 
  getAIInsights, 
  getPredictionExplanation, 
  getDailySummary, 
  getHealthAdvice,
  getPollutionAnalysis,
  getWeatherImpact
} from '../services/aiApi';
import { 
  AIInsightsCard, 
  PredictionExplanationCard, 
  DailySummaryCard, 
  HealthRecommendationCard, 
  WeatherImpactCard, 
  ModelInformationCard, 
  AIStatusPanel 
} from '../components/ai/AICards';
import { 
  FeatureImportanceChart, 
  PollutionAnalysisCard, 
  ConfidenceMeter 
} from '../components/ai/AICharts';

const AIInsights = () => {
  const { city } = useContext(CityContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [
          insights,
          explanation,
          summary,
          health,
          pollution,
          weather
        ] = await Promise.all([
          getAIInsights(city),
          getPredictionExplanation(city),
          getDailySummary(city),
          getHealthAdvice(city),
          getPollutionAnalysis(city),
          getWeatherImpact(city)
        ]);
        setData({ insights, explanation, summary, health, pollution, weather });
      } catch (error) {
        console.error("Error loading AI data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [city]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit color="#a855f7" />
            Intelligent Analytics
          </h1>
          <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.95rem', margin: 0 }}>
            AI-powered insights, prediction explanations, and health advice.
          </p>
        </div>
      </div>

      <AIStatusPanel />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <AIInsightsCard />
        <PredictionExplanationCard />
        <DailySummaryCard />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <FeatureImportanceChart />
        <PollutionAnalysisCard />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <WeatherImpactCard />
        <HealthRecommendationCard />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ConfidenceMeter confidence={92} />
          <ModelInformationCard />
        </div>
      </div>
      
    </motion.div>
  );
};

export default AIInsights;
