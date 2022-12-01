import React, { useState } from "react";
import CurrencyFormat from "react-currency-format";
import Popup from "reactjs-popup";

function Quote({ quotes, customers, quote, i, associates, status }) {
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

    function parseCurrency(value) {
        if (value) {
            let str = value.split("$").join(""); // remove $
            str = str.split(",").join(""); // remove ,
            let float = parseFloat(str); // create float
            return float; // return the float
        }
    }

    function closePopup() {
        setEditPopup(new Array(Object.keys(quotes).length).fill(false));
        setAmount(["0"]);
        setFlatDiscount([]);
        setPercentDiscount([]);
        setEmail("");
        setLineItems([]);
        setLineItemAmount([]);
        setSecretNotes([]);
    }

    const handleViewButton = (quote, i) => (e) => {
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
            if (typeof quotes[quote]["discount"]["percent"] != "undefined") {
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

    const dateFormat = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString();
    };

    return (
        <div>
            <div key={i} className="new__quoteContainer">
                <div className="new__quote">
                    <div className="div_box">
                        <div className="new__quoteCustomerInfo">
                            <div className="quotes__dateStatus">
                                <p className="new__quoteCustomer">
                                    {dateFormat(quotes[quote]["date"])}{" "}
                                </p>
                                <p className="new__quoteCustomer">({status}) </p>
                            </div>
                            <p className="new__quoteCustomer">
                                {
                                    associates[quotes[quote]["employee"]][
                                        "fullname"
                                    ]
                                }{" "}
                                - {quotes[quote]["customer"]}
                            </p>
                        </div>
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
                        onClick={handleViewButton(quote, i)}
                        className="new__quoteButton"
                    >
                        View Quote
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
                                            <h3>Quote: {quote}</h3>
                                            <h3>{quotes[quote]["customer"]}</h3>
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
                                                        value={email}
                                                        type="text"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="new__flex">
                                                    <h4>Line Items: </h4>
                                                </div>
                                                {lineItems.map((item, i) => (
                                                    <div>
                                                        <label htmlFor={`item`}>
                                                            item:{" "}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            disabled
                                                            value={lineItems[i]}
                                                        ></input>
                                                        <label
                                                            htmlFor={`amount`}
                                                        >
                                                            {" "}
                                                            amount:{" "}
                                                        </label>
                                                        <CurrencyFormat
                                                            disabled={true}
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
                                                            decimalScale={2}
                                                            fixedDecimalScale={
                                                                true
                                                            }
                                                            prefix="$"
                                                        />
                                                    </div>
                                                ))}
                                                <div className="new__flex">
                                                    <h4>Secret Notes: </h4>
                                                </div>
                                                {secretNotes.map((note, i) => (
                                                    <div>
                                                        <label htmlFor={`note`}>
                                                            note:{" "}
                                                        </label>
                                                        <input
                                                            disabled
                                                            type="text"
                                                            value={
                                                                secretNotes[i]
                                                            }
                                                        ></input>
                                                    </div>
                                                ))}
                                                <div className="new__flex">
                                                    <h4>Flat Discounts: </h4>
                                                </div>
                                                {flatDiscount &&
                                                    flatDiscount.map(
                                                        (discount, i) => (
                                                            <div key={i}>
                                                                <label
                                                                    htmlFor={`item`}
                                                                >
                                                                    discount:{" "}
                                                                </label>
                                                                <CurrencyFormat
                                                                    disabled
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
                                                            </div>
                                                        )
                                                    )}
                                                <div className="new__flex">
                                                    <h4>Percent Discounts: </h4>
                                                </div>
                                                {percentDiscount &&
                                                    percentDiscount.map(
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
                                                                    disabled
                                                                ></input>
                                                            </div>
                                                        )
                                                    )}
                                                <div className="new__flex">
                                                    <p>Amount: </p>
                                                    <div className="new__discountFlex">
                                                        {amount.map((amt) => (
                                                            <p
                                                                key={amt}
                                                                className="new__discount"
                                                            >
                                                                <CurrencyFormat
                                                                    displayType="text"
                                                                    value={amt}
                                                                    decimalScale={
                                                                        2
                                                                    }
                                                                    fixedDecimalScale={
                                                                        true
                                                                    }
                                                                    prefix="$"
                                                                />
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    </Popup>
                </div>
            </div>
        </div>
    );
}

export default Quote;
