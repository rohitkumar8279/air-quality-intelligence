import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Baby, PersonStanding, Wind, Heart, UserCircle2, Dumbbell, ShieldAlert, Car, Home, Droplet, AlertOctagon } from 'lucide-react';

const AdviceCard = ({ title, advice, icon: Icon, color, delay }) => (
  <motion.div 
    className="card"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay * 0.1, duration: 0.4 }}
    whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}
    style={{ 
      padding: '1.5rem', 
      borderLeft: `4px solid ${color}`,
      background: `linear-gradient(90deg, ${color}10 0%, var(--bg-card) 20%)`
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}20`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: color }}>
        <Icon size={20} />
      </div>
      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</h3>
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
      {advice}
    </p>
  </motion.div>
);

const HealthCards = ({ aqi }) => {
  if (aqi === null || aqi === undefined) return null;
  const roundedAqi = Math.round(aqi);

  let statusColor = 'var(--status-good)';
  let levels = {
    general: 'Air quality is ideal for most individuals; enjoy your normal outdoor activities.',
    children: 'It is a great day to be active outside.',
    seniors: 'Enjoy activities outside without any restrictions.',
    asthma: 'Extremely unlikely to cause any respiratory symptoms.',
    heart: 'No risk. Safe for all activities.',
    pregnant: 'Safe for outdoor exercise and activities.',
    outdoor: 'Perfect conditions for running or cycling outdoors.',
    mask: 'No mask required.',
    travel: 'Ideal conditions for travel and sightseeing.',
    window: 'Open your windows to bring in fresh air.',
    water: 'Maintain normal hydration levels.',
    emergency: null
  };

  if (roundedAqi > 50) {
    statusColor = 'var(--status-moderate)';
    levels = {
      ...levels,
      general: 'Air quality is acceptable; some pollutants may be a moderate health concern.',
      children: 'Usually fine, but unusually sensitive children should reduce prolonged exertion.',
      asthma: 'Those with severe asthma should keep their inhalers handy.',
      outdoor: 'Good conditions, but sensitive groups should take it easy.',
      mask: 'Consider a mask if you are highly sensitive to particulate matter.',
      window: 'You can still open windows, but close them during peak traffic hours.'
    };
  }

  if (roundedAqi > 100) {
    statusColor = 'var(--status-poor)';
    levels = {
      general: 'Members of sensitive groups may experience health effects.',
      children: 'Limit prolonged outdoor exertion. Take frequent breaks.',
      seniors: 'Avoid strenuous outdoor activities. Stay hydrated.',
      asthma: 'High risk of symptoms. Limit outdoor exposure.',
      heart: 'Reduce heavy exertion. Monitor for palpitations.',
      pregnant: 'Minimize time spent in highly polluted areas.',
      outdoor: 'Avoid intense outdoor exercise; switch to indoor activities.',
      mask: 'N95 masks are recommended for sensitive groups.',
      travel: 'Keep car windows closed and use air recirculation.',
      window: 'Close windows to prevent indoor pollution.',
      water: 'Drink extra water to help flush toxins from the body.',
      emergency: null
    };
  }

  if (roundedAqi > 200) {
    statusColor = 'var(--status-very-poor)';
    levels = {
      general: 'Health alert: everyone may experience more serious health effects.',
      children: 'Avoid all outdoor physical activity. Keep children indoors.',
      seniors: 'Stay indoors with air purifiers if possible.',
      asthma: 'Danger: Strictly stay indoors. Keep medication ready.',
      heart: 'Danger: Avoid all physical exertion. Consult a doctor if you feel uneasy.',
      pregnant: 'Avoid all outdoor exposure to protect fetal health.',
      outdoor: 'Strictly avoid outdoor exercise.',
      mask: 'N95 or better masks are strictly required outdoors.',
      travel: 'Avoid unnecessary travel. Use air purifiers in vehicles.',
      window: 'Keep all windows tightly closed. Run air purifiers.',
      water: 'Increase fluid intake significantly.',
      emergency: 'Very Poor Air Quality! Restrict outdoor movement.'
    };
  }

  if (roundedAqi > 300) {
    statusColor = 'var(--status-hazardous)';
    levels = {
      ...levels,
      general: 'Health warnings of emergency conditions. The entire population is likely to be affected.',
      emergency: 'HAZARDOUS AIR QUALITY EMERGENCY! EVACUATE OR SEAL INDOORS!'
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {levels.emergency && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <AlertOctagon color="#EF4444" size={40} />
          <div>
            <h3 style={{ margin: 0, color: '#EF4444', fontSize: '1.25rem' }}>EMERGENCY WARNING</h3>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{levels.emergency}</p>
          </div>
        </motion.div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <AdviceCard title="General Advice" advice={levels.general} icon={HeartPulse} color={statusColor} delay={1} />
        <AdviceCard title="Children & Infants" advice={levels.children} icon={Baby} color={statusColor} delay={2} />
        <AdviceCard title="Senior Citizens" advice={levels.seniors} icon={PersonStanding} color={statusColor} delay={3} />
        <AdviceCard title="Asthma Patients" advice={levels.asthma} icon={Wind} color={statusColor} delay={4} />
        <AdviceCard title="Heart Patients" advice={levels.heart} icon={Heart} color={statusColor} delay={5} />
        <AdviceCard title="Pregnant Women" advice={levels.pregnant} icon={UserCircle2} color={statusColor} delay={6} />
      </div>

      <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', color: 'var(--text-primary)' }}>Lifestyle Recommendations</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <AdviceCard title="Outdoor Exercise" advice={levels.outdoor} icon={Dumbbell} color={statusColor} delay={7} />
        <AdviceCard title="Mask Recommendation" advice={levels.mask} icon={ShieldAlert} color={statusColor} delay={8} />
        <AdviceCard title="Travel & Commute" advice={levels.travel} icon={Car} color={statusColor} delay={9} />
        <AdviceCard title="Ventilation (Windows)" advice={levels.window} icon={Home} color={statusColor} delay={10} />
        <AdviceCard title="Hydration" advice={levels.water} icon={Droplet} color={statusColor} delay={11} />
      </div>

    </div>
  );
};

export default HealthCards;
