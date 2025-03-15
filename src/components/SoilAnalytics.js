import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { analyzeSoilData, getRecommendations, predictSoilHealth } from '../services/AzureService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const THRESHOLDS = {
  moisture: {
    critical_low: 15,  // Critical drought conditions
    low: 25,          // Below 25% needs watering
    optimal: 45,      // 35-45% is ideal
    high: 65,         // Above 65% is over-watered
    critical_high: 80 // Risk of root rot
  },
  nitrogen: {
    critical_low: 20, // Severe deficiency
    low: 30,         // Below 30% needs fertilizer
    optimal: 50,     // 50-60% is ideal
    high: 70         // Risk of excess nitrogen
  },
  phosphorus: {
    critical_low: 15, // Severe deficiency
    low: 25,         // Below 25% needs fertilizer
    optimal: 45,     // 45-55% is ideal
    high: 65         // Risk of phosphorus runoff
  },
  potassium: {
    critical_low: 15, // Severe deficiency
    low: 25,         // Below 25% needs fertilizer
    optimal: 45,     // 45-60% is ideal
    high: 70         // Excess potassium
  },
  oxygen: {
    critical_low: 10, // Severe compaction
    low: 15,         // Poor aeration
    optimal: 18,     // 18-22% is ideal
    high: 25         // Excessive aeration
  },
  ph: {
    critical_low: 5.0,  // Too acidic
    low: 6.0,          // Slightly acidic
    optimal_low: 6.5,   // Ideal range starts
    optimal_high: 7.0,  // Ideal range ends
    high: 7.5,         // Slightly alkaline
    critical_high: 8.0  // Too alkaline
  },
  temperature: {
    critical_low: 10,   // Too cold
    low: 15,           // Below optimal
    optimal_low: 20,    // Ideal range starts
    optimal_high: 25,   // Ideal range ends
    high: 30,          // Above optimal
    critical_high: 35   // Too hot
  }
};

const testCases = [
  {
    name: "Low Moisture",
    data: {
      moisture: 18,
      temperature: 26,
      ph: 6.7,
      nitrogen: 55,
      phosphorus: 52,
      potassium: 58,
      oxygen: 19
    },
    expectedLabel: "Moisture Deficiency"
  },
  {
    name: "Nitrogen Deficiency",
    data: {
      moisture: 42,
      temperature: 23,
      ph: 6.5,
      nitrogen: 22,
      phosphorus: 50,
      potassium: 60,
      oxygen: 18
    },
    expectedLabel: "Nitrogen Deficiency"
  },
  {
    name: "Over Watered",
    data: {
      moisture: 75,
      temperature: 22,
      ph: 6.8,
      nitrogen: 45,
      phosphorus: 40,
      potassium: 50,
      oxygen: 16
    },
    expectedLabel: "Over Watered"
  }
];

const trainingCases = [
  // Moisture Conditions
  {
    name: "Critical Drought",
    data: {
      moisture: 12,
      temperature: 28,
      ph: 6.7,
      nitrogen: 45,
      phosphorus: 50,
      potassium: 55,
      oxygen: 18
    },
    label: "Critical Drought Condition",
    description: "Soil moisture is critically low at 12%, well below the critical threshold of 15%. Immediate irrigation required."
  },
  {
    name: "Over Watering Risk",
    data: {
      moisture: 85,
      temperature: 22,
      ph: 6.8,
      nitrogen: 48,
      phosphorus: 52,
      potassium: 54,
      oxygen: 15
    },
    label: "Over Watered",
    description: "Soil moisture is at 85%, exceeding critical high threshold of 80%. Risk of root rot present."
  },
  
  // Nutrient Deficiencies
  {
    name: "Severe Nitrogen Deficiency",
    data: {
      moisture: 45,
      temperature: 23,
      ph: 6.5,
      nitrogen: 18,
      phosphorus: 48,
      potassium: 52,
      oxygen: 19
    },
    label: "Critical Nitrogen Deficiency",
    description: "Nitrogen level at 18% is below critical threshold of 20%. Immediate fertilization needed."
  },
  {
    name: "Phosphorus Deficiency",
    data: {
      moisture: 42,
      temperature: 24,
      ph: 6.6,
      nitrogen: 45,
      phosphorus: 14,
      potassium: 50,
      oxygen: 18
    },
    label: "Critical Phosphorus Deficiency",
    description: "Phosphorus at 14% is below critical threshold of 15%. Apply phosphate fertilizer."
  },
  
  // pH Imbalances
  {
    name: "Highly Acidic Soil",
    data: {
      moisture: 45,
      temperature: 22,
      ph: 4.8,
      nitrogen: 48,
      phosphorus: 46,
      potassium: 52,
      oxygen: 18
    },
    label: "Critical pH Imbalance - Acidic",
    description: "Soil pH at 4.8 is below critical low threshold of 5.0. Lime application recommended."
  },
  {
    name: "Alkaline Soil",
    data: {
      moisture: 44,
      temperature: 23,
      ph: 8.2,
      nitrogen: 47,
      phosphorus: 48,
      potassium: 51,
      oxygen: 19
    },
    label: "Critical pH Imbalance - Alkaline",
    description: "Soil pH at 8.2 exceeds critical high threshold of 8.0. Sulfur application recommended."
  },
  
  // Temperature Stress
  {
    name: "Heat Stress",
    data: {
      moisture: 42,
      temperature: 36,
      ph: 6.8,
      nitrogen: 49,
      phosphorus: 47,
      potassium: 53,
      oxygen: 17
    },
    label: "Critical Temperature - Heat Stress",
    description: "Temperature at 36°C exceeds critical high threshold of 35°C. Implement cooling measures."
  },
  
  // Optimal Conditions
  {
    name: "Optimal Growing Conditions",
    data: {
      moisture: 40,
      temperature: 22,
      ph: 6.8,
      nitrogen: 55,
      phosphorus: 50,
      potassium: 52,
      oxygen: 20
    },
    label: "Optimal Conditions",
    description: "All parameters within optimal ranges. Continue regular maintenance."
  }
];

const validateResult = (result, expectedLabel) => {
  const isCorrect = result.classification === expectedLabel;
  return {
    isCorrect,
    expected: expectedLabel,
    received: result.classification,
    match: isCorrect ? "✓" : "✗"
  };
};

const SoilAnalytics = ({ deviceData }) => {
  const [soilAnalysis, setSoilAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const analyzeData = async () => {
      try {
        setLoading(true);
        // Analyze current soil data
        const analysis = await analyzeSoilData(deviceData);
        setSoilAnalysis(analysis);

        // Get AI-powered recommendations
        const recs = await getRecommendations(analysis);
        setRecommendations(recs);

        // Get predictions for future soil health
        const preds = await predictSoilHealth(deviceData);
        setPredictions(preds);
      } catch (error) {
        console.error('Error in soil analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    if (deviceData) {
      analyzeData();
    }
  }, [deviceData]);

  const runModelTests = async () => {
    try {
      setLoading(true);
      const results = await Promise.all(
        testCases.map(async (test) => {
          const result = await analyzeSoilData(test.data);
          const validation = validateResult(result, test.expectedLabel);
          return {
            name: test.name,
            input: test.data,
            result: result,
            validation: validation
          };
        })
      );
      setTestResults(results);
      console.log('Test Results:', results);
    } catch (error) {
      console.error('Test Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTestSection = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="card">
          <h3>Model Testing</h3>
          <div className="card-content">
            <button 
              onClick={runModelTests}
              className="view-report-btn"
              style={{ marginBottom: '1rem' }}
            >
              Run Test Cases
            </button>
            {testResults.map((test, index) => (
              <div key={index} className="test-result">
                <h4>{test.name} {test.validation.match}</h4>
                <p>Expected: {test.validation.expected}</p>
                <p>Received: {test.validation.received}</p>
                <pre style={{ 
                  background: '#1a1a1a', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(test.input, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = {
    labels: deviceData?.timestamps || [],
    datasets: [
      {
        label: 'Soil Moisture',
        data: deviceData?.moisture || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Temperature',
        data: deviceData?.temperature || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'pH Level',
        data: deviceData?.ph || [],
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Soil Health Metrics'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="soil-analytics">
      {loading ? (
        <div className="loading">Analyzing soil data...</div>
      ) : (
        <>
          <div className="chart-section">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="analysis-section">
            <div className="card">
              <h3>Current Soil Analysis</h3>
              <div className="card-content">
                {soilAnalysis && (
                  <>
                    <p>Moisture Level: {soilAnalysis.moisture}%</p>
                    <p>pH Level: {soilAnalysis.ph}</p>
                    <p>Nitrogen Content: {soilAnalysis.nitrogen}%</p>
                    <p>Phosphorus Content: {soilAnalysis.phosphorus}%</p>
                    <p>Potassium Content: {soilAnalysis.potassium}%</p>
                  </>
                )}
              </div>
            </div>

            <div className="card">
              <h3>AI Recommendations</h3>
              <div className="card-content">
                {recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                    <div className="priority-tag" data-priority={rec.priority}>
                      {rec.priority} Priority
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Predictions</h3>
              <div className="card-content">
                {predictions && (
                  <>
                    <p>Predicted Moisture Trend: {predictions.moistureTrend}</p>
                    <p>Recommended Next Watering: {predictions.nextWatering}</p>
                    <p>Soil Health Score: {predictions.healthScore}/100</p>
                    <p>Next Fertilizer Application: {predictions.nextFertilizer}</p>
                  </>
                )}
              </div>
            </div>

            {renderTestSection()}
          </div>
        </>
      )}
    </div>
  );
};

export default SoilAnalytics; 