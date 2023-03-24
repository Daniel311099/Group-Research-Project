import React, {useState} from "react";
import { Navigate } from "react-router";

export default function Login(props) {
    const [password, setPassword] = useState("")
    const [redirect, setRedirect] = useState(false)

    async function submit(e) {
        e.preventDefault()
        const user = {email:props.email, password}
        console.log(user)
        const response = await fetch(props.url+'users_api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            // sameSite: 'none',
            body: JSON.stringify(user)
        })
        const content = await response.json()
        props.setAuth(content.auth)
        if (content.auth) {props.setName(content.name)}
        setRedirect(content.auth)
    }
    console.log(redirect)

    if (redirect || props.auth){
        return <Navigate to="/"/>
    }

    return (
        <form onSubmit={submit}>
            <img className="mb-4" src="/docs/5.1/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"></img>
            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
            <div className="form-floating">
                <input type="email" className="form-control" placeholder="name@example.com"
                    onChange={e => props.setEmail(e.target.value)}
                ></input>
                <label htmlFor="floatingInput">Email address</label>
            </div>
            <div className="form-floating">
                <input type="password" className="form-control" placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                ></input>
                <label htmlFor="floatingPassword">Password</label>
            </div>
            <button className="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
        </form>
    )
}