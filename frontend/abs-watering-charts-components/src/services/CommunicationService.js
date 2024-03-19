import axios from "axios";

export class CommunicationService {

    async getChartData(environment, paths, params, endpoint) {
        console.log(`Params ${JSON.stringify(params)}`)
        console.log(`Paths ${JSON.stringify(paths)}`)
        console.log(`Url ${this.buildURL(environment.host, paths, endpoint)}`)

        return axios.get(this.buildURL(environment.host, paths, endpoint), {
            params: {
                timeFilterFrom: params ? params.timeFilterFrom : null,
                timeFilterTo: params ? params.timeFilterTo : null,
                colture: params ? params.colture : null,
                coltureType: params ? params.coltureType : null
            },
            headers: {
                Authorization: 'Bearer ' + environment.token
            }
        }).then(response => {
            console.log(`Success response: ${response.data}`)
            if(response.data && response.data.values.length > 0)
                return response.data.values[0].measures;
            return null;
        }).catch(error => {
            console.error(`Error response: ${error}`)
            console.error(`Error on communication service: ${error.message}`)
            throw new Error(error.message);
        })
    }

    buildURL(host, paths, endpoint) {
        return host + paths.refStructureName + '/' + paths.companyName + '/' + paths.fieldName + '/' + paths.sectorname + '/' + paths.thesis + '/' + endpoint;
    }

}