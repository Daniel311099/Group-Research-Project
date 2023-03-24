import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navigate } from "react-router";

import "../../css/Basket.css"

export default function Order(props) {

    const [basketItems, setBasketItems] = useState([])
    const [total, setTotal] = useState(0)
    const [discount_code, setDiscountCode] = useState('')
    const [valid_discount, setValidDiscount] = useState({ valid: false, message: '', discount: { amount: 0 } })
    const [order_success, setOrderSuccess] = useState({success: false, message: ''})
    const [order_content, setOrderContent] = useState()

    useEffect(() => {
        console.log(basketItems, props.delivery)
        setTotal((parseFloat(basketItems.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)) + parseFloat(props.delivery.price)).toFixed(2))
    })

    // get_items_data function
    const load_basket = async () => {
        console.log(props.items)
        const response = await fetch(props.url + 'products_api/basket_items', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(props.items)
        })
        const content = await response.json()
        setBasketItems(content)
    }

    useEffect(() => {
        load_basket()
    }, [])

    const item_list = basketItems.map(item => {
        console.log(basketItems)
        const url = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public'
        return (
            <div className="row border-top border-bottom" id={item.id}>
                <div className="row main align-items-center">
                    <div className="col-2"><img className="img-fluid" src={url + "/" + item.image} /></div>
                    <div className="col">
                        <div className="row text-muted">{item.product.brand}</div>
                        <div className="row">{item.product.name}</div>
                    </div>
                    <div className="col">
                        <p className="border">{item.quantity}</p>
                    </div>
                </div>
            </div>
        )
    })

    const order = async () => {
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
            },
            other: {
                contact_number: props.contact_number,
                delivery_type: props.delivery.name,
            }
        }
        console.log(details)
        const response = await fetch(props.url + 'orders_api/order', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        })
        const content = await response.json()
        if (content.ordered) {
            setOrderContent(content)
            setOrderSuccess({success: true, message: ''})
            props.setBasket([])
        }
        else{
            setOrderSuccess({success: false, message: 'Error, please try again!'})
        }
    }
    const check_discount = async () => {
        const response = await fetch(props.url + 'orders_api/check_discount', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: discount_code })
        })
        const content = await response.json()
        setValidDiscount(content)
    }

    const get_discount = async () => {
        const response = await fetch(props.url + 'orders_api/check_discount', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const content = await response.json()
        setValidDiscount(content)
    }

    useEffect(() => {
        get_discount()
    }, [])

    const navigate = useNavigate();
    if (order_success.success){
        navigate("/checkout/order-confirmed", {state: {props: order_content}})
    }

    return (
        <div className="mainContainer container mt-3">
            {order_success.success &&
                <h3 className="row">{order_success.message}</h3>
            }
            <div className="card">
                <div className="row">
                    <div className="col-md-8 cart">
                        <div className="title">
                            <div className="row">
                                <div className="col">
                                    <h4><b>Shopping Cart</b></h4>
                                </div>
                                <div className="col totalItems align-self-center text-right text-muted" />
                            </div>
                        </div>
                        {item_list}
                    </div>
                    <div className="col-md-4 summary">
                        <div>
                            <h5><b>Summary</b></h5>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col totalItems" style={{ paddingLeft: 0 }}>TOTAL ITEMS: {props.num_items}</div>
                            <div className="col text-right TotalPrice" />
                        </div>
                        <p>SHIPPING</p>
                        <select onChange={(e) => { props.setDelivery(JSON.parse(e.target.value)) }}>
                            <option className="text-muted" value={JSON.stringify({ price: 0.00, name: 'free' })}>Free-Delivery- £0.00- 7 days</option>
                            <option className="text-muted" value={JSON.stringify({ price: 5.00, name: 'express' })}>Express-Delivery- £5.00- 3 days</option>
                        </select>
                        <p>{props.est_delivery}</p>
                        <p>ENTER DISCOUNT CODE: </p>
                        <input id="code" placeholder="discount code" onChange={(e) => { setDiscountCode(e.target.value) }} />
                        <button onClick={check_discount}>Use Code</button>
                        <div className="row" style={{ borderTop: '1px solid rgba(0,0,0,.1)', padding: '2vh 0' }}>
                            <div className="col">TOTAL PRICE:</div><br />
                            <div className="col text-right TotalPrice">total: £ {total}</div>
                            {valid_discount.valid &&
                                <div>
                                    <div className="col text-right">- £ {valid_discount.discount.amount}</div>
                                    <div className="col text-right TotalPrice">final price: £ {total - valid_discount.discount.amount}</div>
                                </div>
                            }
                        </div> <button onClick={order} className="btn">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


