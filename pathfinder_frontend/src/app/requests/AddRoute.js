import config from '../../config'

export default async (name, start_p, end_p, owner, token) => {
    const auth = 'Token '.concat(token);

    const result = await config.post(
        '/route/',
        {
            "Name": name,
            "Start_Point_Name": start_p,
            "End_Point_Name": end_p,
            "Owner": owner
        },
            {headers: { 'Content-Type': 'application/json',
                        'Authorization': auth }}
    ).then( res => {
        return res.data;
        }
    ).catch(error => {
        return error
    });

    return result;
};