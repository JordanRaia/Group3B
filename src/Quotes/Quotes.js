import React from "react";
import "./Quotes.css";
import {useLocation} from 'react-router-dom';

function Quotes(props) {
    //return <div className="quotes">Quotes</div>;

    const location = useLocation();

    const { state } = this.props.location;
    return ( 
        <>
            {console.log(state.id)};
            {console.log(location.name)};
            <div>{state.id}</div>
            <div>{location.name}</div>
        </>
    )
}

export default Quotes;
