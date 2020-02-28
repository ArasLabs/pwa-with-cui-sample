export default function(url, database, username, password, clientID) {
    let discoveryUrl = url + "/Server/OAuthServerDiscovery.aspx";

    return new Promise((resolve, reject) => {
        // Getting the OAuth Server URL
        let oauthRequest = new XMLHttpRequest();
        oauthRequest.open("GET", discoveryUrl);
        oauthRequest.send();
        oauthRequest.onreadystatechange = () => {
            if(oauthRequest.readyState !== 4) return;

            if (oauthRequest.status >= 200 && oauthRequest.status < 300) {
                // Getting the token end point
                let oauthServerURL = JSON.parse(oauthRequest.responseText).locations[0].uri;
                let endpointRequest = new XMLHttpRequest();
                endpointRequest.open("GET", oauthServerURL + ".well-known/openid-configuration");
                endpointRequest.send();
                endpointRequest.onreadystatechange = () => {
                    if(endpointRequest.readyState !== 4) return;

                    if (endpointRequest.status == 200 && endpointRequest.status < 300) {
                        // Getting the token
                        let tokenEndpointURL = JSON.parse(endpointRequest.responseText).token_endpoint;
                        let tokenRequest = new XMLHttpRequest();
                        tokenRequest.open("POST", tokenEndpointURL);

                        // set body of request using form data
                        let body = new FormData();
                        body.append("grant_type", "password");
                        body.append("scope", "Innovator");
                        body.append("client_id", "InnovatorClient");
                        body.append("username", username);
                        body.append("password", password);
                        body.append("database", database);

                        // send request
                        tokenRequest.send(body);
                        tokenRequest.onreadystatechange = () => {
                            if(tokenRequest.readyState !== 4) return;

                            if (tokenRequest.status == 200 && tokenRequest.status < 300) {
                                var token = JSON.parse(tokenRequest.responseText).access_token;
                                resolve(token);
                            } else {
                                reject({
                                    status: tokenRequest.status,
                                    statusText: tokenRequest.statusText
                                });
                            }
                        }
                    } else {
                        reject({
                            status: endpointRequest.status,
                            statusText: endpointRequest.statusText
                        });
                    }
                }
            } else {
                reject({
                    status: oauthRequest.status,
                    statusText: oauthRequest.statusText
                });
            }
        }
    });
}