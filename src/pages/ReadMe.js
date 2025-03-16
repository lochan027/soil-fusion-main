import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices, IconCloud, IconBook } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from '../components/ui/Sidebar';

const ReadMe = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <Sidebar>
                <div className="menu-items">
                    <SidebarItem
                        icon={<IconLayoutDashboard size={24} />}
                        text="Dashboard"
                        to="/dashboard"
                    />
                    <SidebarItem
                        icon={<IconDevices size={24} />}
                        text="Devices"
                        to="/devices"
                    />
                    <SidebarItem
                        icon={<IconCloud size={24} />}
                        text="Weather"
                        to="/weather"
                    />
                    <SidebarItem
                        icon={<IconBook size={24} />}
                        text="ReadMe"
                        to="/readme"
                        active
                    />
                    <SidebarItem
                        icon={<IconUser size={24} />}
                        text="Profile"
                        to="/profile"
                    />
                    <SidebarItem
                        icon={<IconSettings size={24} />}
                        text="Settings"
                        to="/settings"
                    />
                    <SidebarItem
                        icon={<IconLogout size={24} />}
                        text="Logout"
                        onClick={handleLogout}
                    />
                </div>
                <div className="profile-section">
                    <div className="profile-image" />
                    <span className="profile-name">John Doe</span>
                </div>
            </Sidebar>

            <main className="main-content">
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Soil Fusion Documentation</h1>
                    
                    <div className="space-y-8">
                        {/* Project Overview */}
                        <section className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-2xl font-semibold text-white mb-4">Project Overview</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Soil Fusion is an intelligent agricultural platform that combines IoT technology with AI-powered analytics 
                                to provide precise crop recommendations and soil health monitoring. The system processes real-time soil data 
                                to help farmers make informed decisions about crop selection and soil management.
                            </p>
                        </section>

                        {/* Key Features */}
                        <section className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-2xl font-semibold text-white mb-4">Key Features</h2>
                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                <li>Real-time soil parameter monitoring (Temperature, Moisture, pH, etc.)</li>
                                <li>AI-powered crop recommendations based on soil conditions</li>
                                <li>Manual data entry support for soil parameters</li>
                                <li>Interactive dashboard with visual data representation</li>
                                <li>Soil health scoring and analysis</li>
                                <li>Device management system for IoT sensors</li>
                            </ul>
                        </section>

                        {/* Technology Stack */}
                        <section className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-2xl font-semibold text-white mb-4">Technology Stack</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-medium text-white mb-3">Frontend</h3>
                                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                                        <li>React.js</li>
                                        <li>React Router for navigation</li>
                                        <li>Chart.js for data visualization</li>
                                        <li>Tabler Icons for UI elements</li>
                                        <li>Axios for API communication</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-white mb-3">Backend</h3>
                                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                                        <li>FastAPI (Python)</li>
                                        <li>Scikit-learn for ML models</li>
                                        <li>Pandas for data processing</li>
                                        <li>Azure Blob Storage for data storage</li>
                                        <li>Render for backend hosting</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Getting Started */}
                        <section className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-2xl font-semibold text-white mb-4">Getting Started</h2>
                            <div className="space-y-4 text-gray-300">
                                <p>To use Soil Fusion:</p>
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>Sign in using the demo credentials (test@test.com / test123)</li>
                                    <li>Navigate to the Devices page to add soil monitoring devices or enter manual data</li>
                                    <li>View real-time soil analysis and crop recommendations on the Dashboard</li>
                                    <li>Monitor soil health trends and receive AI-powered suggestions</li>
                                </ol>
                            </div>
                        </section>

                        {/* Note */}
                        <section className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20">
                            <h2 className="text-xl font-semibold text-yellow-500 mb-2">Important Note</h2>
                            <p className="text-yellow-400">
                                This is a demonstration version of Soil Fusion. Some features may be limited or simulated for 
                                demonstration purposes. For full functionality, please contact the development team.
                            </p>
                        </section>

                        {/* Future Improvements */}
                        <section className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-2xl font-semibold text-white mb-6">Future Improvements</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Real-time Monitoring */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">Real-time Monitoring</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Real-time Soil Monitoring</h4>
                                            <p className="text-gray-300">Monitor soil conditions in real-time with advanced sensors tracking moisture, temperature, pH, and nutrient levels for optimal crop growth.</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Automated Irrigation Systems</h4>
                                            <p className="text-gray-300">Save water and resources with smart irrigation systems that activate only when needed, based on real-time soil moisture data.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI and Analytics */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">AI and Analytics</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">AI-Powered Analysis</h4>
                                            <p className="text-gray-300">Leverage artificial intelligence to analyze soil data and receive personalized recommendations for improving soil health and crop yield.</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Image Analysis</h4>
                                            <p className="text-gray-300">Upload images of your soil or crops for instant AI-powered analysis to detect health issues and receive treatment recommendations.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Integration */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">Weather Systems</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Weather Integration</h4>
                                            <p className="text-gray-300">Access local weather forecasts and receive guidance on optimal timing for irrigation, planting, and fertilization based on weather conditions.</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Predictive Weather Integration</h4>
                                            <p className="text-gray-300">Plan your farming activities with confidence using AI-powered weather forecasts that help optimize irrigation and fertilization timing.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Features */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">Smart Features</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Smart Notifications</h4>
                                            <p className="text-gray-300">Stay informed with real-time alerts about critical soil conditions, weather changes, and recommended actions for your crops.</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Natural Language Interaction</h4>
                                            <p className="text-gray-300">Get instant support through our AI chatbot that provides conversational access to insights and recommendations.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Technology */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">Advanced Technology</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Automated Drone Farming</h4>
                                            <p className="text-gray-300">Deploy smart drones that automatically apply water or fertilizers to specific areas based on real-time soil analysis alerts.</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Data Analytics</h4>
                                            <p className="text-gray-300">Track trends and patterns in soil health over time with comprehensive data visualization and reporting tools.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Management Tools */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-medium text-white">Management Tools</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Device Management</h4>
                                            <p className="text-gray-300">Easily manage and monitor multiple soil sensors across your farm from a single, intuitive dashboard.</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <h4 className="text-lg font-medium text-green-400 mb-2">Easy Sharing of Reports</h4>
                                            <p className="text-gray-300">Generate and share comprehensive soil analysis reports and recommendations to facilitate better decision-making.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReadMe;