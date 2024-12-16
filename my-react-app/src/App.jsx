import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './ABI/Votingabi';
import Login from './components/login';
import Finished from './components/finished';
import Connected from './components/connected';
import './App.css';


function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(true);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      initializeProvider();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && provider) {
      getCandidates();
      getRemainingTime();
      getCurrentStatus();
      

    }
  }, [isConnected, provider]); 

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }

  

  async function initializeProvider() {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
  
        await web3Provider.send("eth_requestAccounts", []);  
        const signer = await web3Provider.getSigner(); 
        const address = await signer.getAddress();  
        setAccount(address);  
        setIsConnected(true);
      } catch (err) {
        console.error("Error connecting to MetaMask:", err);
      }
    }
  }
  // user will give the vote
  async function vote() {
    const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const candidateIndex = parseInt(number, 10);
      const tx = await contractInstance.vote(candidateIndex);
      await tx.wait();
      setCanVote(false);

      const votedCandidate = candidates.find(c => c.index === candidateIndex);

    //store the data related to user in Pinata
    const voterData = {
      voterAddress: account, 
      candidateIndex: candidateIndex,
      candidateName: votedCandidate ? votedCandidate.name : 'Unknown',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch('http://localhost:5000/upload-to-pinata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voterData }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('Uploaded to Pinata:', result.ipfsHash);
    } else {
      console.error('Failed to upload to Pinata');
    }
  }
  

  async function checkCanVote() {
    if (!provider) return;
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

    try {
      const voterStatus = await contractInstance.voters(address);
      setCanVote(voterStatus);
    } catch (err) {
      console.error("Error checking voting status:", err);
    }
  }

  async function getCandidates() {
    if (!provider) return;
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);
    const candidatesList = await contractInstance.getAllVotesOfCandiates();
    
    const formattedCandidates = candidatesList.map((candidate, index) => {
      return {
        index: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toString(),
      }
    });
    setCandidates(formattedCandidates);
  }

  async function getRemainingTime() {
    if (!provider) return;
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);
    
    try {
      const time = await contractInstance.getRemainingTime();      
        setRemainingTime(Number(time)); 
    } catch (err) {
      console.error("Error getting remaining time:", err);
    }
  }
  

  async function getCurrentStatus() {
    if (!provider) return;
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);
    const status = await contractInstance.getVotingStatus();
    setVotingStatus(status);
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      checkCanVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        await web3Provider.send("eth_requestAccounts", []);
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
      } catch (err) {
        console.error("Error connecting to Metamask:", err);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  return (
    <div className="App">
      {votingStatus ? (
        isConnected ? (
          <Connected
            account={account}
            candidates={candidates}
            remainingTime={remainingTime}
            number={number}
            handleNumberChange={handleNumberChange}
            voteFunction={vote}
            showButton={canVote}
          />
        ) : (
          <Login connectWallet={connectToMetamask} />
        )
      ) : (
        <Finished provider={provider} />
      )}
    </div>
  );
}

export default App;
