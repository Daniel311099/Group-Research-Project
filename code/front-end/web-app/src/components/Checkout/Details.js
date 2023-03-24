import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";


export default function Details(props) {

    const [success, setSuccess] = useState(false)
    const [address_valid, setAddressValid] = useState({valid: true, message: ''})
    const [card_valid, setCardValid] = useState({valid: true, message: ''})

    const check_details = async () => {
        let details = {
            address: {
                house_number: props.house_number,
                first_line: props.first_line,
                second_line: props.second_line,
                post_code: props.post_code
            },
            card: {
                card_number: props.card_number,
                expiry_date: props.expiry_date,
                security_code: props.security_code,
            }
        }
        const response = await fetch(props.url + 'orders_api/check_details', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        })
        const content = await response.json()
        setAddressValid(content.address)
        setCardValid(content.card)
        let both_success = content.card.valid && content.address.valid
        setSuccess(both_success)
    }

    useEffect(() => {
        check_details()
    }, [
        props.house_number,
        props.first_line,
        props.second_line,
        props.post_code,
        props.card_number,
        props.expiry_date,
        props.security_code,
        props.contact_number
    ])

    const ConditionalLink = ({ children, to, condition }) => (condition)
        ? <Link to={to}>{children}</Link>
        : <>{children}</>;

    return (
        <div className="mainContainer container mt-3">
            <div className="card">
                <div className="row">

                    <div className="row border-top border-bottom">
                        <div className="row main align-items-center">
                                <h3>Address</h3>
                                {!address_valid.valid &&
                                    <p style={{color: "red"}}>{address_valid.message}</p>
                                }
                                <div class="required">
                                    <label for="house number">House Number:</label><br />
                                    <input id="house number" type="text" name="house_number" onChange={
                                        (e) => { props.setHouseNumber(e.target.value) }
                                    }></input>
                                </div>
                                <div class="required">
                                    <label for="first line">First Line:</label><br />
                                    <input id="first line" type="text" name="first_line" onChange={
                                        (e) => { props.setFirstLine(e.target.value) }
                                    }></input>
                                </div>
                                <div>
                                    <label for="second line">Second Line:</label><br />
                                    <input id="second line" type="text" name="second_line" onChange={
                                        (e) => { props.setSecondLine(e.target.value) }
                                    }></input>
                                </div>
                                <div class="required">
                                    <label for="post code">Post Code:</label><br />
                                    <input id="post code" type="text" name="post_code" onChange={
                                        (e) => { props.setPostCode(e.target.value) }
                                    }></input>
                                </div>

                                <hr />
                                <h3>Card Details</h3>
                                {!card_valid.valid &&
                                    <p style={{color: "red"}}>{card_valid.message}</p>
                                }
                                <div class="required">
                                    <label for="card number">Card Number:</label><br />
                                    <input id="card number" type="text" name="card_number" onChange={
                                        (e) => { props.setCardNumber(e.target.value) }
                                    }></input>
                                </div>
                                <div class="required">
                                    <label for="expiry date">Expiry Date: (year-month)</label><br />
                                    <input type="month" id="expiry date" name="expiry_date" onChange={
                                        (e) => { props.setExpiryDate(e.target.value) }
                                    }></input>
                                </div>
                                <div class="required">
                                    <label for="security code">Security Code:</label><br />
                                    <input id="security code" type="text" name="security_code" onChange={
                                        (e) => { props.setSecurityCode(e.target.value) }
                                    }></input>
                                </div>

                                <hr />
                                <div>
                                    <label for="contact number">Contact Number:</label><br />
                                    <input id="contact number" type="text" name="contact_number" onChange={
                                        (e) => { props.setContactNumber(e.target.value) }
                                    }></input>
                                </div>
                                <ConditionalLink to="/checkout/review-page" condition={success}>
                                    <button className="btn" onClick={check_details}>Review</button>
                                </ConditionalLink>
                    </div>
                </div>
            </div>
        </div>
        </div >        
    )
}