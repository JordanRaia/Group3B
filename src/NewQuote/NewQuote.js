import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewQuotePopup from "./NewQuotePopup";
import InvalidPermissions from "../InvalidPermissions/InvalidPermissions";
import NoLogin from "../NoLogin/NoLogin";
import Popup from "reactjs-popup";
import "./NewQuote.css";
import "./NewQuotePopup.css";
import axios from "axios";
import CurrencyFormat from "react-currency-format";
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
    remove,
} from "firebase/database";
// material ui
import DeleteIcon from "@mui/icons-material/Delete";

// for sales employees to create new quotes and send to finalize quote
function NewQuote() {
    const [customers, setCustomers] = useState([]);
    const [popup, setPopup] = useState(false);
    const [user, setUser] = useState({});
    const [rank, setRank] = useState("none");
    const [quotes, setQuotes] = useState([]);
    const [customerId, setCustomerId] = useState(-1); // selected customer in dropdown
    // for creating new quote in database
    const [amount, setAmount] = useState(["0"]);
    const [flatDiscount, setFlatDiscount] = useState([]);
    const [percentDiscount, setPercentDiscount] = useState([]);
    const [email, setEmail] = useState("");
    const [lineItems, setLineItems] = useState([]);
    const [lineItemAmount, setLineItemAmount] = useState([]);
    const [secretNotes, setSecretNotes] = useState([]);
    // for editing quotes
    const [editPopup, setEditPopup] = useState([]);

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

    const handleEditButton = (quote, i) => (e) => {
        e.preventDefault();

        let tempArr = Array(Object.keys(quotes).length).fill(false); //fill temp Arr with false for every quote
        tempArr[i] = true;
        setEditPopup(tempArr);

        //email
        setEmail(quotes[quote]["email"]);

        //line items
        setLineItems(Object.keys(quotes[quote]["line items"]));

        //get all line item amounts
        tempArr = [];
        Object.keys(quotes[quote]["line items"]).forEach((element, i) => {
            tempArr.push(quotes[quote]["line items"][element]["amount"]);
        });
        setLineItemAmount(tempArr);

        //secret notes
        if (typeof quotes[quote]["secret notes"] != "undefined") {
            setSecretNotes(quotes[quote]["secret notes"]);
        }

        var flat;
        var percent;

        //flat discount
        if (typeof quotes[quote]["discount"] != "undefined") {
            if (typeof quotes[quote]["discount"]["amount"] != "undefined") {
                setFlatDiscount(quotes[quote]["discount"]["amount"]);
                flat = quotes[quote]["discount"]["amount"];
            }
        }

        //percent discount
        if (typeof quotes[quote]["discount"] != "undefined") {
            if (typeof quotes[quote]["discount"]["percent"] != "undefined") {
                setPercentDiscount(quotes[quote]["discount"]["percent"]);
                percent = quotes[quote]["discount"]["percent"];
            }
        }
        let sum = calculateSum(tempArr);

        applyDiscounts(flat, percent, sum);
    };

    function closePopup() {
        setPopup(false);
        setEditPopup(new Array(Object.keys(quotes).length).fill(false));
        setAmount(["0"]);
        setFlatDiscount([]);
        setPercentDiscount([]);
        setEmail("");
        setLineItems([]);
        setLineItemAmount([]);
        setSecretNotes([]);
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

                const rankRef = dbRef(db, `users/${currentUser.uid}/rank`);

                onValue(rankRef, (snapshot) => {
                    //set data to name
                    const data = snapshot.val();
                    //save name to useState name
                    setRank(data);
                });
            }
        });
    }

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
        //amount = parseInt(amount).toFixed(2);

        return amount;
    }

    const handleQuoteSubmit = (custId, quoteKey) => async (e) => {
        e.preventDefault(); // prevent page refresh

        if (email === "") {
            alert("must enter email");
        } else if (checkForMissing(lineItems)) {
            alert("must enter line item");
        } else if (checkForMissing(lineItemAmount)) {
            alert("must enter line item amount");
        } else if (checkForMissing(secretNotes, false)) {
            alert("must enter secret note or remove");
        } else if (checkForMissing(flatDiscount, false)) {
            alert("must enter flat discount or remove");
        } else if (checkForMissing(percentDiscount, false)) {
            alert("must enter percent discount or remove");
        } else {
            // submit to database

            const date = new Date();

            // quote entry
            const quoteData = {
                customer: customers[custId]["name"],
                "customer id": custId,
                email: email,
                "secret notes": secretNotes,
                employee: user.uid,
                date: date,
            };

            let newQuoteKey = "";

            // get a key for a new quote
            if (!quoteKey) {
                newQuoteKey = push(child(dbRef(db), "quotes")).key;
            } else {
                newQuoteKey = quoteKey;
            }

            const updates = {};
            updates["/quotes/current quotes/" + newQuoteKey] = quoteData;

            await update(dbRef(db), updates);
            await set(
                dbRef(db, `/quotes/current quotes/${newQuoteKey}/discount`),
                {
                    amount: flatDiscount,
                    percent: percentDiscount,
                }
            );
            for (var i in lineItems) {
                await set(
                    dbRef(
                        db,
                        `/quotes/current quotes/${newQuoteKey}/line items/${lineItems[i]}`
                    ),
                    {
                        amount: lineItemAmount[i],
                    }
                );
            }
            closePopup();

            return newQuoteKey;
        }
    };

    const handleFinalize = (custId, quoteKey) => async (e) => {
        e.preventDefault();

        if (email === "") {
            alert("must enter email");
        } else if (checkForMissing(lineItems)) {
            alert("must enter line item");
        } else if (checkForMissing(lineItemAmount)) {
            alert("must enter line item amount");
        } else if (checkForMissing(secretNotes, false)) {
            alert("must enter secret note or remove");
        } else if (checkForMissing(flatDiscount, false)) {
            alert("must enter flat discount or remove");
        } else if (checkForMissing(percentDiscount, false)) {
            alert("must enter percent discount or remove");
        } else {
            // submit to database

            const date = new Date();

            // quote entry
            const quoteData = {
                customer: customers[custId]["name"],
                "customer id": custId,
                email: email,
                "secret notes": secretNotes,
                employee: user.uid,
                date: date,
            };

            let newQuoteKey = "";

            if (!quoteKey) {
                newQuoteKey = push(child(dbRef(db), "quotes")).key;
            } else {
                newQuoteKey = quoteKey;
                // remove quote from current quotes
                await remove(dbRef(db, `/quotes/current quotes/${quoteKey}`));
            }
            // get a key for a new quote

            const updates = {};
            updates["/quotes/finalized quotes/" + newQuoteKey] = quoteData;

            await update(dbRef(db), updates);
            await set(
                dbRef(db, `/quotes/finalized quotes/${newQuoteKey}/discount`),
                {
                    amount: flatDiscount,
                    percent: percentDiscount,
                }
            );
            for (var i in lineItems) {
                await set(
                    dbRef(
                        db,
                        `/quotes/finalized quotes/${newQuoteKey}/line items/${lineItems[i]}`
                    ),
                    {
                        amount: lineItemAmount[i],
                    }
                );
            }
            closePopup();
        }
    };

    function checkForMissing(arr, checkExistFlag = true) {
        if (arr === []) {
            if (checkExistFlag) {
                return true;
            }
        } else {
            for (var i in arr) {
                if (arr[i] === "") {
                    return true;
                }
            }
        }

        return false;
    }

    // called after selecting a customer from dropdown
    const handleCustomerSelect = (e) => {
        e.preventDefault();

        setCustomerId(e.target.value);
    };

    // called after clicking New Quote button
    const handleQuoteButton = (e) => {
        e.preventDefault();
        if (parseInt(customerId) !== -1) {
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
        rank === "sales" || rank === "dev" ? (
            // user is ranked "sales"
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
                        <option className="new__textSubHeader" value="-1">
                            Please Select
                        </option>
                        {customers.map((customer, id) => (
                            <option
                                key={id}
                                className="new__textSubHeader"
                                value={id}
                            >
                                {customer.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleQuoteButton} className="button-49">
                        New Quote
                    </button>
                    {/* Popup Window */}
                    <NewQuotePopup trigger={popup} setTrigger={closePopup}>
                        <div className="new__popup">
                            <h3>
                                Quote for:{" "}
                                {customers &&
                                    customers[customerId] &&
                                    customers[customerId]["name"] &&
                                    customers[customerId]["name"]}
                            </h3>
                            <div className="new__customerInfo">
                                <span className="new__text">
                                    {customers &&
                                        customers[customerId] &&
                                        customers[customerId]["street"] &&
                                        customers[customerId]["street"]}
                                </span>
                                <span className="new__text">
                                    {customers &&
                                        customers[customerId] &&
                                        customers[customerId]["city"] &&
                                        customers[customerId]["city"]}
                                </span>
                                <span className="new__text">
                                    {customers &&
                                        customers[customerId] &&
                                        customers[customerId]["contact"] &&
                                        customers[customerId]["contact"]}
                                </span>
                            </div>
                            <form>
                                <div className="new__flex">
                                    <label htmlFor="email">Email: </label>
                                    <input
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
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
                                            onChange={handleFieldChangeLineItem(
                                                i
                                            )}
                                        ></input>
                                        <label htmlFor={`amount`}>
                                            {" "}
                                            amount:{" "}
                                        </label>
                                        <CurrencyFormat
                                            onChange={handleFieldChangeLineAmount(
                                                i
                                            )}
                                            value={lineItemAmount[i]}
                                            allowNegative={false}
                                            thousandSeparator={true}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            prefix="$"
                                        />
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
                                {flatDiscount &&
                                    flatDiscount.map((discount, i) => (
                                        <div key={i}>
                                            <label htmlFor={`item`}>
                                                discount:{" "}
                                            </label>
                                            <CurrencyFormat
                                                onChange={handleFieldChangeFlatDiscount(
                                                    i
                                                )}
                                                value={flatDiscount[i]}
                                                allowNegative={false}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                max={amount[amount.length - 1]}
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
                                    ))}
                                <div className="new__flex">
                                    <h4>Percent Discounts: </h4>
                                    <button
                                        onClick={handlePercentDiscountButton}
                                    >
                                        New Discount
                                    </button>
                                </div>
                                {percentDiscount &&
                                    percentDiscount.map((discount, i) => (
                                        <div key={i}>
                                            <label htmlFor={`item`}>
                                                discount:{" "}
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder={`0%-100%`}
                                                value={percentDiscount[i]}
                                                onChange={handleFieldChangePercentDiscount(
                                                    i
                                                )}
                                            />
                                            <button
                                                className="new__delete"
                                                onClick={handleDeletePercentDiscount(
                                                    i
                                                )}
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    ))}
                                <div className="new__flex">
                                    <p>Amount: </p>
                                    <div className="new__discountFlex">
                                        {amount.map((amt) => {
                                            return (
                                                !isNaN(amt) && (
                                                    <p
                                                        key={amt}
                                                        className="new__discount"
                                                    >
                                                        <CurrencyFormat
                                                            displayType="text"
                                                            value={amt}
                                                            decimalScale={2}
                                                            fixedDecimalScale={
                                                                true
                                                            }
                                                            prefix="$"
                                                        />
                                                    </p>
                                                )
                                            );
                                        })}
                                    </div>
                                </div>
                                <label htmlFor="save">Save for Later: </label>
                                <input
                                    onClick={handleQuoteSubmit(customerId)}
                                    type="submit"
                                    value="Save"
                                />
                                <label htmlFor="submit">
                                    {" "}
                                    Submit to be finalized:{" "}
                                </label>
                                <button onClick={handleFinalize(customerId)}>
                                    Finalize
                                </button>
                            </form>
                        </div>
                    </NewQuotePopup>
                </div>
                <div className="new__flex">
                    <span className="new__bulletText">
                        ??? View our Customers here:{" "}
                    </span>
                    <Link to={"/Customers"} style={{ textDecoration: "none" }}>
                        <span className="new__bulletLink">Customers</span>
                    </Link>
                </div>
                <h2 className="new__title">Current Quotes:</h2>
                <div className="new__divider" />
                <div className="new__quotesContainer">
                    {Object.keys(quotes).map((quote, i) => {
                        return (
                            <div key={i} className="new__quoteContainer">
                                <div className="new__quote">
                                    <div className="new__quoteCustomerInfo">
                                        <p className="new__quoteId">{quote} </p>
                                        <p className="new__quoteCustomer">
                                            {quotes[quote]["customer"]}
                                        </p>
                                    </div>
                                    <p className="new__quoteAmount">
                                        $
                                        {calculateQuoteAmount({ quote })
                                            .toLocaleString("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            })
                                            .slice(1)}
                                    </p>
                                    <button
                                        onClick={handleEditButton(quote, i)}
                                        className="new__editButton"
                                    >
                                        Edit
                                    </button>
                                    <Popup open={editPopup[i]}>
                                        {(close) => {
                                            return (
                                                <div className="popup">
                                                    <div className="popup__inner">
                                                        <button
                                                            onClick={() => {
                                                                close();
                                                                closePopup();
                                                            }}
                                                            className="popup__closeBtn"
                                                        ></button>
                                                        <div className="new__popup">
                                                            <h3>
                                                                Edit quote:{" "}
                                                                {quote}
                                                            </h3>
                                                            <h3>
                                                                {
                                                                    quotes[
                                                                        quote
                                                                    ][
                                                                        "customer"
                                                                    ]
                                                                }
                                                            </h3>
                                                            <div className="new__customerInfo">
                                                                <span className="new__text">
                                                                    {quotes &&
                                                                        quotes[
                                                                            quote
                                                                        ] &&
                                                                        quotes[
                                                                            quote
                                                                        ][
                                                                            "customer id"
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ][
                                                                            "street"
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ][
                                                                            "street"
                                                                        ]}
                                                                </span>
                                                                <span className="new__text">
                                                                    {quotes &&
                                                                        quotes[
                                                                            quote
                                                                        ] &&
                                                                        quotes[
                                                                            quote
                                                                        ][
                                                                            "customer id"
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ][
                                                                            "city"
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ][
                                                                            "city"
                                                                        ]}
                                                                </span>
                                                                <span className="new__text">
                                                                    {quotes &&
                                                                        quotes[
                                                                            quote
                                                                        ] &&
                                                                        quotes[
                                                                            quote
                                                                        ][
                                                                            "customer id"
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ][
                                                                            "contact"
                                                                        ] &&
                                                                        customers[
                                                                            quotes[
                                                                                quote
                                                                            ][
                                                                                "customer id"
                                                                            ]
                                                                        ][
                                                                            "contact"
                                                                        ]}
                                                                </span>
                                                            </div>
                                                            <form>
                                                                <div className="new__flex">
                                                                    <label htmlFor="email">
                                                                        Email:{" "}
                                                                    </label>
                                                                    <input
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setEmail(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        value={
                                                                            email
                                                                        }
                                                                        type="text"
                                                                        id="email"
                                                                        name="email"
                                                                    />
                                                                </div>
                                                                <div className="new__flex">
                                                                    <h4>
                                                                        Line
                                                                        Items:{" "}
                                                                    </h4>
                                                                    <button
                                                                        onClick={
                                                                            handleLineButton
                                                                        }
                                                                    >
                                                                        New Item
                                                                    </button>
                                                                </div>
                                                                {lineItems.map(
                                                                    (
                                                                        item,
                                                                        i
                                                                    ) => (
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
                                                                    <h4>
                                                                        Secret
                                                                        Notes:{" "}
                                                                    </h4>
                                                                    <button
                                                                        onClick={
                                                                            handleSecretButton
                                                                        }
                                                                    >
                                                                        New Note
                                                                    </button>
                                                                </div>
                                                                {secretNotes.map(
                                                                    (
                                                                        note,
                                                                        i
                                                                    ) => (
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
                                                                        Flat
                                                                        Discounts:{" "}
                                                                    </h4>
                                                                    <button
                                                                        onClick={
                                                                            handleFlatDiscountButton
                                                                        }
                                                                    >
                                                                        New
                                                                        Discount
                                                                    </button>
                                                                </div>
                                                                {flatDiscount.map(
                                                                    (
                                                                        discount,
                                                                        i
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
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
                                                                        Percent
                                                                        Discounts:{" "}
                                                                    </h4>
                                                                    <button
                                                                        onClick={
                                                                            handlePercentDiscountButton
                                                                        }
                                                                    >
                                                                        New
                                                                        Discount
                                                                    </button>
                                                                </div>
                                                                {percentDiscount.map(
                                                                    (
                                                                        discount,
                                                                        i
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            <label
                                                                                htmlFor={`item`}
                                                                            >
                                                                                discount:{" "}
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min={
                                                                                    0
                                                                                }
                                                                                max={
                                                                                    100
                                                                                }
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
                                                                    <p>
                                                                        Amount:{" "}
                                                                    </p>
                                                                    <div className="new__discountFlex">
                                                                        {amount.map(
                                                                            (
                                                                                amt
                                                                            ) => (
                                                                                <p
                                                                                    key={
                                                                                        amt
                                                                                    }
                                                                                    className="new__discount"
                                                                                >
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
                                                                <button
                                                                    onClick={handleQuoteSubmit(
                                                                        quotes[
                                                                            quote
                                                                        ][
                                                                            "customer id"
                                                                        ],
                                                                        quote
                                                                    )}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={handleFinalize(
                                                                        quotes[
                                                                            quote
                                                                        ][
                                                                            "customer id"
                                                                        ],
                                                                        quote
                                                                    )}
                                                                >
                                                                    Finalize
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </Popup>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="new__divider" />
                <h3 className="new__quotesFound">
                    {Object.keys(quotes).length} quote
                    {Object.keys(quotes).length !== 1 && "s"} found
                </h3>
            </div>
        ) : (
            // invalid permissions
            <InvalidPermissions />
        )
    ) : (
        // user is not logged in
        <NoLogin />
    );
}

export default NewQuote;
