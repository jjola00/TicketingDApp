import React, { useState, useEffect } from 'react';
import TicketTokenABI from '../TicketTokenABI.json';

const TransferTicket = () => {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [numberOfTickets, setNumberOfTickets] = useState('');
    const [ticketId, setTicketId] = useState('');
    const [transferToVendor, setTransferToVendor] = useState(false);
    const [status, setStatus] = useState('');
    const [balance, setBalance] = useState(null);

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

    const fetchBalance = async (address) => {
        const bal = await contract.methods.checkBalance(address).call();
        setBalance(web3.utils.fromWei(bal, 'ether'));
    };

    const transferTickets = async () => {
        if (!(await checkNetwork())) return;
        if (!recipientAddress && !transferToVendor) {
            setStatus('Please enter a recipient address or select Transfer to Vendor.');
            return;
        }
        if (!web3.utils.isAddress(recipientAddress) && !transferToVendor) {
            setStatus('Invalid recipient address.');
            return;
        }
        if (!numberOfTickets || numberOfTickets < 1) {
            setStatus('Please enter a valid number of tickets.');
            return;
        }
        if (!ticketId) {
            setStatus('Please enter a ticket ID.');
            return;
        }

        const amount = web3.utils.toWei(numberOfTickets, 'ether');
        const accounts = await web3.eth.getAccounts();
        const senderAddress = accounts[0];

        try {
            const bal = await contract.methods.checkBalance(senderAddress).call();
            if (web3.utils.fromWei(bal, 'ether') < numberOfTickets) {
                setStatus('Insufficient balance.');
                return;
            }

            setStatus('Transferring tickets...');
            const method = transferToVendor
                ? contract.methods.transferToVendor(amount, ticketId)
                : contract.methods.transferTickets(recipientAddress, amount, ticketId);
            await method.send({ from: senderAddress });

            setStatus(`Successfully transferred ${numberOfTickets} tickets!`);
            fetchBalance(senderAddress);
        } catch (error) {
            setStatus(`Error transferring tickets: ${error.message}`);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            web3.eth.getAccounts().then(accounts => {
                if (accounts.length > 0) fetchBalance(accounts[0]);
            });
        }
    }, []);

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Transfer Tickets</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium">Recipient Address</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter recipient address"
                    disabled={transferToVendor}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={transferToVendor}
                        onChange={(e) => setTransferToVendor(e.target.checked)}
                    />
                    Transfer to Vendor
                </label>
            </div>
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
            <div className="mb-4">
                <label className="block text-sm font-medium">Ticket ID</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    min="1"
                />
            </div>
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" onClick={transferTickets}>Transfer Tickets</button>
            {balance !== null && <div className="mt-4 p-2 bg-green-100 rounded">Current Balance: {balance} TKT</div>}
            {status && <div className="mt-4 p-2 bg-gray-200 rounded">{status}</div>}
        </div>
    );
};

export default TransferTicket;