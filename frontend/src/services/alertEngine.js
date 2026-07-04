export const ALERT_THRESHOLDS = {
  AQI_HIGH: 200,      // High Priority (Danger)
  AQI_MED: 150,       // Medium Priority
  AQI_LOW: 100,       // Low Priority
  PM25_SPIKE: 60,     // µg/m³
  HUMIDITY_HIGH: 85,  // %
  TEMP_HIGH: 35,      // °C
  TEMP_LOW: 5,        // °C
  TREND_WORSE_PCT: 20 // % worsening over 3 days
};

/**
 * Evaluates live data, predictions, and historical trends to generate alerts.
 * @param {string} city - The city name
 * @param {object} current - Live data object
 * @param {object} prediction - AI prediction object
 * @param {array} history - Array of historical data points (descending by date)
 * @returns {array} Array of generated alert objects
 */
export const generateAlerts = (city, current, prediction, history = []) => {
  const alerts = [];
  const today = new Date().toISOString().split('T')[0];

  // Helper to construct alert objects consistently
  const buildAlert = (idSuffix, category, priority, title, message) => ({
    id: `alert-${category.replace(/\s+/g, '').toLowerCase()}-${idSuffix}-${city}-${today}`,
    title,
    message: message, // mapped to 'description' in the UI component previously, but user requested 'message' in the spec. We'll use 'description' to match existing UI or change UI to use 'message'. Let's stick to description for backwards compatibility with AlertList.
    description: message,
    category, // 'Weather' | 'Air Quality' | 'Health' | 'Trend' | 'System'
    priority, // 'Low' | 'Medium' | 'High'
    time: new Date().toISOString(),
    read: false,
    city
  });

  // ----------------------------------------------------
  // 1. AQI Forecast Alert (Air Quality Category)
  // ----------------------------------------------------
  if (prediction && prediction.predicted_aqi) {
    if (prediction.predicted_aqi >= ALERT_THRESHOLDS.AQI_HIGH) {
      alerts.push(buildAlert(
        'aqi-forecast-high', 'Air Quality', 'High',
        `Hazardous Forecast in ${city}`,
        `AQI is expected to reach ${Math.round(prediction.predicted_aqi)} (Hazardous) within 24 hours.`
      ));
    } else if (prediction.predicted_aqi >= ALERT_THRESHOLDS.AQI_MED) {
      alerts.push(buildAlert(
        'aqi-forecast-med', 'Air Quality', 'Medium',
        `Poor Air Quality Expected in ${city}`,
        `AQI is expected to reach ${Math.round(prediction.predicted_aqi)} (Unhealthy) within 24 hours.`
      ));
    } else if (prediction.predicted_aqi > ALERT_THRESHOLDS.AQI_LOW) {
      alerts.push(buildAlert(
        'aqi-forecast-low', 'Air Quality', 'Low',
        `Moderate AQI Expected in ${city}`,
        `AQI is expected to reach ${Math.round(prediction.predicted_aqi)}. Sensitive groups should be aware.`
      ));
    }
  }

  // ----------------------------------------------------
  // 2. Health Advisory Alert (Health Category)
  // ----------------------------------------------------
  // Derived from predicted AQI category
  if (prediction && prediction.predicted_aqi >= ALERT_THRESHOLDS.AQI_MED) {
    alerts.push(buildAlert(
      'health-advisory', 'Health', 'High',
      `Health Advisory: ${city}`,
      `Sensitive groups should limit outdoor activity tomorrow due to predicted Unhealthy air quality.`
    ));
  } else if (current && current.aqi >= ALERT_THRESHOLDS.AQI_MED) {
    alerts.push(buildAlert(
      'health-current', 'Health', 'Medium',
      `Current Health Warning: ${city}`,
      `Current AQI is Unhealthy. Reduce prolonged or heavy outdoor exertion.`
    ));
  }

  // ----------------------------------------------------
  // 3. Pollutant Spike Alert (Air Quality Category)
  // ----------------------------------------------------
  if (current && current.pm25 > ALERT_THRESHOLDS.PM25_SPIKE) {
    const multiplier = (current.pm25 / 15).toFixed(1); // Assuming 15 is WHO guideline
    alerts.push(buildAlert(
      'pollutant-spike-pm25', 'Air Quality', 'High',
      `PM2.5 Spike Detected in ${city}`,
      `PM2.5 levels are dangerously high (${Math.round(current.pm25)} µg/m³), which is ${multiplier}x the WHO safe limit.`
    ));
  }

  // ----------------------------------------------------
  // 4. Weather-AQI Combo Alert (Air Quality Category)
  // ----------------------------------------------------
  // Low wind speed + rising AQI traps pollutants
  if (current && prediction) {
    // Check if wind speed exists, sometimes APIs omit it. Let's assume current.wind_speed is available.
    const isLowWind = current.wind_speed !== undefined && current.wind_speed < 5;
    const isRisingAQI = prediction.predicted_aqi > (current.aqi + 15) && prediction.predicted_aqi > ALERT_THRESHOLDS.AQI_LOW;

    if (isLowWind && isRisingAQI) {
      alerts.push(buildAlert(
        'weather-aqi-combo', 'Air Quality', 'Medium',
        `Stagnant Air Warning in ${city}`,
        `Low wind speed + rising AQI may trap pollutants overnight resulting in poorer air quality.`
      ));
    }
  }

  // ----------------------------------------------------
  // 5. Trend Alert (Trend Category)
  // ----------------------------------------------------
  if (history && history.length >= 3 && current) {
    // Calculate average AQI over the last 3 historical records
    // Assuming history records are ordered by date descending
    const recentHistory = history.slice(0, 3);
    const avgAqi = recentHistory.reduce((sum, record) => sum + record.aqi, 0) / recentHistory.length;

    if (avgAqi > 0) {
      const worsenPct = ((current.aqi - avgAqi) / avgAqi) * 100;

      if (worsenPct >= ALERT_THRESHOLDS.TREND_WORSE_PCT && current.aqi > ALERT_THRESHOLDS.AQI_LOW) {
        alerts.push(buildAlert(
          'trend-worsening', 'Trend', 'Medium',
          `Negative Trend in ${city}`,
          `AQI has worsened ${Math.round(worsenPct)}% over the last 3 days compared to the historical average.`
        ));
      } else if (worsenPct <= -ALERT_THRESHOLDS.TREND_WORSE_PCT) {
         alerts.push(buildAlert(
          'trend-improving', 'Trend', 'Low',
          `Positive Trend in ${city}`,
          `AQI has improved ${Math.abs(Math.round(worsenPct))}% over the last 3 days!`
        ));
      }
    }
  }

  // ----------------------------------------------------
  // 6. Extreme Weather Alerts (Weather Category)
  // ----------------------------------------------------
  if (current) {
    if (current.humidity >= ALERT_THRESHOLDS.HUMIDITY_HIGH) {
      alerts.push(buildAlert(
        'weather-humidity', 'Weather', 'Medium',
        `High Humidity Expected in ${city}`,
        `Precipitation or muggy conditions likely. Humidity is at ${current.humidity}%.`
      ));
    }

    if (current.temperature >= ALERT_THRESHOLDS.TEMP_HIGH) {
      alerts.push(buildAlert(
        'weather-heat', 'Weather', 'Medium',
        `Extreme Heat Advisory in ${city}`,
        `Temperatures are soaring to ${Math.round(current.temperature)}°C. Stay hydrated and avoid direct sunlight.`
      ));
    } else if (current.temperature <= ALERT_THRESHOLDS.TEMP_LOW) {
      alerts.push(buildAlert(
        'weather-cold', 'Weather', 'Medium',
        `Extreme Cold Advisory in ${city}`,
        `Temperatures have dropped to ${Math.round(current.temperature)}°C. Risk of frost or poor visibility.`
      ));
    }
  }

  return alerts;
};
