import React, { useState, useEffect } from 'react';

const CreateWallet = () => {
    const [password, setPassword] = useState('');
    const [importPrivateKey, setImportPrivateKey] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [walletDetails, setWalletDetails] = useState(null);
    const [status, setStatus] = useState('');
    const [sethBalance, setSethBalance] = useState(null);

    const web3 = new Web3(window.ethereum);

    const createWallet = async () => {
        if (!password) {
            setStatus('Please enter a password for the keystore.');
            return;
        }

        setStatus('Creating wallet...');
        try {
            const wallet = web3.eth.accounts.create();
            const keystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
            setWalletDetails({ ...wallet, keystore: JSON.stringify(keystore, null, 2) });

            const balance = await web3.eth.getBalance(wallet.address);
            setSethBalance(web3.utils.fromWei(balance, 'ether'));

            setStatus('Wallet created successfully!');
        } catch (error) {
            setStatus(`Error creating wallet: ${error.message}`);
        }
    };

    const importWallet = async () => {
        if (!importPrivateKey || !importPassword) {
            setStatus('Please enter both private key and password.');
            return;
        }

        setStatus('Importing wallet...');
        try {
            if (!importPrivateKey.startsWith('0x')) throw new Error('Private key must start with 0x');
            const wallet = web3.eth.accounts.privateKeyToAccount(importPrivateKey);
            const keystore = web3.eth.accounts.encrypt(wallet.privateKey, importPassword);
            setWalletDetails({ ...wallet, keystore: JSON.stringify(keystore, null, 2) });

            const balance = await web3.eth.getBalance(wallet.address);
            setSethBalance(web3.utils.fromWei(balance, 'ether'));

            setStatus('Wallet imported successfully!');
        } catch (error) {
            setStatus(`Error importing wallet: ${error.message}`);
        }
    };

    const downloadKeystore = () => {
        const blob = new Blob([walletDetails.keystore], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${walletDetails.address}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (walletDetails) {
            const qrCodeDiv = document.getElementById('qrcode');
            qrCodeDiv.innerHTML = '';
            QRCode.toCanvas(qrCodeDiv, walletDetails.address, { width: 200 }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [walletDetails]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Create a Wallet</h1>
            <div className="tabs">
                <div className="border-b mb-4">
                    <button className="px-4 py-2 border-b-2 border-blue-500" onClick={() => setWalletDetails(null)}>Create</button>
                    <button className="px-4 py-2" onClick={() => setWalletDetails(null)}>Import</button>
                </div>

                {!walletDetails ? (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Password for Keystore</label>
                            <input type="password" className="w-full p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" onClick={createWallet}>Create Wallet</button>

                        <div className="mt-4">
                            <label className="block text-sm font-medium">Private Key (for Import)</label>
                            <input type="text" className="w-full p-2 border rounded" value={importPrivateKey} onChange={(e) => setImportPrivateKey(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Password for New Keystore</label>
                            <input type="password" className="w-full p-2 border rounded" value={importPassword} onChange={(e) => setImportPassword(e.target.value)} />
                        </div>
                        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" onClick={importWallet}>Import Wallet</button>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Wallet Details</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Wallet Address</label>
                            <textarea className="w-full p-2 border rounded" rows="2" readOnly value={walletDetails.address}></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">SETH Balance</label>
                            <input className="w-full p-2 border rounded" value={`${sethBalance} SETH`} readOnly />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Private Key</label>
                            <textarea className="w-full p-2 border rounded" rows="2" readOnly value={walletDetails.privateKey}></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Keystore File</label>
                            <textarea className="w-full p-2 border rounded" rows="5" readOnly value={walletDetails.keystore}></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">QR Code</label>
                            <canvas id="qrcode" className="mx-auto"></canvas>
                        </div>
                        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600" onClick={downloadKeystore}>Download Keystore</button>
                    </div>
                )}
            </div>
            {status && <div className="mt-4 p-2 bg-gray-200 rounded">{status}</div>}
        </div>
    );
};

export default CreateWallet;