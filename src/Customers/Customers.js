import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Customers.css";
import axios from "axios";

function Customers() {
    const [customers, setCustomers] = useState([]);
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
        <div className="customers">
            <table className="customers__table">
                <thead>
                    <tr>
                        <th className="customers__th">ID</th>
                        <th className="customers__th">Name</th>
                        <th className="customers__th">City</th>
                        <th className="customers__th">Street</th>
                        <th className="customers__th">Contact</th>
                        <th className="customers__th">Update</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr>
                            <td className="customers__td">{customer.id}</td>
                            <td className="customers__td">{customer.name}</td>
                            <td className="customers__td">{customer.city}</td>
                            <td className="customers__td">{customer.street}</td>
                            <td className="customers__td">
                                {customer.contact}
                            </td>
                            <td className="customers__td">
                                <Link
                                    to={{
                                        pathname: "/Quotes",
                                        state: {
                                            id: "customer.id",
                                            name: "customer.name",
                                            city: "customer.city",
                                            street: "customer.street",
                                            contact: "customer.contact",
                                        },
                                    }}
                                >
                                    <button class="button-49">Edit</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default Customers;
