import React, { useState } from 'react';
import TicketTokenABI from '../TicketTokenABI.json';

const CheckBalance = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [role, setRole] = useState('attendee');
    const [tktBalance, setTktBalance] = useState(null);
    const [sethBalance, setSethBalance] = useState(null);
    const [status, setStatus] = useState('');

    const web3 = new Web3(window.ethereum);
    const contractAddress = '0xD5d065CB9FeC8Ce0C6A8A85Bcebfc9209D579e20';
    const contract = new web3.eth.Contract(TicketTokenABI, contractAddress);

    const checkNetwork = async () => {
        const chainId = await web3.eth.getChainId();
        if (chainId !== 11155111) {
            setStatus('Please switch to the Sepolia Testnet in MetaMask.');
            return false;
        }
        return true;
    };

    const checkBalance = async () => {
        if (!(await checkNetwork())) return;
        if (!walletAddress || !web3.utils.isAddress(walletAddress)) {
            setStatus('Please enter a valid wallet address.');
            return;
        }

        setStatus('Checking balance...');
        try {
            // Check TKT balance
            const tkt = await contract.methods.checkBalance(walletAddress).call();
            setTktBalance(web3.utils.fromWei(tkt, 'ether'));

            // Check SETH balance
            const seth = await web3.eth.getBalance(walletAddress);
            setSethBalance(web3.utils.fromWei(seth, 'ether'));

            setStatus('Balance checked successfully!');
        } catch (error) {
            setStatus(`Error checking balance: ${error.message}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Check Balance</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium">Role</label>
                <select className="w-full p-2 border rounded" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="attendee">Attendee</option>
                    <option value="doorman">Doorman</option>
                    <option value="venue">Venue</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium">Wallet Address</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter wallet address"
                />
            </div>
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" onClick={checkBalance}>Check Balance</button>
            {tktBalance !== null && (
                <div className="mt-4 p-2 bg-green-100 rounded">
                    <p>TKT Balance: {tktBalance} TKT</p>
                    <p>SETH Balance: {sethBalance} SETH</p>
                    {role === 'doorman' && <p>{tktBalance > 0 ? 'Valid Ticket Holder' : 'No Tickets'}</p>}
                    {role === 'venue' && <p>Total Tickets Distributed: {tktBalance} TKT</p>}
                </div>
            )}
            {status && <div className="mt-4 p-2 bg-gray-200 rounded">{status}</div>}
        </div>
    );
};

export default CheckBalance;