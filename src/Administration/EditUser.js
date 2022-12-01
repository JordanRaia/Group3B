import React from "react";
import "./EditUser.css";

const EditUser = (props) => {
    return props.trigger ? (
        <div className="popup">
            <div className="popupInner">
                <button
                    onClick={() => props.setTrigger(false)}
                    className="popupCloseBtn"
                >
                    
                </button>
                {props.children}
            </div>
        </div>
    ) : (
        ""
    );
}

export default EditUser;