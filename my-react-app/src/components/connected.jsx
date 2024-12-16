import PropTypes from "prop-types"; // Import PropTypes
import "./connected.css"
const Connected = ({ account, candidates, remainingTime, number, handleNumberChange, voteFunction, showButton }) => {
    return (
        <div className="connected-container">
            <h1 className="connected-header">Welcome To Decentralize Voting System</h1>
            <p className="connected-account">Metamask Account: {account}</p>

            <p className="connected-account">
                Remaining Time: {remainingTime ? remainingTime : 'Loading...'}
            </p>

            {!showButton ? (
                <p className="connected-account">You have already voted</p>
            ) : (
                <div>
                    <input
                        type="number"
                        placeholder="Enter Candidate Index"
                        value={number}
                        onChange={handleNumberChange}
                    />
                    <br />
                    <button className="login-button" onClick={voteFunction}>Vote</button>
                </div>
            )}
            
            <table id="myTable" className="candidates-table">
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Candidate Name</th>
                        <th>Candidate Votes</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.length > 0 ? (
                        candidates.map((candidate, index) => (
                            <tr key={index}>
                                <td>{candidate.index}</td>
                                <td>{candidate.name}</td>
                                <td>{candidate.voteCount}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No candidates available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Add PropTypes validation
Connected.propTypes = {
    account: PropTypes.string.isRequired,
    candidates: PropTypes.arrayOf(
        PropTypes.shape({
            index: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            voteCount: PropTypes.number.isRequired
        })
    ).isRequired,
    remainingTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    number: PropTypes.string.isRequired,
    handleNumberChange: PropTypes.func.isRequired,
    voteFunction: PropTypes.func.isRequired,
    showButton: PropTypes.bool.isRequired
};

export default Connected;
