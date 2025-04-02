import React from "react";

const Alert = ({ message }) => {
    if (!message) return null;

    return (
        <div className="alert show">
            {message}
        </div>
    );
};

export default Alert;