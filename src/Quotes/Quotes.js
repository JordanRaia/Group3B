import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import InvalidPermissions from "../InvalidPermissions/InvalidPermissions";
import NoLogin from "../NoLogin/NoLogin";
// firebase
import { auth, db } from "../firebase";
import { onValue, ref as dbRef } from "firebase/database";

import "./Quotes.css";
import Quote from "./Quote";
import { Link } from "react-router-dom";

// page for Administrator to view quotes in all stages: New quote, finalized quote, sanctioned quotes
function Quotes() {
    const [customers, setCustomers] = useState([]);
    const [user, setUser] = useState({});
    const [rank, setRank] = useState("none");
    const [quotes, setQuotes] = useState([]);

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
                });

                // get the user's rank
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

    console.log(quotes);

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
                {Object.keys(quotes).map((quoteGroup, i) => {
                    return (
                        <Quote
                            quotes={quotes[quoteGroup]}
                            customers={customers}
                        />
                    );
                })}
                <h3>
                    {"2f2"} quote
                    {true && "s"} found
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
