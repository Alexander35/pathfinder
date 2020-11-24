import { SET_AUTH_TOKEN } from "../actions/actionTypes";


const InitialState = {
    token: false,
}

export default (state = InitialState, action) =>  {
    switch (action.type) {
        case SET_AUTH_TOKEN: {
            return  action.auth;
        }
        default: {
            return state;
        }
    }
};