import { SET_AUTH_USER } from "../actions/actionTypes";

const InitialState = {
    user: 'NoName',
}

export default (state = InitialState, action) =>  {
    switch (action.type) {
        case SET_AUTH_USER: {
            return  action.auth;
        } 
        default: {
            return state;
        }
    }
};