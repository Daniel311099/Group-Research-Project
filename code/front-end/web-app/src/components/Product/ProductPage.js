import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/Product.css";
import "../../css/Basket.css";

// props:

export default function ProductPage(props) {
    const [name, setName] = useState();
    const [imgURLs, setImgURLs] = useState([]);
    const [loading, setLoading] = useState(true)
    const [product, setProduct] = useState({ variants: [] });
    const [active, setActive] = useState({ storages: [] })
    const [activeColour, setActiveColour] = useState()
    const [activeStorage, setActiveStorage] = useState({ price: 'price unavailable' })
    const [quantity, setQuantity] = useState(1)

    const load_product = async () => {
        const response = await fetch(
            props.url + "products_api/" + props.productId,
            {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );
        const content = await response.json();
        setProduct(content);
        setActive(content.variants[0])
        setActiveColour(content.variants[0])
        setActiveStorage(content.variants[0].storages[0])
        setLoading(false)
    };

    useEffect(() => {
        load_product();
    }, []);

    const url = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public'

    let image = <></>
    let colours = <></>
    let storages = <></>
    let add_button = <></>

    if (!loading) {
        image =
            <img
                data-image="black"
                className="active image-dim"
                src={url + "/" + activeColour.images[0]}
                alt="phone picture"
            ></img>

        colours = product.variants.map(variant => {
            return (
                <button key={variant.id} onClick={(e) => {
                    setActiveColour(JSON.parse(e.target.value))
                    setActiveStorage(JSON.parse(e.target.value).storages[0])
                }} value={JSON.stringify(variant)}>{variant.colour}</button>
            )
        })

        storages = activeColour.storages.map(storage => {
            return (
                <button onClick={(e) => { setActiveStorage(JSON.parse(e.target.value)) }} value={JSON.stringify(storage)}>{storage.storage} GB</button>
            )
        })
        console.log(activeColour, activeStorage)

        if (props.auth) {
            add_button =
                <Link to="/checkout/basket" className="cart-btn">
                    <button onClick={() => {
                        console.log(activeColour, activeStorage)
                        props.add_item({
                            id: activeStorage.id, //add click handler to change variant
                            quantity: quantity
                        })
                    }}>Add to Basket</button>
                </Link>
        }
        else {
            add_button =
                <Link to="/user/login">
                    <button style={{ "pointer-events": "none" }}>Sign In To Add</button>
                </Link>
        }
    }
    return (
        <main className="product-container">
            product page <br />
            <div className="left-column">{image}</div>
            <div className="right-column">
                <div className="product-description">
                    <span>{product.brand}</span>
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>
                </div>
                <div className="product-configuration">
                    <div className="cable-config">
                        <span>Color</span>
                        <div className="cable-choose">
                            {colours}
                        </div>
                    </div>
                    <div className="cable-config">
                        <span>Capacity</span>
                        <div className="cable-choose">
                            {storages}
                        </div>
                    </div>
                    <div className="cable-config">
                        <span>Quantity</span>
                        <div className="cable-choose">
                            <input placeholder='quantity' type="number" default='1' onChange={(e) => {
                                setQuantity(parseInt(e.target.value))
                            }}></input>
                        </div>
                    </div>
                </div>
                <div className="product-price">
                    <span>£ {activeStorage.price}</span>
                    {add_button}
                </div>
            </div>
        </main>
    );
}
