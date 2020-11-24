import { SET_AUTH_USER } from './actionTypes';

export const setAuthUser = login => ({
    type: SET_AUTH_USER,
    auth: { login }
});