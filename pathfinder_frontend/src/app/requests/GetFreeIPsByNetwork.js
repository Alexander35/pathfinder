import config from '../../config'

export default async (name) => {
    name = name.replace(/\./g, '_')
    name = name.replace('/', '|')
    const result = await config.get(
        '/net/' + name + '/free_addresses/',
            { headers: { 'Content-Type': 'application/json' } }
    ).then( res => {
        return res.data;
        }
    ).catch(error => {
        return error
    });

    return result;
};