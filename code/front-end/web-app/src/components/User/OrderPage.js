import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom'

import "../../css/Basket.css"

export default function OrderPage(props) {

    const location = useLocation()
    const order = location.state
    const address = order.address

    
    const item_list = order.order_products.map(item => {
        const url = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public'
        return (
            <div className="row border-top border-bottom" id={item.id}>
                <div className="row main align-items-center">
                    <div className="col-2"><img className="img-fluid" src={url + "/" + item.product.image} /></div>
                    <div className="col">
                        <div className="row text-muted">{item.product.brand}</div>
                        <div className="row">{item.product.name}</div>
                    </div>
                    <div className="col">
                        <p>{item.quantity}</p>
                    </div>
                    <div className="col">
                        <p>£{item.product.price}</p>
                    </div>
                    <div className="col">
                        <p>£{item.product.price*item.quantity}</p>
                    </div>
                </div>
            </div>
        )
    })

    return (
        <div>
            <header>
                <nav className="navbar navbar-dark bg-dark">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#">Basket App</a>
                    </div>
                </nav>
            </header>
            <div className="mainContainer container mt-3">
                <div className="card">
                    <h2 className="text-center my-2">Thank you for your Order</h2>
                    <h5 className="m-4 text-center">Your Order ID: <b className="orderID">{order.id}</b> A summary of your order is shown below</h5>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlTextarea1">Shipping Address:</label>
                                <p>{address.house_number}</p>
                                <p>{address.first_line}</p>
                                <p>{address.second_line}</p>
                                <p>{address.post_code}</p>
                            </div>
                            <p>Contact Number: {order.contact_number}</p>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="exampleFormControlTextarea1">Details:</label> <br /><br />
                            <p>Order Date: {order.datetime}</p>
                            <p>Card Number: {order.card}</p>
                            <p>Discount: {order.discount}</p>
                            <p>Estimated Delivery: {order.est}</p>
                        </div>
                    </div>
                    <div className=" col-md-6 m-4 text-right">
                        Order Total: £{order.order_total + order.savings}
                        {order.discount &&
                            <div>
                                <div className="">Savings: - £ {order.savings}</div>
                                <div>Final price: £ {Math.round((order.order_total - order.savings)*100)/100}</div>
                            </div>
                        }
                    </div>
                    <h6 className="m-4 text-center">Your Order Contains:</h6>
                            <div className="row main align-items-center">
                                <div className="col"></div>
                                <div className="col">Name</div>
                                <div className="col">Quantity</div>
                                <div className="col">Price</div>
                                <div className="col">Subtotal</div>
                            </div>
                    <div >
                        <div className="row border-top border-bottom">
                        </div>
                            {item_list}
                        <div className="cartBody">
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}