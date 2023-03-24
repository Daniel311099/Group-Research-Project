// react dependencies
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";

// components
import Login from "./components/User/Login";
import Register from "./components/User/Register";

import Nav from "./components/Header/Nav";
import Header from "./components/Header/Header";

import Home from "./components/General/Home";
import NotFound from "./components/General/NotFound";
import Footer from "./components/General/Footer";

import ProductPage from "./components/Product/ProductPage"
import ProductList from "./components/Product/ProductList"

// css
import './css/User.css'
import './css/Basket.css';

import Basket from "./components/Checkout/Basket";
import Details from "./components/Checkout/Details";
import Order from "./components/Checkout/Order";
import OrderConfirmed from "./components/Checkout/OrderConfirmed";
import Account from "./components/User/Account";
import OrderPage from "./components/User/OrderPage";

function App() {

    const url = "https://ecom-backend174.herokuapp.com/"
    // const url = "http://localhost:8000/"

    const [auth, setAuth] = useState(false)
    const [name, setName] = useState("s")
    const [email, setEmail] = useState("")
    const [basket, setBasket] = useState([]) //contains, {product_id: _, quantity: _, price(of one): _}
    // basket treats each storage option as a unique object, it contains latest version of server side basket
    const [basket_ids, setBasketIds] = useState({}) //caches index in basket of each product, change this as index might change if items are removed
    const [total, setTotal] = useState(0)
    const [delivery, setDelivery] = useState({price: 0, name: 'free'})
    const [est_delivery, setEstDelivery] = useState('')
    const [search, setSearch] = useState('Iphone')
    const [productId, setProductId] = useState()

    const [house_number, setHouseNumber] = useState('2')
    const [first_line, setFirstLine] = useState('d')
    const [second_line, setSecondLine] = useState('d')
    const [post_code, setPostCode] = useState('f')
    const [card_number, setCardNumber] = useState('1234567890123456')
    const [expiry_date, setExpiryDate] = useState("2023-01")
    const [security_code, setSecurityCode] = useState('334')
    const [contact_number, setContactNumber] = useState('324235')

    useEffect( () => {
        (
            async () => {
                const response = await fetch(url+'users_api/user', {
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                })
                const content = await response.json()
                setName(content.name)
                setAuth(content.auth)
                    }
        )()
    })
    
    const load_basket = async () => {
        const item_ids = basket.map(item => 'basket=' + String(item.id)).join('&')
        const response = await fetch(url+'orders_api/basket?delivery_type='+delivery.name, {
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
    })
        const content = await response.json()
        setBasket(content.products)
        setEstDelivery(content.est_delivery)
        let ids = {}
        for (const [product, i] of content.products.entries()) {
            ids[String(product.id)] = i
        }
        setBasketIds(ids)
    }

    useEffect(() => { // initialises the local basket
        if (auth) {return}
        let local_basket = window.localStorage.getItem('basket');
        if (local_basket == undefined) {
            window.localStorage.setItem('basket', JSON.stringify(basket));
            window.localStorage.setItem('basket_ids', JSON.stringify(basket_ids));
        }
    }, []);

    useEffect( () => {
        if (auth) {load_basket()}
        else {
            setBasket(JSON.parse(window.localStorage.getItem('basket')));
            setBasketIds(JSON.parse(window.localStorage.getItem('basket_ids')));
        }
    }, [auth, delivery])

    const add_local = (product) => {
        let local_basket = window.localStorage.getItem('basket');
        let basket_ids = window.localStorage.getItem('basket_ids');
        local_basket = JSON.parse(local_basket)
        basket_ids = JSON.parse(basket_ids)

        let basket_loc = basket_ids[product.id]
        if (basket_loc != undefined) { // checks if item is already in basket
            if (local_basket < 1) {}
            local_basket[basket_loc].quantity = Math.max(local_basket[basket_loc].quantity + product.quantity, 0)
        }
        else {
            local_basket.push(product)
            basket_ids[String(product.id)] = local_basket.length
        }
        setBasket(local_basket)
        setBasketIds(basket_ids)
        window.localStorage.setItem('basket', JSON.stringify(local_basket));
        window.localStorage.setItem('basket_ids', JSON.stringify(basket_ids));
    }

    const add_live = async (product) => {
        console.log(product)
        const response = await fetch(url+'orders_api/basket', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(product)
        })
        const content = await response.json()
        setBasket(content.products)
        console.log(content)
    }

    const add_product = (product) => { // product is {id(of variant): _, quantity: _}
        if (auth) {add_live(product)}
        else {add_local(product)}
    }

    let num_items = basket.reduce((total, item) => {
        return total + item.quantity
    }, 0)

    return (
        <div className="App">

            <BrowserRouter>
                <Header url={url} name={name} auth={auth} setAuth={setAuth} num_items={num_items} setSearch={setSearch}/>
                
                <Routes>
                    <Route exact path="/" element={<Home url={url} auth={auth} name={name} setSearch={setSearch} setProductId={setProductId}/>} />

                    <Route path="/user/login" element={<Login url={url} auth={auth} setAuth={setAuth} setName={setName} email={email} setEmail={setEmail} load_basket={load_basket}/>} />
                    <Route path="/user/register" element={<Register url={url} auth={auth}/>} />
                    <Route path="/user/account" element={<Account url={url} auth={auth} name={name} />} />
                    <Route path="/user/order-page" element={<OrderPage url={url} auth={auth} name={name} />} />

                    <Route path="product/product_list" element={<ProductList url={url} search={search} setProductId={setProductId}/>}  add_item={add_product}/>
                    <Route path="product/*" element={<ProductPage url={url} auth={auth} productId={productId} add_item={add_product}/>}/>

                    <Route path="/checkout/basket" element={<Basket url={url} delivery={delivery} setDelivery={setDelivery} est_delivery={est_delivery} num_items={num_items} items={basket} add_item={add_product} setProductId={setProductId}/>} />
                    <Route path="/checkout/details-page" element={<Details
                        house_number={house_number} first_line={first_line} second_line={second_line} post_code={post_code} card_number={card_number} expiry_date={expiry_date} security_code={security_code} contact_number={contact_number}
                        url={url} setHouseNumber={setHouseNumber} setFirstLine={setFirstLine} setSecondLine={setSecondLine} setPostCode={setPostCode} setCardNumber={setCardNumber} setExpiryDate={setExpiryDate} setSecurityCode={setSecurityCode} setContactNumber={setContactNumber} />} />
                    <Route path="/checkout/review-page" element={<Order 
                     delivery={delivery} setDelivery={setDelivery} est_delivery={est_delivery} setBasket={setBasket}
                     house_number={house_number} first_line={first_line} second_line={second_line} post_code={post_code} card_number={card_number} expiry_date={expiry_date} security_code={security_code} contact_number={contact_number} 
                    url={url} num_items={num_items} items={basket} add_item={add_product} setProductId={setProductId}/>} />
                    <Route path="/checkout/order-confirmed" element={<OrderConfirmed url={url}/>} />
               
                    <Route path="/*" element={<NotFound url={url} />} />
                </Routes>
            </BrowserRouter> 

            <Footer />
      </div>
    );
}

export default App;
