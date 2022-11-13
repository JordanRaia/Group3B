import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewQuotePopup from "./NewQuotePopup";
import "./NewQuote.css";
import axios from "axios";
// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { onValue, ref as dbRef } from "firebase/database";
// material ui
import DeleteIcon from "@mui/icons-material/Delete";

function NewQuote() {
    const [customers, setCustomers] = useState([]);
    const [popup, setPopup] = useState(false);
    const [user, setUser] = useState({});
    const [quotes, setQuotes] = useState([]);
    const [customerId, setCustomerId] = useState(0); // selected customer in dropdown
    // for creating new quote in database
    const [amount, setAmount] = useState(["0"]);
    const [flatDiscount, setFlatDiscount] = useState([]);
    const [percentDiscount, setPercentDiscount] = useState([]);
    const [email, setEmail] = useState("");
    const [lineItems, setLineItems] = useState([]);
    const [lineItemAmount, setLineItemAmount] = useState([]);
    const [secretNotes, setSecretNotes] = useState([]);

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
        for (var flatDiscount in quotes[index.id]["discount"]["amount"]) {
            //subtract flat discount from amount
            amount -= quotes[index.id]["discount"]["amount"][flatDiscount];
        }

        //get precent discounts and remove from amount
        for (var percentDiscount in quotes[index.id]["discount"]["percent"]) {
            //get the value to multiply by to get new total amount
            let decimalPercent =
                1 -
                quotes[index.id]["discount"]["percent"][percentDiscount] / 100;
            amount *= decimalPercent;
        }

        //round to 2 decimal places
        amount = amount.toFixed(2);

        return amount;
    }

    // called after selecting a customer from dropdown
    const handleCustomerSelect = (e) => {
        setCustomerId(e.target.value);
    };

    // called after clicking New Quote button
    const handleQuoteButton = () => {
        if (customerId !== 0) {
            // "Please Select" is not selected
            setPopup(true);
        } else {
            // "Please Select" is selected
            alert("Please Select a Customer");
        }
    };

    // handles new line item button
    const handleLineButton = (e) => {
        e.preventDefault(); // prevent page refresh

        // two temp arrays
        var arr = [...lineItems];
        var arr2 = [...lineItemAmount];

        // push blank values on to both arrays
        arr.push("");
        arr2.push("");

        // set useState arrays
        setLineItems(arr);
        setLineItemAmount(arr2);
    };

    //handles when a field is changed in a useState array
    const handleFieldChangeLineItem = (index) => (e) => {
        e.preventDefault();

        // update value in temp arr
        let tempArr = [...lineItems];
        tempArr[index] = e.target.value;

        // set useState arr
        setLineItems(tempArr);
    };

    const handleFieldChangeLineAmount = (index) => (e) => {
        e.preventDefault();

        // update value in temp arr
        let tempArr = [...lineItemAmount];
        tempArr[index] = e.target.value;

        // set useState arr
        setLineItemAmount(tempArr);

        // calculate sum
        const sum = tempArr.reduce((accumulator, value) => {
            return parseInt(accumulator) + parseInt(value);
        }, 0);

        let sumArr = [];
        sumArr.push(sum);
        // set amount
        setAmount(sumArr);
    };

    // handles new secret notes button
    const handleSecretButton = (e) => {
        e.preventDefault(); // prevent page refresh

        let tempArr = [...secretNotes]; // create temp arr
        tempArr.push(""); // push a blank note onto temp arr
        setSecretNotes(tempArr); // set secret notes to temp arr
    };

    const handleDeleteLineItem = (index) => (e) => {
        e.preventDefault();

        // create temp arrays
        var arr = [...lineItems];
        var arr2 = [...lineItemAmount];

        // remove item at index
        arr.splice(index, 1);
        arr2.splice(index, 1);

        // set useState arr
        setLineItems(arr);
        setLineItemAmount(arr2);

        // calculate sum
        const sum = arr2.reduce((accumulator, value) => {
            return parseInt(accumulator) + parseInt(value);
        }, 0);

        let sumArr = [];
        sumArr.push(sum);
        // set amount
        setAmount(sumArr);
    };

    const handleFieldChangeSecretNote = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...secretNotes];
        tempArr[index] = e.target.value;

        setSecretNotes(tempArr);
    };

    const handleDeleteSecretNote = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...secretNotes];
        tempArr.splice(index, 1);

        setSecretNotes(tempArr);
    };

    const handleFlatDiscountButton = (e) => {
        e.preventDefault();

        let tempArr = [...flatDiscount]; // create temp arr
        tempArr.push(""); // push a blank note onto temp arr
        setFlatDiscount(tempArr); // set flat discount to temp arr
    };

    const handlePercentDiscountButton = (e) => {
        e.preventDefault();

        let tempArr = [...percentDiscount]; // create temp arr
        tempArr.push(""); // push a blank note onto temp arr
        setPercentDiscount(tempArr); // set pecent discount to temp arr
    };

    const handleFieldChangeFlatDiscount = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...flatDiscount];
        tempArr[index] = e.target.value;

        setFlatDiscount(tempArr);

        // add discounted amounts to amounts
        applyDiscounts(tempArr, percentDiscount);
    };

    const applyDiscounts = (flat, percent) => {
        let amountArr = [];
        amountArr.push(amount[0]);
        for (var i in flat) {
            amountArr.push(amountArr[i] - flat[i]);
        }

        i++; // iterate i once

        for (var j in percent) {
            let decimalPercent = 1 - percent[j] / 100;
            // multiply last element in amount by decimal Percent
            amountArr.push(
                (amountArr[parseInt(i) + parseInt(j)] * decimalPercent).toFixed(
                    2
                )
            );
        }

        setAmount(amountArr);
    };

    const handleFieldChangePercentDiscount = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...percentDiscount];
        tempArr[index] = e.target.value;

        setPercentDiscount(tempArr);

        // re-apply new discounts
        applyDiscounts(flatDiscount, tempArr);
    };

    const handleDeleteFlatDiscount = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...flatDiscount];
        tempArr.splice(index, 1);

        setFlatDiscount(tempArr);

        // re-apply new discounts
        applyDiscounts(tempArr, percentDiscount);
    };

    const handleDeletePercentDiscount = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...percentDiscount];
        tempArr.splice(index, 1);

        setPercentDiscount(tempArr);

        // re-apply new discounts
        applyDiscounts(flatDiscount, tempArr);
    };

    return user ? (
        // user is logged in
        <div className="new">
            <h2 className="new__headerText">Create New Quote:</h2>
            <div className="new__customerSelect">
                <h3 className="new__textSubHeader">select customer: </h3>
                <select
                    className="new__dropdown"
                    name="customerSelect"
                    id="customerSelect"
                    value={customerId}
                    onChange={handleCustomerSelect}
                >
                    <option className="new__textSubHeader" value="0">
                        Please Select
                    </option>
                    {customers.map((customer, id) => (
                        <option className="new__textSubHeader" value={id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleQuoteButton} class="button-49">
                    New Quote
                </button>
                {/* Popup Window */}
                <NewQuotePopup trigger={popup} setTrigger={setPopup}>
                    <div className="new__popup">
                        <h3>
                            Quote for:{" "}
                            {customerId !== 0 && customers[customerId]["name"]}
                        </h3>
                        <div className="new__customerInfo">
                            <span className="new__text">
                                {customerId !== 0 &&
                                    customers[customerId]["street"]}
                            </span>
                            <span className="new__text">
                                {customerId !== 0 &&
                                    customers[customerId]["city"]}
                            </span>
                            <span className="new__text">
                                {customerId !== 0 &&
                                    customers[customerId]["contact"]}
                            </span>
                        </div>
                        <form>
                            <div className="new__flex">
                                <label htmlFor="email">Email: </label>
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    type="text"
                                    id="email"
                                    name="email"
                                />
                            </div>
                            <div className="new__flex">
                                <h4>Line Items: </h4>
                                <button onClick={handleLineButton}>
                                    New Item
                                </button>
                            </div>
                            {lineItems.map((item, i) => (
                                <div>
                                    <label htmlFor={`item`}>item: </label>
                                    <input
                                        type="text"
                                        value={lineItems[i]}
                                        onChange={handleFieldChangeLineItem(i)}
                                    ></input>
                                    <label htmlFor={`amount`}> amount: </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={lineItemAmount[i]}
                                        onChange={handleFieldChangeLineAmount(
                                            i
                                        )}
                                    ></input>
                                    <button
                                        className="new__delete"
                                        onClick={handleDeleteLineItem(i)}
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            ))}
                            <div className="new__flex">
                                <h4>Secret Notes: </h4>
                                <button onClick={handleSecretButton}>
                                    New Note
                                </button>
                            </div>
                            {secretNotes.map((note, i) => (
                                <div>
                                    <label htmlFor={`note`}>note: </label>
                                    <input
                                        type="text"
                                        value={secretNotes[i]}
                                        onChange={handleFieldChangeSecretNote(
                                            i
                                        )}
                                    ></input>
                                    <button
                                        className="new__delete"
                                        onClick={handleDeleteSecretNote(i)}
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            ))}
                            <div className="new__flex">
                                <h4>Flat Discounts: </h4>
                                <button onClick={handleFlatDiscountButton}>
                                    New Discount
                                </button>
                            </div>
                            {flatDiscount.map((discount, i) => (
                                <div key={i}>
                                    <label htmlFor={`item`}>discount: </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={amount}
                                        placeholder={`$0-$${amount[0]}`}
                                        value={flatDiscount[i]}
                                        onChange={handleFieldChangeFlatDiscount(
                                            i
                                        )}
                                    ></input>
                                    <button
                                        className="new__delete"
                                        onClick={handleDeleteFlatDiscount(i)}
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            ))}
                            <div className="new__flex">
                                <h4>Percent Discounts: </h4>
                                <button onClick={handlePercentDiscountButton}>
                                    New Discount
                                </button>
                            </div>
                            {percentDiscount.map((discount, i) => (
                                <div key={i}>
                                    <label htmlFor={`item`}>discount: </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder={`0%-100%`}
                                        value={percentDiscount[i]}
                                        onChange={handleFieldChangePercentDiscount(
                                            i
                                        )}
                                    ></input>
                                    <button
                                        className="new__delete"
                                        onClick={handleDeletePercentDiscount(i)}
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            ))}
                            <div className="new__flex">
                                <p>Amount: </p>
                                <div className="new__discountFlex">
                                    {amount.map((amt) => (
                                        <p className="new__discount">${amt}</p>
                                    ))}
                                </div>
                            </div>
                            <input type="submit" />
                        </form>
                    </div>
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
                            <p className="new__quoteCustomer">
                                {quote.customer}
                            </p>
                        </div>
                        <p className="new__quoteAmount">
                            ${calculateQuoteAmount({ id })}
                        </p>
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
