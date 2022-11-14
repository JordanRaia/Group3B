import React from "react";
import "./NewQuotePopup.css";

function NewQuotePopup(props) {
    return props.trigger ? (
        <div className="popup">
            <div className="popup__inner">
                <button
                    onClick={() => props.setTrigger(false)}
                    className="popup__closeBtn"
                >
                    close
                </button>
                {props.children}
            </div>
        </div>
    ) : (
        ""
    );
}

export default NewQuotePopup;
