import React, { useState } from "react";
import "./NewQuote.css";
import axios from "axios";

function NewQuote()  {
    //return <div className="new">NewQuote</div>;
    const [customers, setCustomers] = useState([]);
    useEffect(() => {
        getCustomers();
    },[]);
    function getCustomers(){
        axios.get('https://students.cs.niu.edu/~z1860207/legacy.php').then(function(response){
            console.log(response.data);
            setCustomers(resonse.data);
        });
    }

    return <div classname= "app-container">
        <table> 
            <thead> 
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Street</th>
                    <th>Contact</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((customer, key) =>
                            <tr key={key}>
                                <td>{customer.id}</td>
                                <td>{customer.name}</td>
                                <td>{customer.city}</td>
                                <td>{customer.street}</td>
                                <td>{customer.contact}</td>
                                <td>
                                    <Link to={`customer/${customer.id}/edit`} style={{marginRight: "10px"}}>Edit</Link>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        )}

            </tbody>
        </table>
    </div>;
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
