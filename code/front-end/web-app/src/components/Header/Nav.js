import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from '../../../src/drims_logo.png'

export default function Nav(props) {

    const logout = async () => {
        console.log('logout')
        const response = await fetch(props.url + 'users_api/logout', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        })
        const content = await response.json()

        props.setAuth(false)
    }

    let menu
    if (!props.auth) {
        console.log(props.name, 1)
        menu = (
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/user/login">Login</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/user/register">Register</Link>
                </li>
            </ul>
        )
    } else {
        menu = (
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/" onClick={logout}
                    >Logout</Link>
                </li>
                <li className="nav-item">
                    <p>Hi {props.name}</p>
                    <Link className="navbar-brand" to="/user/account">My Account</Link>
                </li>
            </ul>
        )
    }

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src={logo} style={{
                        width: '100%',
                        height: '100%'
                    }}></img>
                </Link>
                {props.auth &&
                    <Link className="navbar-brand" to="/checkout/basket">Basket {props.num_items} </Link>
                }
                <div>
                    {menu}
                </div>
            </div>
        </nav>
    )
}
