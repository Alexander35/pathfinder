import axios from 'axios';

const PATHFINDER_HOST_ADDRESS = process.env.REACT_PATHFINDER_HOST_ADDRESS || 'localhost';

const host = PATHFINDER_HOST_ADDRESS + ':8000'

export default axios.create({
  baseURL: 'http://' + host,
});
