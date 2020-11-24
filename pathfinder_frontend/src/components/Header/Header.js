import React from 'react';
import { connect } from "react-redux"

class Header extends React.Component {

    render() {
        return(
            <>        
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <a className="navbar-brand mr-auto" >P A T H F I N D E R</a>
                <nav className="mr-sm-2">
                    <a className="nav-link" > USER: { this.props.auth_user }</a>
                    <a className="nav-link" href="/">Exit</a>
                </nav>
              </nav>
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
)(Header);