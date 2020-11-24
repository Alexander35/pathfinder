import React from 'react'
import { connect } from "react-redux"
import LoginRequest from '../../app/requests/LoginRequest'
// import Container from 'reactstrap/Container'
// import Row from 'reactstrap/Row'
// import Col from 'reactstrap/Col'
// import Form from 'reactstrap/Form'
// import {Button} from 'reactstrap'
import { setAuthToken } from "../../app/actions/setAuthToken"
import { setAuthUser } from "../../app/actions/setAuthUser"

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          login: '',
          password: ''
        };
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { login, password } = this.state;

        LoginRequest(login, password
            ).then( res => {
                        this.props.setAuthUser(login);
                        this.props.setAuthToken(res.token);
                    });
    }

    render() {
        return (
                <div>
                    <div  className=" row justify-content-md-center">
                        <div className="col-md-2">
                            <form className="form-inline" onSubmit={this.onSubmit}>
                                <div className="form-row">
                                	<div className="form-group col-md-6">
                                    <label >Login</label>
                                    <input  name="login" value={this.state.login} placeholder="Login" onChange={this.onChange} />
                                	</div>
                                </div>
                                <div className="form-row">
                                	<div className="form-group col-md-6">
                                    <label >Password</label>
                                    <input name="password" value={this.state.password} type="password" placeholder="Password" onChange={this.onChange} />
                                	</div>
                                </div>
                                <div className="form-row">
	                                <div className="form-group col-md-12">
	                                <button className="btn btn-primary" type="submit">
	                                    Enter
	                                </button>
	                                </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
        )
    } 
};

const mapStateToProps = state => {
    return { auth_token: state.auth.token, auth_user: state.auth.user };
};

export default connect(
    mapStateToProps,
    { setAuthToken, 
    setAuthUser }
)(Login);