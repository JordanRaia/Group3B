import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import "./NewQuote.css";
import axios from "axios";

function NewQuote()  {
    const [customers, setCustomers] = useState([]);
    useEffect(() => {
        getCustomers();
    }, []);
    function getCustomers() {
        axios.get('https://students.cs.niu.edu/~z1860207/legacy.php')
        .then(function(response) {
            console.log(response.data);
            setCustomers(response.data);
        }).catch((error) => {console.error(error)});
    }

    //var id, name, city, street, contact;

    return ( <div classname= "app-container">
        <table> 
            <thead> 
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Street</th>
                    <th>Contact</th>
                    <th>Update</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((customer) => (
                            <tr>
                                <td>{customer.id}</td>
                                <td>{customer.name}</td>
                                <td>{customer.city}</td>
                                <td>{customer.street}</td>
                                <td>{customer.contact}</td>
                                <td>
                                    <Link to = {{ 
                                        pathname: "/Quotes",
                                        state: {id: "customer.id", name: "customer.name", city: "customer.city", street: "customer.street", contact: "customer.contact"}                                       
                                        }}>
                                            <button class="button-49">Edit</button>
                                        </Link>
                                </td>
                            </tr>
                        ))}
            </tbody>
        </table>
    </div> )
}
/* //PRE- axios table body:
                <tr>
                    <td>12</td>
                    <td>Jay Gordon</td>
                    <td>San Francisco</td>
                    <td>cherry blossom st</td>
                    <td>jgordon12@gmail.com</td>
                </tr>
*/
export default NewQuote;
