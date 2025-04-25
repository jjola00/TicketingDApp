import React from 'react';
import { Link, useLocation } from 'https://cdn.jsdelivr.net/npm/react-router-dom@6.14.0/dist/umd/react-router-dom.min.js';

const NavBar = () => {
    const location = useLocation();

    return (
        <nav className="bg-gray-900 text-white p-4 sticky top-0 z-10">
            <div className="container mx-auto flex justify-center space-x-6">
                <Link to="/" className={`hover:text-gray-300 ${location.pathname === '/' ? 'font-bold text-white' : ''}`}>
                    Home
                </Link>
                <Link to="/create-wallet" className={`hover:text-gray-300 ${location.pathname === '/create-wallet' ? 'font-bold text-white' : ''}`}>
                    Create Wallet
                </Link>
                <Link to="/check-balance" className={`hover:text-gray-300 ${location.pathname === '/check-balance' ? 'font-bold text-white' : ''}`}>
                    Check Balance
                </Link>
                <Link to="/buy-ticket" className={`hover:text-gray-300 ${location.pathname === '/buy-ticket' ? 'font-bold text-white' : ''}`}>
                    Buy Ticket
                </Link>
                <Link to="/transfer-ticket" className={`hover:text-gray-300 ${location.pathname === '/transfer-ticket' ? 'font-bold text-white' : ''}`}>
                    Transfer Ticket
                </Link>
            </div>
        </nav>
    );
};

export default NavBar;