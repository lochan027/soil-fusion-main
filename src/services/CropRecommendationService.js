const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const CropRecommendationService = {
    async getCropRecommendations(soilData) {
        try {
            // Validate and ensure default values for all required fields
            const validatedData = {
                nitrogen: parseFloat(soilData.nitrogen || 0),
                phosphorous: parseFloat(soilData.phosphorous || 0),
                potassium: parseFloat(soilData.potassium || 0),
                temperature: parseFloat(soilData.temperature || 0),
                humidity: parseFloat(soilData.moisture || 0),
                ph: parseFloat(soilData.ph || 0),
                rainfall: 200
            };

            // Log the validated data for debugging
            console.log('Original soil data:', soilData);
            console.log('Validated data being sent to API:', validatedData);

            // Check for any NaN values
            const nanFields = Object.entries(validatedData)
                .filter(([key, value]) => isNaN(value))
                .map(([key]) => key);

            if (nanFields.length > 0) {
                throw new Error(`Invalid values for fields: ${nanFields.join(', ')}`);
            }

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Failed to get crop recommendations: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error getting crop recommendations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}; 