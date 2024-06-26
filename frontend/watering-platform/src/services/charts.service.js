import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_ADDRESS;

export class ChartsService {

    constructor() { }

    getHeatmapProps(field, params) {
        return axios.get(this.buildURL(field, 'heatmap'), {
            params: {
                timestamp: params.timestamp
            }
        }).then(response => {
            return response.measures;
        }).catch(error => {
            console.log(error)
            throw new Error(error.message)
        })
    }

    async getTemperatures(field, params) {
        return axios.get(this.buildURL(field, 'airTemp'), {
            params: {
                timeFilterFrom: params.timeFilterFrom,
                timeFilterTo: params.timeFilterTo,
            },
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwMjQ5OTgxNywiZXhwIjoxNzAyNTg2MjE3fQ.eGvfVLTEVBQo31q_-v7nlv3I6pnjKm2aGlNosIUToIQ`
            }
        }).then(response => {
            if(response.data && response.data.values.length > 0) {
                return response.data.values[0].measures;
            }
            return null;
        }).catch(error => {
            console.log(error);
            throw new Error(error.message);
        })
    }

    buildURL(field, endpoint) {
        return API_URL + field.refStructureName + '/'
            + field.companyName + '/' + field.fieldName + '/' + field.plantNum + '/' + field.plantRow + '/' + endpoint;
    }

}