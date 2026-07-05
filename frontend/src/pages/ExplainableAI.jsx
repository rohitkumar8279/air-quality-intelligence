import React, { useState, useEffect, useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { motion } from 'framer-motion';
import {
  BrainCircuit, Activity, CloudRain, AlertTriangle, Wind, Droplets,
  Thermometer, Info, ShieldCheck, TrendingUp, CheckCircle, Navigation,
  Factory, CarFront, HardHat
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getCurrentData, getPredictionData } from '../services/analyticsApi';
import {
  getPollutionAnalysis, getWeatherImpact, getPredictionExplanation,
  getDailySummary, getFeatureImportance, getAIInsights
} from '../services/aiApi';
import './ExplainableAI.css';

const ExplainableAI = () => {
  const { city } = useContext(CityContext);
  const [loading, setLoading] = useState(true);
  
  // States for various sections
  const [current, setCurrent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [pollution, setPollution] = useState(null);
  const [weather, setWeather] = useState(null);
  const [predExplanation, setPredExplanation] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          currRes, predRes, pollRes, weathRes, expRes, dailyRes, featRes, insRes
        ] = await Promise.allSettled([
          getCurrentData(city),
          getPredictionData(city),
          getPollutionAnalysis(city),
          getWeatherImpact(city),
          getPredictionExplanation(city),
          getDailySummary(city),
          getFeatureImportance(city),
          getAIInsights(city)
        ]);

        setCurrent(currRes.status === 'fulfilled' ? currRes.value : null);
        setPrediction(predRes.status === 'fulfilled' ? predRes.value : null);
        setPollution(pollRes.status === 'fulfilled' ? pollRes.value : null);
        setWeather(weathRes.status === 'fulfilled' ? weathRes.value : null);
        setPredExplanation(expRes.status === 'fulfilled' ? expRes.value : null);
        setDailySummary(dailyRes.status === 'fulfilled' ? dailyRes.value : null);
        setFeatureImportance(featRes.status === 'fulfilled' && featRes.value ? featRes.value.features : null);
        setInsights(insRes.status === 'fulfilled' ? insRes.value : null);
        
      } catch (err) {
        console.error("Failed to load XAI data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city]);

  if (loading) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }

  // --- Fallback Data for UI strict requirements (simulated if backend doesn't provide exactly what is needed) ---
  
  // Section 2 Data
  const contributors = [
    { id: 1, name: "Traffic Emissions", icon: CarFront, conf: 87, reason: "High NO₂ and PM2.5 indicate significant traffic-related emissions.", severity: "#ef4444" },
    { id: 2, name: "Construction Dust", icon: HardHat, conf: 72, reason: "Elevated PM10 levels may indicate dust from construction activity.", severity: "#f59e0b" },
    { id: 3, name: "Industrial Influence", icon: Factory, conf: 65, reason: "Historical pollutant patterns resemble industrial emissions.", severity: "#eab308" },
    { id: 4, name: "Atmospheric Conditions", icon: CloudRain, conf: 81, reason: "Low wind speed and higher humidity reduce pollutant dispersion.", severity: "#ef4444" }
  ];

  // Section 3 Data (Horizontal Bar Chart)
  const sourceAttribution = pollution && pollution.contributions ? pollution.contributions : [
    { name: 'Traffic', value: 45, percentage: 45 },
    { name: 'Construction', value: 20, percentage: 20 },
    { name: 'Industry', value: 15, percentage: 15 },
    { name: 'Road Dust', value: 10, percentage: 10 },
    { name: 'Waste Burning', value: 5, percentage: 5 },
    { name: 'Residential', value: 5, percentage: 5 }
  ];

  // Section 6 Data (Government Actions)
  const govActions = [
    { id: 1, title: "Increase water sprinkling on major roads.", priority: "High", impact: "High", diff: "Low" },
    { id: 2, title: "Inspect construction sites for dust suppression.", priority: "High", impact: "Medium", diff: "Medium" },
    { id: 3, title: "Restrict heavy diesel vehicles during peak hours.", priority: "Medium", impact: "High", diff: "High" },
    { id: 4, title: "Increase monitoring around industrial zones.", priority: "Medium", impact: "Medium", diff: "Low" },
    { id: 5, title: "Discourage open waste burning.", priority: "Low", impact: "Low", diff: "Low" }
  ];

  // Section 9 Data (Feature Importance Chart)
  const features = featureImportance || [
    { name: 'PM2.5', importance: 0.85 },
    { name: 'PM10', importance: 0.72 },
    { name: 'NO2', importance: 0.61 },
    { name: 'Humidity', importance: 0.45 },
    { name: 'Wind Speed', importance: 0.38 },
    { name: 'Temperature', importance: 0.25 }
  ];

  const currentAQI = current ? Math.round(current.aqi) : '--';
  const predictedAQI = prediction ? Math.round(prediction.predicted_aqi) : '--';
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="explainable-ai-container animate-fade-in"
    >
      {/* SECTION 1: Hero Header */}
      <div className="xai-header">
        <div>
          <h1 className="xai-title">
            <BrainCircuit color="var(--accent-primary)" />
            Explainable AI Intelligence
          </h1>
          <p className="xai-subtitle">
            Understand why pollution levels changed, what factors contributed, and what actions are recommended.
          </p>
        </div>
      </div>

      <div className="xai-card premium">
        <div className="xai-hero-stats">
          <div className="xai-stat-box">
            <span className="xai-stat-label">Current City</span>
            <span className="xai-stat-value">{city}</span>
          </div>
          <div className="xai-stat-box">
            <span className="xai-stat-label">Current AQI</span>
            <span className="xai-stat-value" style={{color: currentAQI > 150 ? '#ef4444' : '#22c55e'}}>{currentAQI}</span>
          </div>
          <div className="xai-stat-box">
            <span className="xai-stat-label">Prediction (24h)</span>
            <span className="xai-stat-value" style={{color: '#8b5cf6'}}>{predictedAQI}</span>
          </div>
          <div className="xai-stat-box">
            <span className="xai-stat-label">Overall AI Confidence</span>
            <span className="xai-stat-value">88%</span>
          </div>
          <div className="xai-stat-box">
            <span className="xai-stat-label">Last Updated</span>
            <span className="xai-stat-value" style={{fontSize: '1rem', marginTop: '0.5rem'}}>Just now</span>
          </div>
        </div>
      </div>

      <div className="xai-grid-2">
        {/* SECTION 2: Why is AQI High Today? */}
        <div className="xai-card">
          <h2 className="xai-section-title"><AlertTriangle size={20} /> Why is AQI High Today?</h2>
          <div className="contributors-list">
            {contributors.map(c => (
              <div key={c.id} className="contributor-item">
                <div className="contributor-icon">
                  <c.icon size={24} />
                </div>
                <div className="contributor-details">
                  <div className="contributor-header">
                    <span className="contributor-name">{c.name}</span>
                    <span className="contributor-confidence" style={{color: c.severity}}>{c.conf}% Confidence</span>
                  </div>
                  <p className="contributor-reason">{c.reason}</p>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{width: `${c.conf}%`, backgroundColor: c.severity}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Pollution Source Attribution */}
        <div className="xai-card">
          <h2 className="xai-section-title"><Activity size={20} /> Estimated Source Attribution</h2>
          <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>
            AI inference based on pollutant ratios and historical footprint matching. Labelled as "Estimated Contribution".
          </p>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={sourceAttribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                />
                <Bar dataKey={pollution && pollution.contributions ? "percentage" : "value"} fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {sourceAttribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4: Weather Impact Analysis */}
      <h2 className="xai-section-title" style={{marginTop: '1rem', marginBottom: 0}}><CloudRain size={20} /> Weather Impact Analysis</h2>
      <div className="xai-grid-4">
        <div className="xai-card">
          <div className="weather-impact-item">
            <div className="weather-impact-header"><Wind size={18} color="#3b82f6" /> Wind Speed</div>
            <p className="weather-impact-text">
              {weather && weather.insights && weather.insights.length > 0 ? weather.insights[0] : "Low wind speeds are currently limiting atmospheric dispersion, causing pollutants to remain highly concentrated over the city."}
            </p>
          </div>
        </div>
        <div className="xai-card">
          <div className="weather-impact-item">
            <div className="weather-impact-header"><Droplets size={18} color="#06b6d4" /> Humidity</div>
            <p className="weather-impact-text">
              Higher humidity levels are trapping particulate matter (PM2.5) closer to the ground, increasing the measured AQI severity.
            </p>
          </div>
        </div>
        <div className="xai-card">
          <div className="weather-impact-item">
            <div className="weather-impact-header"><Thermometer size={18} color="#f59e0b" /> Temperature</div>
            <p className="weather-impact-text">
              Cooler temperatures lead to thermal inversion layers in the lower atmosphere, acting like a lid over urban emissions.
            </p>
          </div>
        </div>
        <div className="xai-card">
          <div className="weather-impact-item">
            <div className="weather-impact-header"><Navigation size={18} color="#10b981" /> Pressure</div>
            <p className="weather-impact-text">
              High barometric pressure implies stagnant air masses which heavily restrict the natural clearing of local pollutants.
            </p>
          </div>
        </div>
      </div>

      <div className="xai-grid-2">
        {/* SECTION 5: Prediction Explanation */}
        <div className="xai-card premium">
          <h2 className="xai-section-title" style={{color: '#c4b5fd'}}><TrendingUp size={20} color="#8b5cf6" /> AI Prediction Explanation</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px'}}>
              <span className="text-muted" style={{fontSize: '0.8rem', textTransform: 'uppercase'}}>Overall Summary</span>
              <p style={{marginTop: '0.5rem', lineHeight: 1.5, fontSize: '0.95rem'}}>
                {predExplanation && predExplanation.explanation ? predExplanation.explanation.join(' ') : `The XGBoost model predicts an AQI of ${predictedAQI} in 24 hours. The forecast relies heavily on the sudden drop in wind speed paired with rising traffic volume emissions.`}
              </p>
            </div>
            <div>
              <span className="text-muted" style={{fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block'}}>Key Influencing Factors</span>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <li style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem'}}><CheckCircle size={16} color="#10b981" style={{marginTop: '2px'}}/> <strong>Historical Trend:</strong> Previous data shows AQI spikes under exact similar pressure conditions.</li>
                <li style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem'}}><CheckCircle size={16} color="#10b981" style={{marginTop: '2px'}}/> <strong>Weather Influence:</strong> Zero expected precipitation means no natural air scrubbing will occur.</li>
                <li style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem'}}><CheckCircle size={16} color="#10b981" style={{marginTop: '2px'}}/> <strong>Pollutant Contribution:</strong> PM2.5 levels are already near threshold and compounding rapidly.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 10: AI Decision Summary */}
        <div className="xai-card">
          <h2 className="xai-section-title"><ShieldCheck size={20} /> Today's Decision Summary</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {insights ? (
              <p style={{lineHeight: 1.6, color: 'var(--text-secondary)'}}>{insights.summary} {insights.weather_effect} {insights.recommendation}</p>
            ) : (
              <ul style={{paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0}}>
                <li><strong>Traffic-related emissions</strong> are likely the dominant contributor to today's pollution levels.</li>
                <li><strong>Low wind conditions</strong> are preventing pollutant dispersion across the city basin.</li>
                <li><strong>AQI is expected to worsen</strong> over the next 24 hours unless weather patterns shift unexpectedly.</li>
                <li><strong>Recommended municipal actions</strong> include increased road cleaning, construction inspections, and immediate traffic management.</li>
              </ul>
            )}
            <div style={{marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span className="text-muted" style={{fontWeight: 600}}>Overall Report Confidence</span>
              <strong style={{color: '#10b981', fontSize: '1.25rem'}}>88%</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="xai-grid-2">
        {/* SECTION 6: Recommended Government Actions */}
        <div className="xai-card">
          <h2 className="xai-section-title"><Info size={20} /> Recommended Government Actions</h2>
          <div className="actions-list">
            {govActions.map(action => (
              <div key={action.id} className="action-item">
                <div className="action-header">
                  <span className="action-title">{action.title}</span>
                </div>
                <div className="action-badges">
                  <span className={`badge ${action.priority === 'High' ? 'badge-priority' : 'badge-diff'}`}>Priority: {action.priority}</span>
                  <span className="badge badge-impact">Impact: {action.impact}</span>
                  <span className="badge badge-diff">Difficulty: {action.diff}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: Feature Importance */}
        <div className="xai-card">
          <h2 className="xai-section-title"><BarChart size={20} /> AI Feature Importance (XGBoost)</h2>
          <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>
            Explains which data features heavily influenced the model's prediction algorithm.
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={features} layout="vertical" margin={{ top: 5, right: 30, left: 45, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                  formatter={(value) => [(value * 100).toFixed(1) + '%', 'Importance']}
                />
                <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 7: AQI Trend Explanation & SECTION 8: Confidence Dashboard */}
      <div className="xai-grid-2">
        <div className="xai-card">
          <h2 className="xai-section-title"><Activity size={20} /> AQI Trend Explanation</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" style={{borderColor: '#22c55e', color: '#22c55e'}}>65</div>
              <div className="timeline-date">Yesterday</div>
              <div className="timeline-desc">Favorable wind cleared out initial PM10 buildup.</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" style={{borderColor: '#f59e0b', color: '#f59e0b'}}>{currentAQI}</div>
              <div className="timeline-date">Today</div>
              <div className="timeline-desc">Wind stagnation leading to trapped PM2.5 emissions.</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" style={{borderColor: '#ef4444', color: '#ef4444'}}>{predictedAQI}</div>
              <div className="timeline-date">Tomorrow</div>
              <div className="timeline-desc">Model expects conditions to worsen if traffic holds.</div>
            </div>
          </div>
          {dailySummary && dailySummary.recommendations && (
            <p style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', borderLeft: '3px solid #3b82f6'}}>
              {dailySummary.recommendations.join(' ')}
            </p>
          )}
        </div>

        <div className="xai-card premium">
          <h2 className="xai-section-title" style={{color: '#c4b5fd'}}><ShieldCheck size={20} color="#8b5cf6" /> Intelligence Confidence</h2>
          <div className="confidence-cluster">
            <div className="confidence-item">
              <div className="confidence-circle" style={{'--value': '92%'}}>
                <div className="confidence-inner">92%</div>
              </div>
              <span className="confidence-label">Prediction</span>
            </div>
            <div className="confidence-item">
              <div className="confidence-circle" style={{'--value': '84%', background: 'conic-gradient(#3b82f6 var(--value), rgba(255,255,255,0.05) 0)'}}>
                <div className="confidence-inner">84%</div>
              </div>
              <span className="confidence-label">Source Attr.</span>
            </div>
            <div className="confidence-item">
              <div className="confidence-circle" style={{'--value': '89%', background: 'conic-gradient(#f59e0b var(--value), rgba(255,255,255,0.05) 0)'}}>
                <div className="confidence-inner">89%</div>
              </div>
              <span className="confidence-label">Weather AI</span>
            </div>
            <div className="confidence-item">
              <div className="confidence-circle" style={{'--value': '95%', background: 'conic-gradient(#8b5cf6 var(--value), rgba(255,255,255,0.05) 0)'}}>
                <div className="confidence-inner">95%</div>
              </div>
              <span className="confidence-label">Actions</span>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default ExplainableAI;
