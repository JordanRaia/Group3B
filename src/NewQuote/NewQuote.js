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

    useEffect(() => {
        getCustomers();
        authState();
    }, []);
    function getCustomers() {
        axios
            .get("https://students.cs.niu.edu/~z1860207/legacy.php")
            .then(function (response) {
                // console.log(response.data);
                setCustomers(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //set user to current user if logged in
    function authState() {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (user) {
                const quotesRef = dbRef(db, `quotes/current quotes/`);

                onValue(quotesRef, (snapshot) => {
                    const data = snapshot.val();
                    setQuotes(data);
                });
            }
        });
    }

    //calculate the cost of the quote with discounts
    function calculateQuoteAmount(index) {
        let amount = 0; //total cost
        //get cost of each item and add to amount
        for (var item in quotes[index.id]["line items"]) {
            //add the cost of item to amount
            amount += quotes[index.id]["line items"][item]["amount"];
        }

        //get flat discounts and remove from total amount
        for (var flatDiscount in quotes[index.id]["discount"]["amount"])
        {
            //subtract flat discount from amount
            amount -= quotes[index.id]["discount"]["amount"][flatDiscount];
        }

        //get precent discounts and remove from amount
        for (var percentDiscount in quotes[index.id]["discount"]["percent"])
        {
            //get the value to multiply by to get new total amount
            let decimalPercent = 1 - (quotes[index.id]["discount"]["percent"][percentDiscount] / 100)
            amount *= decimalPercent;
        }

        //round to 2 decimal places
        amount = amount.toFixed(2);

        return amount;
    }

    return user ? (
        // user is logged in
        <div className="new">
            <h2 className="new__headerText">Create New Quote:</h2>
            <div className="new__customerSelect">
                <h3 className="new__text">select customer: </h3>
                <select
                    className="new__dropdown"
                    name="customerSelect"
                    id="customerSelect"
                >
                    <option className="new__text" value="Please Select">
                        Please Select
                    </option>
                    {customers.map((customer) => (
                        <option className="new__text" value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
                <button onClick={() => setPopup(true)} class="button-49">
                    New Quote
                </button>
                <NewQuotePopup trigger={popup} setTrigger={setPopup}>
                    <h3>My popup</h3>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Laudantium error quas inventore, fugiat necessitatibus
                        velit provident obcaecati id perspiciatis veritatis!
                        Minima dicta dignissimos labore assumenda placeat fuga,
                        quas accusantium molestias.
                    </p>
                </NewQuotePopup>
            </div>
            <div className="new__flex">
                <span className="new__bulletText">
                    • View our Customers here:{" "}
                </span>
                <Link to={"/Customers"} style={{ textDecoration: "none" }}>
                    <span className="new__bulletLink">Customers</span>
                </Link>
            </div>
            <h2>Current Quotes:</h2>
            {quotes.map((quote, id) => (
                <div className="new__quoteContainer">
                    <div className="new__quote">
                        <div className="new__quoteCustomerInfo">
                            <p className="new__quoteId">{id}: </p>
                            <p className="new__quoteCustomer">{quote.customer}</p>
                        </div>
                        <p className="new__quoteAmount">${calculateQuoteAmount({id})}</p>
                        <button className="new__quoteButton">Edit Quote</button>
                    </div>
                </div>
            ))}
            <h3>1 quote found</h3>
        </div>
    ) : (
        // user is not logged in
        <div className="new">
            <h1>Please login to access this page.</h1>
        </div>
    );
}

export default NewQuote;
