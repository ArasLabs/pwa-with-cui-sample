import OAuthManaget from './loginManager.js';
import HttpRequestManager from './httpRequestManager.js';
import LoginModalBinder from './Binders/loginModalBinder.js';
import Account from './Models/account.js';
import MyInBasketItemPage from './Components/myInBasketItemPage.js'


function initialize() {
    const domReady = new Promise(
        (resolve) => {
            document.addEventListener('DOMContentLoaded', resolve);
        }).then(() => {
            M.updateTextFields();

            const tooltipEls = document.querySelectorAll('[data-tooltip]');
            M.Tooltip.init(tooltipEls);

            const modalEls = document.querySelectorAll('.modal');
            M.Modal.init(modalEls, { dismissible: false });

            const selectEls = document.querySelectorAll('select');
            M.FormSelect.init(selectEls);
        }
    );

    const windowReady = 'serviceWorker' in navigator 
        ? new Promise(
            (resolve) => {
                window.addEventListener('load', resolve);
            }).then(() => {
                navigator.serviceWorker.register('service-worker.js').then((registration)  => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, (err) => {
                    console.log('ServiceWorker registration failed: ', err);
                })
            })
        : null;

    Promise.all([domReady, windowReady]).then(() => {
        const logoutElement = document.getElementById('logout');
        logoutElement.addEventListener('click', signOut);

        // Checking if there is local storage
        if (window.localStorage) {
            const database = window.localStorage.getItem("database");
            const username = window.localStorage.getItem("username");
            const password = window.localStorage.getItem("password");
            const serverURL = window.localStorage.getItem("serverURL");            

            // Skip loggining if navigator state is offline
            if(!navigator.onLine) {
                // render content according to selected page
                loadContent();
                return;
            }

            // Logging in the previous user
            if (serverURL != null && database !== null && username !== null && password !== null) {
                // login to innovator instance
                login(serverURL, database, username, password)
                    .then(loadContent)
                    .catch(() => {
                        showLoginDialog();
                    });

                return;
            }
        }

        showLoginDialog();
    });
}

function showLoginDialog() {
    const loginModalBinder = new LoginModalBinder();
    loginModalBinder.show().then(
        () => {
            const loginForm = document.forms.loginToInnovatorForm;
            const formData = new FormData(loginForm);
            let data = [...formData].reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

            login(data.server, data.database, data.username, md5(data.password), data.rememberMe).then(() => {
                loginModalBinder.close();

                loadContent();
            }).catch(() => {
                M.toast({ html: 'Invalid credentials. Please try again!' });
            });
        }
    ).catch((err) => {
        console.error("Login error: ", err);
    });
}


function login(serverURL, database, username, password, rememberMe) {
    return OAuthManaget(serverURL, database, username, password).then((token) => {
        HttpRequestManager.Token = token;
        HttpRequestManager.BaseUrl = serverURL;

        return HttpRequestManager.get(HttpRequestManager.BaseUrl + `/server/odata/Alias?$expand=related_id($select=id,name),source_id($select=id,login_name)&$filter=source_id/login_name eq ${username}&$select=id`)
            .then((result) => {
                const aliasItem = result.value[0];
                Account.init(aliasItem.source_id.id, aliasItem.source_id.login_name, aliasItem.related_id.id, aliasItem.related_id.name);

                // saving the user's credentials
                if (rememberMe && window.localStorage) {
                    window.localStorage.setItem("identityID", Account.IdentityID);
                    window.localStorage.setItem("serverURL", serverURL);
                    window.localStorage.setItem("database", database);
                    window.localStorage.setItem("username", username);
                    window.localStorage.setItem("password", password);
                }
            })
            .catch(() => {
                alert("Username not found");
            });
    });
}


function signOut() {
    window.localStorage.clear();
    document.forms.loginToInnovatorForm.reset();
    Account.clear();

    // Clear the main grid
    MyInBasketItemPage.wipeAll();

    showLoginDialog();
}
 
var loadContent = function () {
    new MyInBasketItemPage();
}

initialize();