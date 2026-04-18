import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="">
            <div className="max-w-screen-xl mx-auto py-12">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                        <div className="flex-1 w-full lg:max-w-xl">
                            <div className="mb-6">

                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                    {t('Page Not Found') || 'Page Not Found'}
                                </h2>
                                <p className="text-lg text-gray-600 mb-2">
                                    {t('Oops! The page you\'re looking for doesn\'t exist or has been moved.') || 'Oops! The page you\'re looking for doesn\'t exist or has been moved.'}
                                </p>
                                <p className="text-base text-gray-500">
                                    {t('Don\'t worry, we can help you find what you need.') || 'Don\'t worry, we can help you find what you need.'}
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">
                                    {t('What would you like to do?') || 'What would you like to do?'}
                                </h3>
                                <ul className="space-y-3 text-gray-700 text-sm">
                                    <li className="flex items-start">
                                        <span className="mr-3 text-gray-400">→</span>
                                        <span>{t('Search for events, venues, or properties using our search bar') || 'Search for events, venues, or properties using our search bar'}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-3 text-gray-400">→</span>
                                        <span>{t('Browse available locations and discover perfect venues for your event') || 'Browse available locations and discover perfect venues for your event'}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-3 text-gray-400">→</span>
                                        <span>{t('Return to the homepage to start exploring') || 'Return to the homepage to start exploring'}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/"
                                    className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 hover:shadow-md active:scale-[0.98] text-sm"
                                >
                                    <Home className="w-5 h-5" />
                                    <span>{t('Go to Homepage') || 'Go to Homepage'}</span>
                                </Link>

                            </div>
                        </div>

                        {/* Right Section - Modern Illustration */}
                        <div className="flex-1 w-full lg:max-w-lg flex items-center justify-center">
                            <div className="relative w-full max-w-md">
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 500 500"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="overflow-visible"
                                >
                                    {/* Gradient Background Circle */}
                                    <defs>
                                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                                        </linearGradient>
                                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                                        </linearGradient>
                                    </defs>

                                    {/* Background Circles */}
                                    <circle cx="250" cy="250" r="200" fill="url(#gradient1)" />
                                    <circle cx="250" cy="250" r="160" fill="url(#gradient2)" />

                                    {/* Main Search Magnifying Glass */}
                                    <g transform="translate(250, 200)">
                                        {/* Magnifying Glass Handle */}
                                        <line
                                            x1="60"
                                            y1="60"
                                            x2="100"
                                            y2="100"
                                            stroke="#3b82f6"
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                        />
                                        {/* Magnifying Glass Circle */}
                                        <circle
                                            cx="0"
                                            cy="0"
                                            r="70"
                                            fill="white"
                                            stroke="#3b82f6"
                                            strokeWidth="8"
                                        />
                                        {/* Question Mark inside */}
                                        <text
                                            x="0"
                                            y="20"
                                            fontSize="80"
                                            fontWeight="bold"
                                            fill="#3b82f6"
                                            textAnchor="middle"
                                            fontFamily="Arial, sans-serif"
                                        >
                                            ?
                                        </text>
                                    </g>

                                    {/* Floating Location Pins */}
                                    <g transform="translate(120, 150)">
                                        <circle cx="0" cy="0" r="25" fill="#10b981" opacity="0.8" />
                                        <path
                                            d="M 0 -15 L -8 8 L 0 0 L 8 8 Z"
                                            fill="white"
                                        />
                                    </g>

                                    <g transform="translate(380, 180)">
                                        <circle cx="0" cy="0" r="20" fill="#8b5cf6" opacity="0.8" />
                                        <path
                                            d="M 0 -12 L -6 6 L 0 0 L 6 6 Z"
                                            fill="white"
                                        />
                                    </g>

                                    <g transform="translate(100, 320)">
                                        <circle cx="0" cy="0" r="18" fill="#f59e0b" opacity="0.8" />
                                        <path
                                            d="M 0 -11 L -5 5 L 0 0 L 5 5 Z"
                                            fill="white"
                                        />
                                    </g>

                                    <g transform="translate(400, 340)">
                                        <circle cx="0" cy="0" r="22" fill="#ef4444" opacity="0.8" />
                                        <path
                                            d="M 0 -13 L -7 7 L 0 0 L 7 7 Z"
                                            fill="white"
                                        />
                                    </g>

                                    {/* Decorative Elements - Small Search Icons */}
                                    <g transform="translate(150, 380) rotate(-15)">
                                        <circle cx="0" cy="0" r="15" fill="none" stroke="#94a3b8" strokeWidth="2" />
                                        <line x1="10" y1="10" x2="18" y2="18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                                    </g>

                                    <g transform="translate(350, 380) rotate(15)">
                                        <circle cx="0" cy="0" r="15" fill="none" stroke="#94a3b8" strokeWidth="2" />
                                        <line x1="10" y1="10" x2="18" y2="18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

