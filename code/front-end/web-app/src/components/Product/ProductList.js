// useEffect to get data from api based on props
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import "../../css/Product.css";
import not_found from "../../not_found.png";

// add sort and filter
export default function ProductList(props) {
    const IMGURL = 'https://bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0.s3.amazonaws.com/bucketeer-029fce79-e3da-402f-ad01-f61f49e6a3f0/media/public'

    const [products, setProducts] = useState([])
    const [sort, setSort] = useState('price descending')

    const load_products = async () => {
        let url = props.url + 'products_api/product_list/' + props.search
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
        const content = await response.json()
        setProducts(content)
    }

    useEffect(() => {
        load_products()
    }, [props.search])

    let sort_type = {
        'price ascending': (a, b) => {
            return a.price - b.price
        },
        'price descending': (a, b) => {
            return b.price - a.price
        },
        'a-z': (a, b) => {
            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
            if (nameA < nameB)
                return -1
            if (nameA > nameB)
                return 1
            return 0
        },
        'z-a': (a, b) => {
            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
            if (nameA > nameB)
                return -1
            if (nameA < nameB)
                return 1
            return 0
        }
    }

    products.sort((a, b) => {
        return sort_type[sort](a, b)
    })

    let split_list = []
    const rowItems = products.length / 4;
    for (let i = 0; i < products.length; i += rowItems) {
        const chunk = products.slice(i, i + rowItems);
        split_list.push(chunk)
    }

    let product_list = split_list.map(product_row => {
        let product_row_cards = product_row.map(product => {
            let valid_variants = product.product_variants.filter(variant => {
                return variant.product_variant_images.length > 0
            })
            console.log(valid_variants)
            let default_var = (valid_variants.length > 0 ? valid_variants[0] : {product_variant_storages: [], product_variant_images: []})
            let image = (default_var.product_variant_images.length > 0? default_var.product_variant_images[0] : '')
            let imgURL = IMGURL + "/" + image
            console.log(default_var)
            let price = (default_var.product_variant_storages.length > 0 ? default_var.product_variant_storages[0].price : 'price unavailable')
            return (
                < div class="productCard" >
                    <h2 style={{ textAlign: 'center' }}>{product.name}</h2>
                    <img
                        src={imgURL}
                        style={{ width: '100%' }}
                        onError={(e) => e.target.src = not_found}
                    />
                    <h1>{product.brand}</h1>
                    <p className="productDetails">{product.category}</p>
                    <p>{price}</p>
                    <Link to={"/product/" + product.id} onClick={() => { props.setProductId(product.id) }}>
                        <button>Buy Now</button>
                    </Link>
                </div>
            )
        })
        return (
            <div class="productList">
                {product_row_cards}
            </div>
        )
    })

    return (

        <div class="grid-container">
            <div>
                <label htmlFor="sort">Sort By:</label>
                <select name="sort" id="sort" onChange={(e) => {setSort(e.target.value)}}>
                    <option value="price ascending">price ascending</option>
                    <option value="price descending">price descending</option>
                    <option value="a-z">a-z</option>
                    <option value="z-a">z-a</option>
                </select>
            </div>

            <div class="body-container">
                product list
                {product_list}

            </div>
        </div>
    )
}