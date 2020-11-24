import config from '../../config'

export default async  (login, pass) => {
    const result = await config.post(
        '/login',
        { 'username': login, 'password': pass },
        { headers: { 'Content-Type': 'application/json' } }
    ).then( res => {
        return res.data;
        }
    ).catch(error => {
        return error
    });

    return result;
};
