import React from "react";
import { Link } from "react-router-dom";

import Nav from "./Nav";

// all components in header folder are rendered into Header component not App component

export default function Header(props) {
    return (
        <div class="header">
            <Nav url={props.url} name={props.name} auth={props.auth} setAuth={props.setAuth} setSearch={props.setSearch} num_items={props.num_items} />
            <p>Daniel, Rajveer, Ibrahim, Marco, Shazheb</p>
            <form className="d-flex">
                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={e => props.setSearch(e.target.value)}></input>
                <Link to="/product/product_list"><button className="btn btn-outline-success" type="submit" >Search</button></Link>
            </form>
        </div>
    )
}