import React, {useEffect, useState} from "react";
import "./FinalizeQuote.css";
import { Link } from "react-router-dom";
import axios from "axios";
import CurrencyFormat from "react-currency-format";
// material ui
import DeleteIcon from "@mui/icons-material/Delete";
import Popup from "reactjs-popup";
// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
    onValue,
    ref as dbRef,
    child,
    push,
    update,
    set,
} from "firebase/database";
// for sales employees to create new quotes and send to finalize quote
function FinalizeQuote() {

    const [customers, setCustomers] = useState([]);
    const [user, setUser] = useState({});
    const [quotes, setQuotes] = useState([]);

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

    /********************************************************************************
     *                                                                              *
     *                           Customer data processing                           *
     *                                                                              * 
     ********************************************************************************/
    //calculate the cost of the quote with discounts
    function calculateQuoteAmount(index) {
        let amount = 0; //total cost
        //get cost of each item and add to amount
        if (typeof quotes[index.quote]["line items"] != "undefined") {
            for (var item in quotes[index.quote]["line items"]) {
                //add the cost of item to amount
                amount += parseCurrency(
                    quotes[index.quote]["line items"][item]["amount"]
                );
            }
        }

        //get flat discounts and remove from total amount
        if (typeof quotes[index.quote]["discount"] != "undefined") {
            for (var flatDiscount in quotes[index.quote]["discount"][
                "amount"
            ]) {
                //subtract flat discount from amount
                amount -= parseCurrency(
                    quotes[index.quote]["discount"]["amount"][flatDiscount]
                );

                if (amount < 0) {
                    amount = 0;
                }
            }
        }

        //get precent discounts and remove from amount
        if (typeof quotes[index.quote]["discount"] != "undefined") {
            for (var percentDiscount in quotes[index.quote]["discount"][
                "percent"
            ]) {
                //get the value to multiply by to get new total amount
                let decimalPercent =
                    1 -
                    quotes[index.quote]["discount"]["percent"][
                        percentDiscount
                    ] /
                        100;
                amount *= decimalPercent;

                if (amount < 0) {
                    amount = 0;
                }
            }
        }

        //round to 2 decimal places
        amount = parseInt(amount).toFixed(2);

        return amount;
    }

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
        let sum = calculateSum(tempArr);

        applyDiscounts(flatDiscount, percentDiscount, sum);
    };

    function calculateSum(arr) {
        // calculate sum
        const sum = arr.reduce((accumulator, value) => {
            return parseFloat(accumulator) + parseCurrency(value);
        }, 0);

        let sumArr = [];
        sumArr.push(sum);
        // set amount
        setAmount(sumArr);

        return sum;
    }

    function parseCurrency(value) {
        if (value) {
            let str = value.split("$").join(""); // remove $
            str = str.split(",").join(""); // remove ,
            let float = parseFloat(str); // create float
            return float; // return the float
        }
    }

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
        calculateSum(arr2);
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
        applyDiscounts(tempArr, percentDiscount, amount[0]);
    };

    const applyDiscounts = (flat, percent, initialAmount) => {
        let amountArr = [];
        amountArr.push(initialAmount);
        for (var i in flat) {
            amountArr.push(amountArr[i] - parseCurrency(flat[i]));
        }

        if (i === undefined) {
            i = 0;
        } else {
            i++;
        }

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
        applyDiscounts(flatDiscount, tempArr, amount[0]);
    };

    const handleDeleteFlatDiscount = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...flatDiscount];
        tempArr.splice(index, 1);

        setFlatDiscount(tempArr);

        // re-apply new discounts
        applyDiscounts(tempArr, percentDiscount, amount[0]);
    };

    const handleDeletePercentDiscount = (index) => (e) => {
        e.preventDefault();

        let tempArr = [...percentDiscount];
        tempArr.splice(index, 1);

        setPercentDiscount(tempArr);

        // re-apply new discounts
        applyDiscounts(flatDiscount, tempArr, amount[0]);
    };

    return user ? (
        // user is logged in
        <div className="new">   
            <div className="new__flex">               
                <span className="new__bulletText">
                    • View our Customers here:{" "}
                </span>
                <Link to={"/Customers"} style={{ textDecoration: "none" }}>
                    <span className="new__bulletLink">Customers</span>
                </Link>
            </div>
            <h2>Current Quotes:</h2>
            {Object.keys(quotes).map((quote, i) => {
                return (
                    <div key={i} className="new__quoteContainer">
                        <div className="new__quote">
                            <div className="new__quoteCustomerInfo">
                                <p className="new__quoteId">{quote}: </p>
                                <p className="new__quoteCustomer">
                                    {quotes[quote]["customer"]}
                                </p>
                            </div>
                            <p className="new__quoteAmount">
                                ${calculateQuoteAmount({ quote })}
                            </p>
                            <Popup
                                trigger={
                                    <button className="new__quoteButton">
                                        Edit Quote
                                    </button>
                                }
                            >
                                {(close) => (
                                    <div className="popup">
                                        <div className="popup__inner">
                                            <button
                                                onClick={close}
                                                className="popup__closeBtn"
                                            >
                                                close
                                            </button>
                                            <div className="new__popup">
                                                <h3>Edit quote: {quote}</h3>
                                                <h3>
                                                    {quotes[quote]["customer"]}
                                                </h3>
                                                <div className="new__customerInfo">
                                                    <span className="new__text">
                                                        {quotes &&
                                                            quotes[quote] &&
                                                            quotes[quote][
                                                                "customer id"
                                                            ] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ]["street"] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ]["street"]}
                                                    </span>
                                                    <span className="new__text">
                                                        {quotes &&
                                                            quotes[quote] &&
                                                            quotes[quote][
                                                                "customer id"
                                                            ] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ]["city"] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ]["city"]}
                                                    </span>
                                                    <span className="new__text">
                                                        {quotes &&
                                                            quotes[quote] &&
                                                            quotes[quote][
                                                                "customer id"
                                                            ] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ]["contact"] &&
                                                            customers[
                                                                quotes[quote][
                                                                    "customer id"
                                                                ]
                                                            ]["contact"]}
                                                    </span>
                                                </div>
                                                <form>
                                                    <div className="new__flex">
                                                        <label htmlFor="email">
                                                            Email:{" "}
                                                        </label>
                                                        <input
                                                            onChange={(e) =>
                                                                setEmail(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            value={email}
                                                            type="text"
                                                            id="email"
                                                            name="email"
                                                        />
                                                    </div>
                                                    <div className="new__flex">
                                                        <h4>Line Items: </h4>
                                                        <button
                                                            onClick={
                                                                handleLineButton
                                                            }
                                                        >
                                                            New Item
                                                        </button>
                                                    </div>
                                                    {lineItems.map(
                                                        (item, i) => (
                                                            <div>
                                                                <label
                                                                    htmlFor={`item`}
                                                                >
                                                                    item:{" "}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        lineItems[
                                                                            i
                                                                        ]
                                                                    }
                                                                    onChange={handleFieldChangeLineItem(
                                                                        i
                                                                    )}
                                                                ></input>
                                                                <label
                                                                    htmlFor={`amount`}
                                                                >
                                                                    {" "}
                                                                    amount:{" "}
                                                                </label>
                                                                <CurrencyFormat
                                                                    onChange={handleFieldChangeLineAmount(
                                                                        i
                                                                    )}
                                                                    value={
                                                                        lineItemAmount[
                                                                            i
                                                                        ]
                                                                    }
                                                                    allowNegative={
                                                                        false
                                                                    }
                                                                    thousandSeparator={
                                                                        true
                                                                    }
                                                                    decimalScale={
                                                                        2
                                                                    }
                                                                    fixedDecimalScale={
                                                                        true
                                                                    }
                                                                    prefix="$"
                                                                />
                                                                <button
                                                                    className="new__delete"
                                                                    onClick={handleDeleteLineItem(
                                                                        i
                                                                    )}
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="new__flex">
                                                        <h4>Secret Notes: </h4>
                                                        <button
                                                            onClick={
                                                                handleSecretButton
                                                            }
                                                        >
                                                            New Note
                                                        </button>
                                                    </div>
                                                    {secretNotes.map(
                                                        (note, i) => (
                                                            <div>
                                                                <label
                                                                    htmlFor={`note`}
                                                                >
                                                                    note:{" "}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        secretNotes[
                                                                            i
                                                                        ]
                                                                    }
                                                                    onChange={handleFieldChangeSecretNote(
                                                                        i
                                                                    )}
                                                                ></input>
                                                                <button
                                                                    className="new__delete"
                                                                    onClick={handleDeleteSecretNote(
                                                                        i
                                                                    )}
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="new__flex">
                                                        <h4>
                                                            Flat Discounts:{" "}
                                                        </h4>
                                                        <button
                                                            onClick={
                                                                handleFlatDiscountButton
                                                            }
                                                        >
                                                            New Discount
                                                        </button>
                                                    </div>
                                                    {flatDiscount.map(
                                                        (discount, i) => (
                                                            <div key={i}>
                                                                <label
                                                                    htmlFor={`item`}
                                                                >
                                                                    discount:{" "}
                                                                </label>
                                                                <CurrencyFormat
                                                                    onChange={handleFieldChangeFlatDiscount(
                                                                        i
                                                                    )}
                                                                    value={
                                                                        flatDiscount[
                                                                            i
                                                                        ]
                                                                    }
                                                                    allowNegative={
                                                                        false
                                                                    }
                                                                    thousandSeparator={
                                                                        true
                                                                    }
                                                                    decimalScale={
                                                                        2
                                                                    }
                                                                    fixedDecimalScale={
                                                                        true
                                                                    }
                                                                    max={
                                                                        amount[
                                                                            amount.length -
                                                                                1
                                                                        ]
                                                                    }
                                                                    prefix="$"
                                                                />
                                                                <button
                                                                    className="new__delete"
                                                                    onClick={handleDeleteFlatDiscount(
                                                                        i
                                                                    )}
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="new__flex">
                                                        <h4>
                                                            Percent Discounts:{" "}
                                                        </h4>
                                                        <button
                                                            onClick={
                                                                handlePercentDiscountButton
                                                            }
                                                        >
                                                            New Discount
                                                        </button>
                                                    </div>
                                                    {percentDiscount.map(
                                                        (discount, i) => (
                                                            <div key={i}>
                                                                <label
                                                                    htmlFor={`item`}
                                                                >
                                                                    discount:{" "}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    placeholder={`0%-100%`}
                                                                    value={
                                                                        percentDiscount[
                                                                            i
                                                                        ]
                                                                    }
                                                                    onChange={handleFieldChangePercentDiscount(
                                                                        i
                                                                    )}
                                                                ></input>
                                                                <button
                                                                    className="new__delete"
                                                                    onClick={handleDeletePercentDiscount(
                                                                        i
                                                                    )}
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="new__flex">
                                                        <p>Amount: </p>
                                                        <div className="new__discountFlex">
                                                            {amount.map(
                                                                (amt) => (
                                                                    <p className="new__discount">
                                                                        <CurrencyFormat
                                                                            displayType="text"
                                                                            value={
                                                                                amt
                                                                            }
                                                                            decimalScale={
                                                                                2
                                                                            }
                                                                            fixedDecimalScale={
                                                                                true
                                                                            }
                                                                            prefix="$"
                                                                        />
                                                                    </p>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        </div>
                    </div>
                );
            })}
            <h3>
                {Object.keys(quotes).length} quote
                {Object.keys(quotes).length !== 1 && "s"} found
            </h3>
        </div>
    ) : (
        // user is not logged in
        <div className="new">
            <h1>Please login to access this page.</h1>
        </div>
    );
}

export default FinalizeQuote;
