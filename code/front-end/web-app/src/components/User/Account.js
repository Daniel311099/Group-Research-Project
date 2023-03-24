import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom'

import "../../css/Basket.css"

export default function Account(props) {

    const [orders, setOrders] = useState([])
    const [scalar, setScalar] = useState(1)

    const load_basket = async () => {
        const response = await fetch(props.url + 'orders_api/order', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        })
        const content = await response.json()
        setOrders(content.orders)
        setScalar(content.scalar)
    }

    useEffect(() => {
        load_basket()
    }, [])

    const order_list = orders.map(order => {
        let id = order.id
        return (
            <Link to="/user/order-page" state={order} key={id}>
                <div className="row main align-items-center">
                    <div className="col">{id}</div>
                    <div className="col">£{order.order_total}</div>
                    <div className="col">{order.est}</div>
                    <div className="col">{order.card}</div>
                </div>
            </Link>
        )
    })

    return (
        <div>
            <header>
                <nav className="navbar navbar-dark bg-dark">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#">My Account</a>
                    </div>
                </nav>
            </header>
            <div className="mainContainer container mt-3">
                <div className="card">
                    <h2 className="text-center my-2">Your Orders</h2>
                    <div>
                        <div className="row border-top border-bottom">
                            <div className="row main align-items-center">
                                <div className="col">Order Id </div>
                                <div className="col">Order Total </div>
                                <div className="col">Est Delivery</div>
                                <div className="col">Payment Method</div>
                            </div>
                        </div><div className="cartBody">
                            <div className="row border-top border-bottom">
                                {order_list}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}