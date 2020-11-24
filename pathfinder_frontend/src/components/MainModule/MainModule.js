import React from 'react';
import Header from '../Header/Header'
import RouteMap from '../RouteMap/RouteMap'
import { connect } from "react-redux"

class MainModule extends React.Component {

    render() {
        return(
            <>
            	<Header/>
            	<RouteMap/>
            </>
            )
    }
}

const mapStateToProps = state => {
    return { auth_user: state.user.login,
             auth_token: state.auth.token };
};

export default connect(
    mapStateToProps
)(MainModule);