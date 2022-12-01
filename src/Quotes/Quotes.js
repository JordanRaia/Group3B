import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import InvalidPermissions from "../InvalidPermissions/InvalidPermissions";
import NoLogin from "../NoLogin/NoLogin";
// firebase
import { auth, db } from "../firebase";
import {
    equalTo,
    onValue,
    orderByChild,
    query,
    ref as dbRef,
} from "firebase/database";
import TextField from "@mui/material/TextField";
import "./Quotes.css";
import Quote from "./Quote";
import { Link } from "react-router-dom";
import { FormControl, MenuItem, Select } from "@mui/material";
// date
import "rsuite/dist/rsuite.min.css";
import { DateRangePicker } from "rsuite";

// page for Administrator to view quotes in all stages: New quote, finalized quote, sanctioned quotes
function Quotes() {
    const [customers, setCustomers] = useState([]);
    const [associates, setAssociates] = useState([]);
    const [user, setUser] = useState({});
    const [rank, setRank] = useState("none");
    const [quotes, setQuotes] = useState([]);
    const [allQuotes, setAllQuotes] = useState([]);
    const [quoteGroupSelect, setQuoteGroupSelect] = useState("All");
    const [customerSelect, setCustomerSelect] = useState("All");
    const [associateSelect, setAssociateSelect] = useState("All");
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState(null);

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
                const quotesRef = dbRef(db, `quotes/`);

                onValue(quotesRef, (snapshot) => {
                    const data = snapshot.val();
                    setQuotes(data);

                    const associateRef = query(dbRef(db, `users`));
                    let tempArr = [];
                    onValue(associateRef, (snapshot) => {
                        const assoData = snapshot.val();
                        setAssociates(assoData);

                        // get all info about each quote on a single level
                        Object.keys(data).forEach((group) => {
                            Object.keys(data[group]).forEach((quote) => {
                                const date = data[group][quote]["date"];
                                const status = group;
                                const employee = data[group][quote]["employee"];
                                const customer = data[group][quote]["customer"];
                                const quoteId = quote;
                                const search =
                                    status +
                                    " " +
                                    assoData[employee]["fullname"] +
                                    " " +
                                    customer;

                                tempArr.push({
                                    date: date,
                                    status: status,
                                    employee: employee,
                                    customer: customer,
                                    quote: quoteId,
                                    search: search,
                                });
                            });
                        });
                    });

                    // sort by date
                    tempArr.sort(function (a, b) {
                        return new Date(b.date) - new Date(a.date);
                    });

                    setAllQuotes(tempArr);
                });

                // get the user's rank
                const rankRef = dbRef(db, `users/${currentUser.uid}/rank`);
                onValue(rankRef, (snapshot) => {
                    //set data to name
                    const data = snapshot.val();
                    //save name to useState name
                    setRank(data);
                });
            } else {
                setRank("");
            }
        });
    }

    const inSearch = (quote) => {
        // check status
        // check if "All" is selected
        if (quoteGroupSelect !== "All") {
            // check if status doesn't match
            if (quote.status !== quoteGroupSelect) {
                return false;
            }
        }

        // check associate
        if (associateSelect !== "All") {
            //check if associate doesn't match
            if (quote.employee !== associateSelect) {
                return false;
            }
        }

        // check customer
        if (customerSelect !== "All") {
            // check if customer doesn't match
            if (quote.customer !== customerSelect) {
                return false;
            }
        }

        // check search
        if (!quote.search.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }

        // check date
        if (dateRange !== null) {
            const date = new Date(quote.date);
            const start = new Date(dateRange[0]);
            const end = new Date(dateRange[1]);
            if (!(date > start && date < end)) {
                return false;
            }
        }

        return true;
    };

    // get number of quotes found after filters
    const getQuoteLength = () => {
        let length = 0;
        allQuotes.forEach((quote) => {
            if (inSearch(quote)) {
                length++;
            }
        });

        return length;
    };

    return user ? (
        rank === "admin" || rank === "dev" ? (
            <div className="quotes">
                <div className="new__flex">
                    <span className="new__bulletText">
                        • View our Customers here:{" "}
                    </span>
                    <Link to={"/Customers"} style={{ textDecoration: "none" }}>
                        <span className="new__bulletLink">Customers</span>
                    </Link>
                </div>
                <h2>Quotes:</h2>
                <div className="quotes__form">
                    <TextField
                        className="quotes__search"
                        label="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="quotes__flex">
                        <p className="quotes__sortText">date: </p>
                        <DateRangePicker
                            onChange={(range) => setDateRange(range)}
                        />
                        <p className="quotes__sortText">status: </p>
                        <Select
                            value={quoteGroupSelect}
                            onChange={(e) =>
                                setQuoteGroupSelect(e.target.value)
                            }
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="current quotes">Current</MenuItem>
                            <MenuItem value="finalized quotes">
                                Finalized
                            </MenuItem>
                            <MenuItem value="sanctioned quotes">
                                Sanctioned
                            </MenuItem>
                            <MenuItem value="completed quotes">
                                Complete
                            </MenuItem>
                        </Select>
                        <p className="quotes__sortText">Associate: </p>
                        <Select
                            value={associateSelect}
                            onChange={(e) => setAssociateSelect(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            {Object.keys(associates).map((associate) => {
                                return (
                                    <MenuItem key={associate} value={associate}>
                                        {associates[associate]["fullname"]}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                        <p className="quotes__sortText">Customer: </p>
                        <Select
                            value={customerSelect}
                            onChange={(e) => setCustomerSelect(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            {Object.keys(customers).map((customer) => {
                                return (
                                    <MenuItem key={customer} value={customer}>
                                        {customer}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </div>
                </div>
                {allQuotes.map((quote, i) => {
                    return (
                        inSearch(quote) && (
                            <Quote
                                quotes={quotes[quote.status]}
                                customers={customers}
                                quote={quote.quote}
                                i={i}
                                associates={associates}
                                status={quote.status.replace(" quotes", "")}
                            />
                        )
                    );
                })}
                <h3>
                    {getQuoteLength()} quote
                    {getQuoteLength() > 1 && "s"} found
                </h3>
            </div>
        ) : (
            <InvalidPermissions />
        )
    ) : (
        <NoLogin />
    );
}

export default Quotes;
