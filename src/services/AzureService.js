// Azure AI service integration
const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT;
const AZURE_API_KEY = process.env.REACT_APP_AZURE_API_KEY;

export const analyzeSoilData = async (soilData) => {
  try {
    // Call Azure AI for soil analysis
    const response = await fetch(`${AZURE_ENDPOINT}language/analyze-text/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_API_KEY
      },
      body: JSON.stringify({
        analysisInput: {
          documents: [{
            id: '1',
            text: `Soil moisture: ${soilData.moisture}%, Temperature: ${soilData.temperature}°C, pH: ${soilData.ph}`
          }]
        },
        tasks: [{
          kind: 'CustomTextClassification',
          parameters: {
            projectName: 'soil-analysis',
            deploymentName: 'soil-analysis-model'
          }
        }]
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing soil data:', error);
    throw error;
  }
};

export const getRecommendations = async (analysisResults) => {
  try {
    // Call Azure AI for text generation recommendations
    const response = await fetch(`${AZURE_ENDPOINT}language/text/completions/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_API_KEY
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural AI assistant. Based on the soil analysis, provide specific recommendations for soil improvement.'
          },
          {
            role: 'user',
            content: `Based on these soil conditions: ${JSON.stringify(analysisResults)}, what actions should be taken to improve soil health?`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    const result = await response.json();
    // Transform the response into recommendations format
    return [{
      title: 'Soil Health Recommendation',
      description: result.choices[0].message.content,
      priority: 'High'
    }];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

export const predictSoilHealth = async (historicalData) => {
  try {
    // Validate data freshness
    const latestTimestamp = Math.max(...historicalData.timestamps);
    const currentTime = Date.now();
    const dataAge = currentTime - latestTimestamp;
    
    // If data is older than 1 hour, throw error
    if (dataAge > 3600000) {
      throw new Error('Data is too old for accurate prediction');
    }

    // Call Azure AI for predictive analysis
    const response = await fetch(`${AZURE_ENDPOINT}language/analyze-text/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_API_KEY
      },
      body: JSON.stringify({
        analysisInput: {
          documents: [{
            id: '1',
            text: `Historical soil data trends: Moisture ${historicalData.moisture.join(', ')}, Temperature ${historicalData.temperature.join(', ')}, pH ${historicalData.ph.join(', ')}`
          }]
        },
        tasks: [{
          kind: 'CustomTextClassification',
          parameters: {
            projectName: 'soil-prediction',
            deploymentName: 'soil-prediction-model'
          }
        }]
      })
    });
    
    const result = await response.json();
    
    // Calculate trends and predictions based on historical data
    const moistureTrend = calculateTrend(historicalData.moisture);
    const nextWatering = predictNextWatering(historicalData.moisture, historicalData.temperature);
    const healthScore = calculateHealthScore(historicalData);
    const nextFertilizer = predictNextFertilizer(historicalData);

    return {
      moistureTrend,
      nextWatering,
      healthScore,
      nextFertilizer
    };
  } catch (error) {
    console.error('Error predicting soil health:', error);
    throw error;
  }
};

const calculateTrend = (values) => {
  const recent = values.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const prev = values.slice(-6, -3);
  const prevAvg = prev.reduce((a, b) => a + b, 0) / prev.length;
  
  if (avg > prevAvg + 5) return 'Rising';
  if (avg < prevAvg - 5) return 'Falling';
  return 'Stable';
};

const predictNextWatering = (moisture, temperature) => {
  const lastMoisture = moisture[moisture.length - 1];
  const lastTemp = temperature[temperature.length - 1];
  
  if (lastMoisture < 30) return 'Immediate watering needed';
  if (lastMoisture < 40) return 'Water within 12 hours';
  if (lastTemp > 30) return 'Check again in 12 hours';
  return 'Check again tomorrow';
};

const calculateHealthScore = (data) => {
  let score = 100;
  const latest = {
    moisture: data.moisture[data.moisture.length - 1],
    temperature: data.temperature[data.temperature.length - 1],
    ph: data.ph[data.ph.length - 1]
  };
  
  // Deduct points for non-optimal conditions
  if (latest.moisture < 30 || latest.moisture > 70) score -= 20;
  if (latest.temperature < 15 || latest.temperature > 30) score -= 15;
  if (latest.ph < 6.0 || latest.ph > 7.5) score -= 25;
  
  return Math.max(0, score);
};

const predictNextFertilizer = (data) => {
  const latestNitrogen = data.nitrogen?.[data.nitrogen.length - 1];
  const latestPhosphorus = data.phosphorus?.[data.phosphorus.length - 1];
  const latestPotassium = data.potassium?.[data.potassium.length - 1];
  
  if (latestNitrogen < 30 || latestPhosphorus < 30 || latestPotassium < 30) {
    return 'Fertilizer needed within 24 hours';
  }
  if (latestNitrogen < 40 || latestPhosphorus < 40 || latestPotassium < 40) {
    return 'Fertilize within 3 days';
  }
  return 'Check again in 7 days';
}; 