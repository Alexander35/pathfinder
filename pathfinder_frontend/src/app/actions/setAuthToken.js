import { SET_AUTH_TOKEN } from './actionTypes';

export const setAuthToken = token => ({
    type: SET_AUTH_TOKEN,
    auth: { token }
});