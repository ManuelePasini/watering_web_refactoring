import axios from "axios";

export class CommunicationService {

    async getChartData(environment, paths, params, endpoint) {
        const response = await this.getAPI(environment, paths, params, endpoint)
        if (response && response.values.length > 0)
            return response.values[0].measures;
        return null;
    }

    async getAPI(environment, paths, params, endpoint) {
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
            if (response.data)
                return response.data;
            return null;
        }).catch(error => {
            console.error(`Error response: ${error}`)
            console.error(`Error on communication service: ${error.message}`)
            throw new Error(error.message);
        })
    }

    async getFieldInfo(environment, paths, params, endpoint) {
        const response = await this.getAPI(environment, paths, params, endpoint)
        return response;
    }

    buildURL(host, paths, endpoint) {
        return host + paths.refStructureName + '/' + paths.companyName + '/' + paths.fieldName + '/' + paths.sectorName + '/' + paths.plantRow + '/' + endpoint;
    }

}