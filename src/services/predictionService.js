// Azure AI Language configuration
const AI_ENDPOINT = "https://soilanalysis.cognitiveservices.azure.com";
const AI_KEY = "FBiSJOkUwpRT8UBn8wKoKHKTFTI4gh0mCyoDusmIIeBdJAdQqNb0JQQJ99BAACYeBjFXJ3w3AAAaACOGgd9Y";
const PROJECT_NAME = "SoilAnalysis";
const DEPLOYMENT_NAME = "deployv2";

// Azure Storage configuration
const STORAGE_ACCOUNT = "devicedatas";
const CONTAINER_NAME = "soil-data";
const SAS_TOKEN = "sp=racwdli&st=2025-01-21T02:20:25Z&se=2025-10-23T09:20:25Z&spr=https&sv=2022-11-02&sr=c&sig=Ihc3%2B6HS2C%2FrWzRiZBjnynKS3kEWgFEml08pOLtahZ0%3D";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const predictSoilCondition = async (soilData) => {
    try {
        // First, get the latest data from storage
        const listUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list&${SAS_TOKEN}`;
        
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) {
            throw new Error(`Failed to fetch blob list: ${listResponse.status} ${listResponse.statusText}`);
        }

        const xmlText = await listResponse.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Get all Blob elements and their names
        const blobElements = xmlDoc.getElementsByTagName("Blob");

        if (blobElements.length === 0) {
            console.warn('No data found in storage, using provided data');
            return processPrediction({ ...soilData, timestamp: Date.now() });
        }

        // Convert to array and parse timestamps
        const blobs = Array.from(blobElements)
            .map(blob => {
                const nameElement = blob.getElementsByTagName("Name")[0];
                if (!nameElement) return null;
                
                const name = nameElement.textContent;
                if (!name) return null;

                const timestampStr = name.split('device-data-')[1]?.split('.json')[0];
                if (!timestampStr) return null;

                const timestamp = new Date(timestampStr).getTime();
                if (isNaN(timestamp)) return null;

                return { name, timestamp };
            })
            .filter(blob => blob !== null);

        if (blobs.length === 0) {
            console.warn('No valid data files found, using provided data');
            return processPrediction({ ...soilData, timestamp: Date.now() });
        }

        // Sort by timestamp in descending order and get the latest
        blobs.sort((a, b) => b.timestamp - a.timestamp);
        const latestBlob = blobs[0];

        // Validate data age
        const currentTime = Date.now();
        const dataAge = currentTime - latestBlob.timestamp;
        
        if (dataAge > 3600000) { // 1 hour
            console.warn('Latest data is too old, using provided data');
            return processPrediction({ ...soilData, timestamp: Date.now() });
        }

        // Fetch the latest data
        const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${latestBlob.name}?${SAS_TOKEN}`;
        const dataResponse = await fetch(blobUrl);
        
        if (!dataResponse.ok) {
            throw new Error(`Failed to fetch latest data: ${dataResponse.status}`);
        }

        const rawLatestData = await dataResponse.json();
        console.log('Using latest data from storage:', rawLatestData);

        // Process the raw latest data with its timestamp
        return processPrediction({ ...rawLatestData, timestamp: latestBlob.timestamp });
    } catch (error) {
        console.error('Error in predictSoilCondition:', error);
        // Fallback to provided data if anything fails
        return processPrediction({ ...soilData, timestamp: Date.now() });
    }
};

// Separate prediction processing logic for better organization
const processPrediction = async (data) => {
    try {
        // Parse and validate the raw data
        const validData = {
            moisture: parseFloat(data.moisture),
            temperature: parseFloat(data.temperature),
            ph: parseFloat(data.ph),
            nitrogen: parseFloat(data.nitrogen),
            phosphorous: parseFloat(data.phosphorous),
            potassium: parseFloat(data.potassium),
            oxygen: parseFloat(data.oxygen),
            timestamp: data.timestamp || Date.now() // Use provided timestamp or current time
        };

        // Validate all required fields are present and are numbers
        if (Object.values(validData).some(val => isNaN(val) && typeof val !== 'number')) {
            throw new Error('Invalid data format: all fields must be numbers');
        }

        const inputText = `Soil Analysis Report: Moisture: ${validData.moisture}%, Temperature: ${validData.temperature}°C, pH: ${validData.ph}, Nitrogen: ${validData.nitrogen}%, Phosphorus: ${validData.phosphorous}%, Potassium: ${validData.potassium}%, Oxygen: ${validData.oxygen}%. ${getAnalysisDescription(validData)}`;
        
        // Submit the analysis job
        const submitUrl = `${AI_ENDPOINT}/language/analyze-text/jobs?api-version=2022-10-01-preview`;
        const requestBody = {
            displayName: "SoilAnalysis_Classification",
            analysisInput: {
                documents: [{
                    id: "1",
                    language: "en",
                    text: inputText
                }]
            },
            tasks: [{
                kind: "CustomSingleLabelClassification",
                parameters: {
                    projectName: PROJECT_NAME,
                    deploymentName: DEPLOYMENT_NAME
                }
            }]
        };

        const submitResponse = await fetch(submitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': AI_KEY
            },
            body: JSON.stringify(requestBody)
        });

        if (!submitResponse.ok) {
            throw new Error(`AI API submit error: ${submitResponse.status}`);
        }

        const operationLocation = submitResponse.headers.get('operation-location');
        if (!operationLocation) {
            throw new Error('No operation-location header received from the API');
        }

        // Poll for results
        let prediction = await pollForResults(operationLocation);
        
        // Extract classification from the response
        const classification = prediction.tasks?.items?.[0]?.results?.documents?.[0]?.class?.[0];
        
        if (classification) {
            return {
                latestData: validData,
                condition: classification.category,
                recommendation: getRecommendation(classification.category),
                timestamp: validData.timestamp
            };
        } else {
            // Fallback to rule-based system
            const condition = determineCondition(validData);
            return {
                latestData: validData,
                condition: condition,
                recommendation: getRecommendation(condition),
                timestamp: validData.timestamp
            };
        }
    } catch (error) {
        console.error('Error in processPrediction:', error);
        // Fallback to rule-based system on error
        const condition = determineCondition(data);
        return {
            latestData: data,
            condition: condition,
            recommendation: getRecommendation(condition),
            timestamp: data.timestamp || Date.now()
        };
    }
};

// Helper function to poll for prediction results
const pollForResults = async (operationLocation) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`Checking results attempt ${attempts}/${maxAttempts}`);

        const resultResponse = await fetch(operationLocation, {
            headers: {
                'Ocp-Apim-Subscription-Key': AI_KEY
            }
        });

        if (!resultResponse.ok) {
            throw new Error(`AI API result error: ${resultResponse.status} - ${await resultResponse.text()}`);
        }

        const prediction = await resultResponse.json();
        
        if (prediction.status === 'succeeded') {
            return prediction;
        } else if (prediction.status === 'failed') {
            throw new Error('Analysis job failed');
        }

        await sleep(2000);
    }
    
    throw new Error('Failed to get prediction results in time');
};

const determineCondition = (data) => {
    // Check conditions in order of priority
    if (data.ph < 6.0) return "Critical pH Acidic";
    if (data.ph > 7.5) return "Critical pH Alkaline";
    if (data.temperature > 30) return "Critical Heat Stress";
    if (data.moisture < 30) return "Critical Drought Condition";
    if (data.moisture > 70) return "Critical Over Watering";
    if (data.nitrogen < 20) return "Critical Nitrogen Deficiency";
    if (data.phosphorus < 20) return "Critical Phosphorus Deficiency";
    if (data.potassium < 20) return "Critical Potassium Deficiency";
    if (data.oxygen < 15) return "Critical Low Oxygen";
    
    return "Optimal Conditions";
};

const getRecommendation = (condition) => {
    const recommendations = {
        "Critical pH Acidic": "Add agricultural lime to increase soil pH. Consider applying calcium carbonate or dolomitic limestone. Monitor pH levels weekly after treatment.",
        
        "Critical pH Alkaline": "Add sulfur or aluminum sulfate to lower soil pH. Consider using acidifying fertilizers. Test pH levels weekly after treatment.",
        
        "Critical Heat Stress": "Implement shade solutions and increase watering frequency. Water during early morning or evening. Consider mulching to retain moisture and cool soil.",
        
        "Critical Drought Condition": "Increase irrigation frequency. Apply mulch to retain moisture. Consider installing a drip irrigation system for efficient water delivery.",
        
        "Critical Over Watering": "Reduce watering frequency. Improve soil drainage by adding organic matter. Check for and fix any irrigation system leaks.",
        
        "Critical Nitrogen Deficiency": "Apply nitrogen-rich fertilizer. Consider organic options like composted manure or blood meal. Test soil weekly to monitor improvement.",
        
        "Critical Phosphorus Deficiency": "Add phosphate fertilizers or bone meal. Maintain soil pH between 6.0-7.0 for optimal phosphorus availability. Retest after 2 weeks.",
        
        "Critical Potassium Deficiency": "Apply potassium-rich fertilizer or wood ash. Consider adding compost rich in banana peels. Monitor levels weekly.",
        
        "Critical Low Oxygen": "Reduce soil compaction through aeration. Decrease watering frequency. Add organic matter to improve soil structure.",
        
        "Optimal Conditions": "Maintain current conditions. Continue regular monitoring and maintenance schedule. Consider preventive measures for seasonal changes."
    };

    return recommendations[condition] || "Monitor soil conditions and adjust care as needed.";
};

const getAnalysisDescription = (data) => {
    // Check conditions in order of priority and return appropriate description
    if (data.ph < 6.0) {
        return "Critical pH acidic condition detected - soil showing increased metal availability and nutrient lockout. Lime application recommended to raise pH levels.";
    }
    if (data.ph > 7.5) {
        return "Critical pH alkaline condition detected - reduced nutrient availability and iron chlorosis visible. Acidification treatment needed.";
    }
    if (data.temperature > 30) {
        return "Critical heat stress detected - plants showing wilting and reduced growth. Immediate temperature management required.";
    }
    if (data.moisture < 30) {
        return "Critical drought condition detected - soil moisture severely depleted, plants showing signs of water stress. Immediate irrigation needed.";
    }
    if (data.moisture > 70) {
        return "Critical over watering detected - soil waterlogged leading to root rot risk. Drainage improvement required.";
    }
    if (data.nitrogen < 20) {
        return "Critical nitrogen deficiency detected - yellowing of older leaves, stunted growth. Immediate nitrogen supplementation needed.";
    }
    if (data.phosphorous < 20) {
        return "Critical phosphorus deficiency detected - purple leaf discoloration, delayed maturity. Phosphate application required.";
    }
    if (data.potassium < 20) {
        return "Critical potassium deficiency detected - leaf margins showing chlorosis and necrosis, weak stem structure. Other nutrients within optimal ranges but potassium severely depleted.";
    }
    if (data.oxygen < 15) {
        return "Critical low oxygen levels detected - root system showing signs of stress, reduced nutrient uptake. Soil aeration needed.";
    }
    
    return "All parameters within optimal ranges. Soil conditions favorable for plant growth.";
};

export const getHistoricalData = async () => {
    try {
        // Get list of blobs
        const listUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list&${SAS_TOKEN}`;
        const listResponse = await fetch(listUrl);
        
        if (!listResponse.ok) {
            throw new Error('Failed to fetch blob list');
        }

        const xmlText = await listResponse.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Get all Blob elements and their names
        const blobElements = xmlDoc.getElementsByTagName("Blob");
        if (blobElements.length === 0) {
            throw new Error('No data found in storage');
        }

        // Convert to array and sort by name (which contains timestamp)
        const blobs = Array.from(blobElements).map(blob => {
            const nameElement = blob.getElementsByTagName("Name")[0] || 
                              blob.getElementsByTagName("n")[0];
            const name = nameElement ? nameElement.textContent : '';
            const timestampStr = name ? name.split('device-data-')[1]?.split('.json')[0] : '';
            const timestamp = timestampStr ? new Date(timestampStr).getTime() : 0;
            return { name, timestamp, timestampStr };
        }).filter(blob => blob.name && blob.timestamp && !isNaN(blob.timestamp));

        // Sort by timestamp in descending order (newest first)
        blobs.sort((a, b) => b.timestamp - a.timestamp);

        // Take only the last 7 entries
        const last7Blobs = blobs.slice(0, 7);

        // Fetch data for each blob
        const historicalData = await Promise.all(last7Blobs.map(async blob => {
            const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blob.name}?${SAS_TOKEN}`;
            const response = await fetch(blobUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data for ${blob.name}`);
            }
            const data = await response.json();
            return {
                ...data,
                timestamp: new Date(blob.timestamp).toISOString()
            };
        }));

        // Format data for Power BI, ensuring newest data first
        const formattedData = historicalData.map(data => ({
            Timestamp: data.timestamp,
            Moisture: parseFloat(data.moisture),
            Temperature: parseFloat(data.temperature),
            pH: parseFloat(data.ph),
            Nitrogen: parseFloat(data.nitrogen),
            Phosphorus: parseFloat(data.phosphorous),
            Potassium: parseFloat(data.potassium),
            Oxygen: parseFloat(data.oxygen),
            Condition: determineCondition(data)
        }));

        // Sort again by timestamp to ensure newest data is first
        formattedData.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        
        return formattedData;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
}; 