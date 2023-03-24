import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import "../../css/Basket.css"

export default function Basket(props) {

    const [basketItems, setBasketItems] = useState([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        setTotal((parseFloat(basketItems.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)) + parseFloat(props.delivery.price)).toFixed(2))
    }, )

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
    }, [props.items])

    const quantity_handler = (item, amount) => {
        props.add_item({
            id: item.id,
            quantity: amount
        })
    }

    const item_list = basketItems.map(item => {
        const url = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public'
        return (
            <div className="row border-top border-bottom" key={item.id}>
                <div className="row main align-items-center">
                    <Link to={"/product/"+item.product.id} onClick={()=>{props.setProductId(item.product.id)}}>
                        <div className="col-2"><img className="img-fluid" src={url + "/" + item.image} /></div>
                        <div className="col">
                            <div className="row text-muted">{item.product.brand}</div>
                            <div className="row">{item.product.name}</div>
                        </div>
                    </Link>
                    <div className="col"> 
                        <button onClick={() => {quantity_handler(item, -1)}}>-</button>
                        <p className="border">{item.quantity}</p>
                        <button onClick={() => {quantity_handler(item, 1)}}>+</button> </div>
                    <div className="col">
                        £ {item.product.price} <button className="close" onClick={() => {quantity_handler(item, item.quantity*(-1))}}>x</button>
                    </div>
                </div>
            </div>
        )
    })

    return (
        <div className="mainContainer container mt-3">
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
                        <form>
                            <p>SHIPPING</p> 
                            <select onChange={(e) => {props.setDelivery(JSON.parse(e.target.value))}}>
                                <option className="text-muted" value={JSON.stringify({price: 0.00, name: 'free'})}>Free-Delivery- £0.00- 7 days</option>
                                <option className="text-muted" value={JSON.stringify({price: 5.00, name: 'express'})}>Express-Delivery- £5.00- 3 days</option>
                            </select>
                            <p>Estimated delivery date: {props.est_delivery}</p>
                        </form>
                        <div className="row" style={{ borderTop: '1px solid rgba(0,0,0,.1)', padding: '2vh 0' }}>
                            <div className="col">TOTAL PRICE</div>
                            <div className="col text-right TotalPrice">£ {total}</div>
                        </div> 
                        <Link to="/checkout/details-page">
                            <button className="btn">CHECKOUT</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}