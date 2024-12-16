import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../ABI/Votingabi";
import "./finished.css"
const Finished = ({ provider }) => {
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (provider) {
      fetchWinner();
    }
  }, [provider]);

  const fetchWinner = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);
      const winner = await contractInstance.winner(); 
      setWinner(winner);
    } catch (err) {
      console.error("Error fetching winner:", err);
    }
  };

  return (
    <div className="login-container">
      <h1 className="welcome-message">Voting is Finished</h1>
      {winner ? (
        <div className="winner-container">
          <h2>Winner Details</h2>
          <p><strong>Name:</strong> {winner}</p>
          {/* <p><strong>Votes:</strong> {winner.voteCount}</p> */}
        </div>
      ) : (
        <p>Loading winner details...</p>
      )}
    </div>
  );
};

Finished.propTypes = {
  provider: PropTypes.object.isRequired, 
};

export default Finished;
