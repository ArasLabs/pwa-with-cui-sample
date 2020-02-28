import ModalBinder from './modalBinder.js';
import HttpRequestManager from '../httpRequestManager.js';

export default class LoginModalBinder extends ModalBinder {
    static get ModalElement() {
        return document.querySelector('#loginModal');
    }

    constructor(item) {
        super(item, LoginModalBinder.ModalElement);
    }

    static bindEvents(modalElement) {
        ModalBinder.bindEvents(modalElement);

        const serverUrlInputElement = modalElement.querySelector('#server');
        const loadDatabaseButtonElement = modalElement.querySelector('#loadDatabaseId');
       
        serverUrlInputElement.addEventListener('keyup', (e) => {
            const className = 'disabled';
            
            //TODO: improve validation
            if(serverUrlInputElement.value.length > 0) {
                loadDatabaseButtonElement.classList.remove(className);
            } else {
                loadDatabaseButtonElement.classList.add(className);
            }
        });

        loadDatabaseButtonElement.addEventListener('click', (e) => {
            HttpRequestManager.getAsAnonymous(serverUrlInputElement.value +'/Server/DBList.aspx')
            .then((response) => {
                    const domParser = new DOMParser();
                    const xmlDoc = domParser.parseFromString(response, 'text/xml');

                    reinitDatabaseSelect([...xmlDoc.getElementsByTagName('DB')]);
                }
            ).catch((err) => {                
                M.toast({ html: 'Please check your Server URL or internet connection.' });
                reinitDatabaseSelect();
                console.log(err);
            });
        });

        const reinitDatabaseSelect = (optionsList) => {
            let databaseSelectElement = LoginModalBinder.ModalElement.querySelector('#database');
            databaseSelectElement.innerHTML = '';
            if (optionsList && optionsList.length > 0) {
                optionsList.forEach(
                    (x) => databaseSelectElement.append(new Option(x.id, x.id))
                );
            }
            M.FormSelect.init(databaseSelectElement);
        } 
    }
}

LoginModalBinder.bindEvents(LoginModalBinder.ModalElement);