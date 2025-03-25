const { joblib } = require('@scikit-learn/joblib');
const path = require('path');

// Load model and scaler
const modelPath = path.join(__dirname, '../model/model.pkl');
const scalerPath = path.join(__dirname, '../model/scaler.pkl');

let model = null;
let scaler = null;

try {
  model = joblib.load(modelPath);
  scaler = joblib.load(scalerPath);
} catch (error) {
  console.error('Error loading model:', error);
}

function calculateSoilHealthScore(nitrogen, phosphorous, potassium, ph) {
  // Define ideal ranges
  const idealRanges = {
    N: [20, 140],
    P: [10, 50],
    K: [20, 200],
    pH: [6.0, 7.5]
  };
  
  // Calculate individual scores
  const nScore = 100 - Math.min(100, Math.abs(nitrogen - ((idealRanges.N[1] + idealRanges.N[0]) / 2)) / (idealRanges.N[1] - idealRanges.N[0]) * 100);
  const pScore = 100 - Math.min(100, Math.abs(phosphorous - ((idealRanges.P[1] + idealRanges.P[0]) / 2)) / (idealRanges.P[1] - idealRanges.P[0]) * 100);
  const kScore = 100 - Math.min(100, Math.abs(potassium - ((idealRanges.K[1] + idealRanges.K[0]) / 2)) / (idealRanges.K[1] - idealRanges.K[0]) * 100);
  const phScore = 100 - Math.min(100, Math.abs(ph - ((idealRanges.pH[1] + idealRanges.pH[0]) / 2)) / (idealRanges.pH[1] - idealRanges.pH[0]) * 100);
  
  // Calculate weighted average
  return (nScore * 0.25 + pScore * 0.25 + kScore * 0.25 + phScore * 0.25);
}

function getRecommendations(soilHealthScore, ph) {
  const recommendations = [];
  
  if (soilHealthScore < 60) {
    recommendations.push("Soil health needs improvement.");
    if (ph < 6.0) {
      recommendations.push("Consider adding lime to increase soil pH.");
    } else if (ph > 7.5) {
      recommendations.push("Consider adding sulfur to decrease soil pH.");
    }
  }
  
  if (soilHealthScore < 40) {
    recommendations.push("Urgent soil treatment recommended.");
  } else if (soilHealthScore < 70) {
    recommendations.push("Regular soil monitoring advised.");
  }
  
  return recommendations.length ? recommendations.join(" ") : "Soil conditions are generally good.";
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const {
      nitrogen,
      phosphorous,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall = 200 // Default value
    } = data;

    // Validate input data
    if (!model || !scaler) {
      throw new Error('Model not loaded');
    }

    // Prepare input data
    const inputData = [[
      nitrogen,
      phosphorous,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall
    ]];

    // Scale the input
    const inputScaled = scaler.transform(inputData);

    // Get prediction probabilities
    const probabilities = model.predictProba(inputScaled)[0];

    // Get top 3 predictions
    const topIndices = Array.from(probabilities)
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 3);

    const recommendedCrops = topIndices.map(({ index }) => model.classes_[index]);
    const confidenceScores = topIndices.map(({ prob }) => prob);

    // Calculate soil health score
    const soilHealthScore = calculateSoilHealthScore(nitrogen, phosphorous, potassium, ph);

    // Get additional recommendations
    const additionalRecommendations = getRecommendations(soilHealthScore, ph);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        recommended_crops: recommendedCrops,
        confidence_scores: confidenceScores,
        soil_health_score: soilHealthScore,
        additional_recommendations: additionalRecommendations
      })
    };
  } catch (error) {
    console.error('Prediction error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to make prediction',
        details: error.message
      })
    };
  }
}; 