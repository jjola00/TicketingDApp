import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'https://cdn.jsdelivr.net/npm/react-router-dom@6.14.0/dist/umd/react-router-dom.min.js';
import NavBar from './components/NavBar.jsx';
import CreateWallet from './components/CreateWallet.jsx';
import CheckBalance from './components/CheckBalance.jsx';
import BuyTicket from './components/BuyTicket.jsx';
import TransferTicket from './components/TransferTicket.jsx';

const App = () => {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-100">
                <NavBar />
                <main className="flex-1 container mx-auto p-4">
                    <Routes>
                        <Route path="/" element={
                            <div className="text-center">
                                <h1 className="text-4xl font-bold mb-4">Decentralized Ticketing System</h1>
                                <p className="text-lg mb-4">
                                    Create a wallet, buy tickets, check balances, and transfer tickets on the Sepolia Testnet.
                                </p>
                                <a href="/create-wallet" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                    Get Started
                                </a>
                            </div>
                        } />
                        <Route path="/create-wallet" element={<CreateWallet />} />
                        <Route path="/check-balance" element={<CheckBalance />} />
                        <Route path="/buy-ticket" element={<BuyTicket />} />
                        <Route path="/transfer-ticket" element={<TransferTicket />} />
                    </Routes>
                </main>
                <footer className="bg-gray-800 text-white text-center py-4">
                    <p>© 2025 Ticketing DApp</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;