import React, { useState } from "react";
import "./NewQuote.css";
import axios from "axios";

function NewQuote()  {
    //return <div className="new">NewQuote</div>;
    const [customers, setCustomers] = useState();

    return <div classname= "app-container">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Street</th>
                    <th>Contact</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>12</td>
                    <td>Jay Gordon</td>
                    <td>San Francisco</td>
                    <td>cherry blossom st</td>
                    <td>jgordon12@gmail.com</td>
                </tr>
            </tbody>
        </table>
    </div>;
}

export default NewQuote;
