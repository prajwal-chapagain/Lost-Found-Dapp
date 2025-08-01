// App.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { uploadFile } from './ipfsUpload';
import contractData from './LostFound.json';
import './App.css';
const LostFoundABI = contractData.abi;

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {
  const [account, setAccount] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [secret, setSecret] = useState('');
  const [claimId, setClaimId] = useState('');
  const [claimSecret, setClaimSecret] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const connectWallet = async () => {
    const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(acc);
    window.web3 = new Web3(window.ethereum);
  };

  const reportLostItem = async () => {
    if (!description || !image || !secret) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      const fileHash = await uploadFile(image);
      const contract = new window.web3.eth.Contract(LostFoundABI, CONTRACT_ADDRESS);
      const secretHash = window.web3.utils.keccak256(secret);

      await contract.methods
        .reportLostItem(description, fileHash, secretHash)
        .send({ from: account });

      setMessage({ text: '✅ Lost item reported successfully!', type: 'success' });
      setDescription('');
      setImage(null);
      setSecret('');
      fetchItems();
    } catch (error) {
      setMessage({ text: '❌ Failed to report lost item.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const claimItem = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      const contract = new window.web3.eth.Contract(LostFoundABI, CONTRACT_ADDRESS);
      await contract.methods.markAsFound(claimId, claimSecret).send({ from: account });
      setMessage({ text: '✅ Item claimed successfully!', type: 'success' });
      fetchItems();
    } catch (err) {
      setMessage({ text: '❌ Failed to claim item. Wrong secret or ID.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const contract = new window.web3.eth.Contract(LostFoundABI, CONTRACT_ADDRESS);
    const itemList = [];

    try {
      const count = await contract.methods.itemCount().call();
      for (let i = 0; i < count; i++) {
        const item = await contract.methods.getItem(i).call();
        itemList.push({ id: i, description: item[0], imageHash: item[1], isFound: item[2] });
      }
      setItems(itemList);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/logo1.png" alt="Logo" className="app-logo" />
        <h1>Lost & Found DApp</h1>
        <button className="connect-btn" onClick={connectWallet}>🔗 Connect Wallet</button>
        <p className="account-status">Connected: {account || 'Not connected'}</p>
      </header>

      <main className="content-wrapper">
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {loading && <div className="loading">Loading...</div>}

        <section className="form-card">
          <h2> Report Lost Item</h2>
          <input
            type="text"
            placeholder="Item Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <input
            type="text"
            placeholder="Secret Phrase"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
          <button onClick={reportLostItem} disabled={loading}>📤 Submit</button>
        </section>

        <section className="form-card">
          <h2> Claim Found Item</h2>
          <input
            type="number"
            placeholder="Item ID"
            onChange={(e) => setClaimId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Secret Phrase"
            onChange={(e) => setClaimSecret(e.target.value)}
          />
          <button onClick={claimItem} disabled={loading}>✅ Claim</button>
        </section>

        <section className="items-section">
          <h2> Reported Items</h2>
          <div className="items-grid">
            {items.map((item) => (
              <div className="item-card" key={item.id}>
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Description:</strong> {item.description}</p>
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${item.imageHash}`}
                  alt="Lost item"
                  onError={() => console.log("❌ Image failed to load")}
                />
                <p><strong>Status:</strong> {item.isFound ? '✅ Claimed' : '❌ Lost'}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
