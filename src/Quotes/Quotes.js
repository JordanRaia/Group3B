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
    const [currentQuotes, setCurrentQuotes] = useState([]);
    const [finalizedQuotes, setFinalizedQuotes] = useState([]);
    const [sanctionedQuotes, setSanctionedQuotes] = useState([]);
    const [completedQuotes, setCompletedQuotes] = useState([]);

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
                const currentQuotesRef = dbRef(db, `quotes/current quotes/`);
                const finalizedQuotesRef = dbRef(
                    db,
                    `quotes/finalized quotes/`
                );
                const sanctionedQuotesRef = dbRef(
                    db,
                    `quotes/sanctioned quotes/`
                );
                const completedQuotesRef = dbRef(
                    db,
                    `quotes/completed quotes/`
                );

                onValue(currentQuotesRef, (snapshot) => {
                    const data = snapshot.val();
                    setCurrentQuotes(data);
                });
                onValue(finalizedQuotesRef, (snapshot) => {
                    const data = snapshot.val();
                    setFinalizedQuotes(data);
                });
                onValue(sanctionedQuotesRef, (snapshot) => {
                    const data = snapshot.val();
                    setSanctionedQuotes(data);
                });
                onValue(completedQuotesRef, (snapshot) => {
                    const data = snapshot.val();
                    setCompletedQuotes(data);
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
                <Quote quotes={currentQuotes} customers={customers} />
                <Quote quotes={finalizedQuotes} customers={customers} />
                <Quote quotes={sanctionedQuotes} customers={customers} />
                <Quote quotes={completedQuotes} customers={customers} />
                <h3>
                    {Object.keys(currentQuotes).length +
                        Object.keys(finalizedQuotes).length +
                        Object.keys(sanctionedQuotes).length +
                        Object.keys(completedQuotes).length}{" "}
                    quote
                    {Object.keys(currentQuotes).length +
                        Object.keys(finalizedQuotes).length +
                        Object.keys(sanctionedQuotes).length +
                        Object.keys(completedQuotes).length !==
                        1 && "s"}{" "}
                    found
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
