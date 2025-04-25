import React, { useState, useEffect } from 'react';
import TicketTokenABI from '../TicketTokenABI.json';

const BuyTicket = () => {
    const [numberOfTickets, setNumberOfTickets] = useState('');
    const [status, setStatus] = useState('');
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [gasEstimate, setGasEstimate] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const estimateGas = async () => {
        if (!numberOfTickets || numberOfTickets < 1) {
            setStatus('Please enter a valid number of tickets.');
            return;
        }

        try {
            const ticketPrice = await contract.methods.TICKET_PRICE().call();
            const totalCost = BigInt(numberOfTickets) * BigInt(ticketPrice);
            const accounts = await web3.eth.getAccounts();
            const gas = await contract.methods.buyTickets(numberOfTickets).estimateGas({
                from: accounts[0],
                value: totalCost.toString(),
            });
            setGasEstimate(web3.utils.fromWei(gas.toString(), 'gwei'));
            setShowConfirm(true);
        } catch (error) {
            setStatus(`Error estimating gas: ${error.message}`);
        }
    };

    const buyTickets = async () => {
        if (!(await checkNetwork())) return;
        setShowConfirm(false);

        setStatus('Buying tickets...');
        try {
            const ticketPrice = await contract.methods.TICKET_PRICE().call();
            const totalCost = BigInt(numberOfTickets) * BigInt(ticketPrice);
            const accounts = await web3.eth.getAccounts();

            const tx = await contract.methods.buyTickets(numberOfTickets).send({
                from: accounts[0],
                value: totalCost.toString(),
            });

            const balance = await contract.methods.checkBalance(accounts[0]).call();
            const balanceInEther = web3.utils.fromWei(balance, 'ether');
            setTransactionHistory([...transactionHistory, {
                txHash: tx.transactionHash,
                tickets: numberOfTickets,
                timestamp: new Date().toLocaleString(),
            }]);
            setStatus(`Successfully bought ${numberOfTickets} tickets! Balance: ${balanceInEther} TKT`);
        } catch (error) {
            setStatus(`Error buying tickets: ${error.message}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Buy Tickets</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium">Number of Tickets</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={numberOfTickets}
                    onChange={(e) => setNumberOfTickets(e.target.value)}
                    min="1"
                />
            </div>
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" onClick={estimateGas}>Buy Tickets</button>
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <p>Estimated Gas: {gasEstimate} Gwei</p>
                        <p>Total Cost: {(numberOfTickets * 0.01).toFixed(2)} SETH</p>
                        <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={buyTickets}>Confirm</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowConfirm(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {status && <div className="mt-4 p-2 bg-gray-200 rounded">{status}</div>}
            {transactionHistory.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                    <ul className="list-disc pl-5">
                        {transactionHistory.map((tx, index) => (
                            <li key={index}>
                                Bought {tx.tickets} tickets at {tx.timestamp} -{' '}
                                <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" className="text-blue-500">View Tx</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BuyTicket;