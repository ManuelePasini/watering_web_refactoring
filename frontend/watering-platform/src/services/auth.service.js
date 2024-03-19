import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8081/'
});

class AuthService {

    isUserLoggedIn() {
        const token = JSON.parse(localStorage.getItem('appToken'));
        return !!token;
    }

    login(user) {
        return axiosInstance.post('/login', {
            username: user.authUser,
            password: user.authPass,
            auth_type: 'pwd'
        }).then(response => {
            if(response.data.token) {
                localStorage.setItem('appToken', JSON.stringify(response.data.token))
            }
        }).catch(error => {
            throw Error(`Authentication failed: ${error.message}`);
        });
    }

    logout(){
        localStorage.removeItem('appToken');
    }

    authHeader(){
        const tokenItem = localStorage.getItem('appToken')
        const token = JSON.parse(tokenItem);
        if(token)
            return token;
        else return undefined;
    }

    async retrieveUserPermissions(token) {
        return axiosInstance.get('/userFields', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).then(response => {
            if(response.data)
                return response.data
            return undefined;
        }).catch(error => {
            console.error(`Get fields request failed: ${error.message}`)
            this.logout()
            return undefined;
        });
    }

}

export default new AuthService();