import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../../css/General.css";
import "../../css/Basket.css";
import not_found from "../../not_found.png";

export default function Home(props) {
    console.log('home', props.name, props.auth)

    const [brands, setBrands] = useState([])
    const [popular, setPopular] = useState([])
    const [discounts, setDiscounts] = useState([])

    useEffect(() => {
        (
            async () => {
                const response = await fetch(props.url + 'products_api/brands', {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
                const content = await response.json()
                setBrands(content)
            }
        )()
    }, [])

    useEffect(() => {
        (
            async () => {
                const response = await fetch(props.url + 'products_api/popular_products', {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
                const content = await response.json()
                setPopular(content)
            }
        )()
    }, [])

    useEffect(() => {
        (
            async () => {
                const response = await fetch(props.url + 'products_api/discounts', {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
                const content = await response.json()
                setDiscounts(content)
            }
        )()
    }, [])

    const brandsList = brands.map(brand => {
        let imgURL = props.url + "/" + brand.image
        imgURL = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public/' + brand.image
        return (
            <div className="container" key={brand.brand_id}>
                <Link to="/product/product_list" onClick={() => { props.setSearch(brand.name) }}>
                    <p className="two">{brand.name}</p>
                    <img
                        src={imgURL}
                        alt={brand.name}
                        className="image"
                        width="100%"
                        height={250}
                        onError={(e) => e.target.src = not_found} />
                </Link>
            </div>
        )
    })

    const popularList = popular.map(product => {
        let imgURL = props.url + "/" + product.image
        imgURL = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public/' + product.image
        return (
            <div className="container" key={product.product_id}>
                <Link to={"/product/" + product.product_id} onClick={() => { props.setProductId(product.product_id) }}>
                    <p className="two">{product.name}</p>
                    <img
                        src={imgURL}
                        alt={product.name}
                        className="image"
                        width="100%"
                        height={250}
                        onError={(e) => e.target.src = not_found} />
                </Link>
            </div>
        )
    })

    const discountList = discounts.map(discount => {
        let code = (props.auth ? 'ENTER: ' + discount.discount_code : 'sign in to get code')
        return (
            <div className="container" key={discount.id} style={{
                backgroundColor: "silver",
                'border-radius': 6,
                'margin-bottom': '20%',
                'padding-top': '5%',
                'padding-bottom': '5%'
            }}>
                <h4>{discount.name}</h4>
                <p>{discount.description}</p>
                <div style={{
                    color: "silver",
                    backgroundColor: "#101010",
                    'border-radius': 6
                }}>
                    <div style={{ color: (props.auth ? 'green' : 'aqua') }}
                    >{code}</div>
                    {props.auth &&
                        <div>
                            AT CHECKOUT
                        </div>
                    }
                </div>
            </div>
        )
    })

    return (
        <div>
            <div className="row">
                <div className="column">
                    <h1 style={{ 'text-align': "center" }}>BRANDS</h1>
                    {brandsList}
                </div>
                <div className="column">
                    <h1 style={{ 'text-align': "center" }}>POPULAR PRODUCTS</h1>
                    {popularList}
                </div>
                <div className="column">
                    <h1 style={{ 'text-align': "center" }}>OFFERS</h1>
                    <br /><br /><br />
                    {discountList}
                </div>
            </div>

        </div>

    )
}