import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewQuotePopup from "./NewQuotePopup";
import "./NewQuote.css";
import axios from "axios";

function NewQuote() {
    const [customers, setCustomers] = useState([]);
    const [popup, setPopup] = useState(false);
    useEffect(() => {
        getCustomers();
    }, []);
    function getCustomers() {
        axios
            .get("https://students.cs.niu.edu/~z1860207/legacy.php")
            .then(function (response) {
                console.log(response.data);
                setCustomers(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
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
        </div>
    );
}

export default NewQuote;
