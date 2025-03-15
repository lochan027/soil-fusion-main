import React, { useState, useEffect } from 'react';
import { CropRecommendationService } from '../services/CropRecommendationService';

const CropRecommendations = ({ soilData }) => {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!soilData) return;

            setLoading(true);
            setError(null);

            try {
                const result = await CropRecommendationService.getCropRecommendations(soilData);
                if (result.success) {
                    setRecommendations(result.data);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError('Failed to fetch crop recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [soilData]);

    if (loading) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!recommendations) {
        return null;
    }

    return (
        <div className="mt-4 space-y-6">
            {/* Soil Health Score */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-white">Soil Health Score</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-700">
                                {Math.round(recommendations.soil_health_score)}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-gray-700">
                        <div
                            style={{ width: `${recommendations.soil_health_score}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 rounded-full transition-all duration-300"
                        ></div>
                    </div>
                </div>
            </div>

            {/* Recommended Crops */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-white">Recommended Crops</h3>
                <div className="space-y-4">
                    {recommendations.recommended_crops.map((crop, index) => (
                        <div
                            key={crop}
                            className="p-4 rounded-lg bg-gray-800 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-lg capitalize text-white">{crop}</h4>
                                <span className="text-sm font-semibold text-green-400">
                                    {Math.round(recommendations.confidence_scores[index] * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.round(recommendations.confidence_scores[index] * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Recommendations */}
            {recommendations.additional_recommendations && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">Soil Improvement Tips</h3>
                    <p className="text-blue-800">
                        {recommendations.additional_recommendations}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CropRecommendations; 