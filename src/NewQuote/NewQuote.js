import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewQuotePopup from "./NewQuotePopup";
import "./NewQuote.css";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { onValue, ref as dbRef } from "firebase/database";

function NewQuote() {
    const [customers, setCustomers] = useState([]);
    const [popup, setPopup] = useState(false);
    const [user, setUser] = useState({});
    const [quotes, setQuotes] = useState([]);
    const [customerId, setCustomerId] = useState(0); // selected customer in dropdown
    // for creating new quote in database
    const [customer, setCustomer] = useState("");

    useEffect(() => {
        getCustomers();
        authState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    function getCustomers() {
        axios
            .get("https://students.cs.niu.edu/~z1860207/legacy.php")
            .then(function (response) {
                setCustomers(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    
    return ( <div classname= "app-container">
        <table> 
            <thead> 
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Street</th>
                    <th>Contact</th>
                    <th>Update</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((customer) => (
                            <tr>
                                <td>{customer.id}</td>
                                <td>{customer.name}</td>
                                <td>{customer.city}</td>
                                <td>{customer.street}</td>
                                <td>{customer.contact}</td>
                                <td>
                                    <Link to = {{ 
                                        pathname: "/Quotes",
                                        state: {id: "customer.id", name: "customer.name", city: "customer.city", street: "customer.street", contact: "customer.contact"}
                                        }}>
                                            <button class="button-49">Edit</button>
                                        </Link>
                                </td>
                            </tr>
                        ))}
            </tbody>
        </table>
    </div> )
}

export default NewQuote;
