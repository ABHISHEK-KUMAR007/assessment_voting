import React from "react";
import PropTypes from "prop-types"; 

const Login = ({ connectWallet }) => {
    return (
        <div className="login-container">
            <h1 className="welcome-message">Welcome to decentralized voting application</h1>
            <button className="login-button" onClick={connectWallet}>Connect Wallet</button>
        </div>
    );
};

Login.propTypes = {
    connectWallet: PropTypes.func.isRequired, 
};

export default Login;
