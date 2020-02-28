export default class HttpRequestManager {
    static get Token() {
        return HttpRequestManager._token;
    }
    static set Token(token) {
        HttpRequestManager._token = token;
    }

    static get BaseUrl() {
        return HttpRequestManager._baseUrl;
    }
    static set BaseUrl(baseUrl) {
        HttpRequestManager._baseUrl = baseUrl;
    }

    static get(url) {
        return new Promise((resolve, reject, oauthToken) => {
            const httpRequest = HttpRequestManager._decoratedXMLHttpRequest("GET", url, (oauthToken || HttpRequestManager.Token));
            HttpRequestManager._onReadyStateChange(httpRequest, resolve, reject);
            httpRequest.send();
        });
    }

    static getAsAnonymous(url) {
        const httpRequest = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            httpRequest.open("GET", url);
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState !== 4) return;
    
                if (httpRequest.status >= 200 && httpRequest.status < 300) {
                    resolve(httpRequest.response);
                } else {
                    reject({
                        status: httpRequest.status,
                        statusText: httpRequest.statusText
                    });
                }
            }
            httpRequest.send();
        });
    }

    static post(url, body, oauthToken) {
        return new Promise((resolve, reject) => {
            const httpRequest = HttpRequestManager._decoratedXMLHttpRequest("POST", url, (oauthToken || HttpRequestManager.Token));
            HttpRequestManager._onReadyStateChange(httpRequest, resolve, reject);
            httpRequest.send(JSON.stringify(body));
        });
    }

    static _decoratedXMLHttpRequest(httpMethod, url){
        const httpRequest = new XMLHttpRequest();
        httpRequest.open(httpMethod, url, true);
        httpRequest.setRequestHeader("Authorization", "Bearer " + HttpRequestManager.Token);

        return httpRequest;
    }

    static _onReadyStateChange(httpRequest, resolve, reject, ) {
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState !== 4) return;

            if (httpRequest.status >= 200 && httpRequest.status < 300) {
                resolve(JSON.parse(httpRequest.response));
            } else {
                reject({
                    status: httpRequest.status,
                    statusText: httpRequest.statusText
                });
            }
        }
    }
}


HttpRequestManager._token = "";
HttpRequestManager._baseUrl = "";