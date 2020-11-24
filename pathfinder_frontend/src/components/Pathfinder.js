import React from 'react';
import { connect } from 'react-redux';
import Login from './Login/Login';
import MainModule from './MainModule/MainModule';

class Pathfinder extends React.Component {
    


    render() {
        console.log('this.props.auth_token',this.props.auth_token)
        if (!this.props.auth_token){
        return(
                <Login />
            )
        }
        else{
            return(
                <MainModule />
            )
        }
    }
};

const mapStateToProps = state => {
    return { auth_token: state.auth.token };
};

export default connect(
    mapStateToProps,
)(Pathfinder);