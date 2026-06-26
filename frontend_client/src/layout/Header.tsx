import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { useUserStore } from '../store/user.store';

import HeaderClient from './HeaderClient';
import Search from '../components/Search';

const Header = () => {
    const { t } = useTranslation();
    const user = useUserStore((state) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const pathname = window.location.pathname;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        setIsDropdownOpen(false);
    }, [pathname]);

    if (user) {
        return <HeaderClient />
    }

    return (
        <header className="bg-primary-dark sticky top-0 z-25 w-full border-b border-gray-200">
            <div className="mx-auto w-full md:py-4 md:px-8 py-2 px-4 flex items-center justify-between relative">
                <div>
                    <Link to="/" className="flex items-center flex-shrink-0">
                            <span className="text-white text-lg font-bold">EventFinder</span>
                        {/* <img src="/logo_white.svg" alt="Logo" className="" style={{ height: '50px', width: '150px' }} /> */}
                    </Link>

                </div>
                <div className="hidden md:flex items-center gap-4 text-white">
                    <NavLink
                        to="/join"
                        className=''
                    >
                        {t('register_restaurant')}
                    </NavLink>
                    <NavLink
                        to="/login"
                        className='bg-white py-1 px-3 text-black rounded-md'
                    >
                        {t('login')}
                    </NavLink>
                    <NavLink
                        to="/register"
                        className='bg-white py-1 px-3 text-black rounded-md'
                    >
                        {t('register')}
                    </NavLink>
                </div>

                <div className="md:hidden flex items-center">
                    <Link
                        to="/login"
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Login"
                    >
                        <User className="w-5 h-5 text-gray-700" />
                    </Link>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label="Menu"
                        >
                            <Menu className="w-5 h-5 text-gray-700" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-[300px] max-w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <Link
                                    to="/register"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    {t('register')}
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <Link
                                    to="/join"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    {t('register_restaurant')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header >
    );
};

export default Header;
