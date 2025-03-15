const STORAGE_ACCOUNT = "devicedatas";
const CONTAINER_NAME = "soil-data";
const SAS_TOKEN = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-12-31T09:16:04Z&st=2025-01-21T01:16:04Z&spr=https&sig=yMgnnWq40CynUrOfGcsMza5eQIiXmgLjq7pAn0rhMuM%3D";

export const DeviceDataService = {
    async storeDeviceData(data) {
        try {
            const timestamp = new Date().toISOString();
            const blobName = `device-data-${timestamp}.json`;
            const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${SAS_TOKEN}`;

            console.log('Attempting to store data at:', blobUrl);
            const response = await fetch(blobUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-ms-blob-type': 'BlockBlob',
                    'x-ms-version': '2020-04-08'
                },
                body: JSON.stringify({
                    timestamp,
                    ...data,
                    type: 'ManualInput'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Storage error details:', errorText);
                throw new Error(`Failed to store data: ${response.status} - ${errorText}`);
            }

            return { success: true };
        } catch (error) {
            console.error("Error storing device data:", error);
            return { success: false, error: error.message };
        }
    },

    async getDeviceData(limit = 100) {
        try {
            const listUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list&${SAS_TOKEN}`;
            const response = await fetch(listUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('List error details:', errorText);
                throw new Error(`Failed to fetch data: ${response.status} - ${errorText}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const blobs = xmlDoc.getElementsByTagName("Blob");
            const data = [];

            for (let i = 0; i < Math.min(blobs.length, limit); i++) {
                const blobName = blobs[i].getElementsByTagName("Name")[0].textContent;
                const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${SAS_TOKEN}`;
                
                const blobResponse = await fetch(blobUrl);
                if (blobResponse.ok) {
                    const blobData = await blobResponse.json();
                    data.push(blobData);
                }
            }

            // Sort by timestamp in descending order
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return { success: true, data };
        } catch (error) {
            console.error("Error fetching device data:", error);
            return { success: false, error: error.message };
        }
    },

    async getLast7DaysData() {
        try {
            const listUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list&${SAS_TOKEN}`;
            const response = await fetch(listUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch blob list');
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            // Get all Blob elements and their names
            const blobElements = xmlDoc.getElementsByTagName("Blob");
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Convert to array and filter by date
            const blobs = Array.from(blobElements)
                .map(blob => {
                    const nameElement = blob.getElementsByTagName("Name")[0];
                    const name = nameElement ? nameElement.textContent : '';
                    const timestamp = name.split('device-data-')[1]?.split('.json')[0];
                    return { name, timestamp };
                })
                .filter(blob => {
                    if (!blob.timestamp) return false;
                    const blobDate = new Date(blob.timestamp);
                    return blobDate >= sevenDaysAgo;
                });

            // Sort by timestamp
            blobs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Fetch data for each blob
            const historicalData = await Promise.all(blobs.map(async blob => {
                const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blob.name}?${SAS_TOKEN}`;
                const blobResponse = await fetch(blobUrl);
                if (!blobResponse.ok) {
                    throw new Error(`Failed to fetch data for ${blob.name}`);
                }
                const data = await blobResponse.json();
                return {
                    ...data,
                    timestamp: new Date(data.timestamp).toISOString()
                };
            }));

            // Format data for visualization
            const formattedData = historicalData.map(data => ({
                Timestamp: data.timestamp,
                Moisture: parseFloat(data.moisture),
                Temperature: parseFloat(data.temperature),
                pH: parseFloat(data.ph),
                Nitrogen: parseFloat(data.nitrogen),
                Phosphorus: parseFloat(data.phosphorous),
                Potassium: parseFloat(data.potassium),
                Oxygen: parseFloat(data.oxygen)
            }));

            return {
                success: true,
                data: formattedData,
                summary: {
                    averages: {
                        moisture: average(formattedData.map(d => d.Moisture)),
                        temperature: average(formattedData.map(d => d.Temperature)),
                        ph: average(formattedData.map(d => d.pH)),
                        nitrogen: average(formattedData.map(d => d.Nitrogen)),
                        phosphorus: average(formattedData.map(d => d.Phosphorus)),
                        potassium: average(formattedData.map(d => d.Potassium)),
                        oxygen: average(formattedData.map(d => d.Oxygen))
                    },
                    trends: {
                        moisture: calculateTrend(formattedData.map(d => d.Moisture)),
                        temperature: calculateTrend(formattedData.map(d => d.Temperature)),
                        ph: calculateTrend(formattedData.map(d => d.pH)),
                        nitrogen: calculateTrend(formattedData.map(d => d.Nitrogen)),
                        phosphorus: calculateTrend(formattedData.map(d => d.Phosphorus)),
                        potassium: calculateTrend(formattedData.map(d => d.Potassium)),
                        oxygen: calculateTrend(formattedData.map(d => d.Oxygen))
                    }
                }
            };
        } catch (error) {
            console.error("Error fetching historical data:", error);
            return { success: false, error: error.message };
        }
    }
};

// Helper functions for data analysis
function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateTrend(arr) {
    if (arr.length < 2) return 'stable';
    const first = arr[arr.length - 1];
    const last = arr[0];
    const change = ((last - first) / first) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
} 