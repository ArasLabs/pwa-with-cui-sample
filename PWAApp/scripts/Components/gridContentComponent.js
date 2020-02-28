import HttpRequestManager from '../httpRequestManager.js';
import CUIManager from '../Helpers/cuiManager.js';

let skip = 0;
const pageCount = 10;

export default class GridContentComponent {
    constructor(containerSelector, templateSelector, templateComponent, cuiSelector, query) {
        this.containerSelector = containerSelector;
        this.templateSelector = templateSelector;
        this.templateComponent = templateComponent;
        this.cuiSelector = cuiSelector;
        this.query = query;
    }

    init() {}

    initGrid() {}

    async renderGridRows(data) {
        const fragment = document.createDocumentFragment();
        const containerElement = document.querySelector(this.containerSelector);
        let cuiElements = await CUIManager.getCUIForLocation("PWA.ItemEntry");

        data.forEach(item => {
            const templateComponentInstance = new this.templateComponent(item, this.containerSelector, this.templateSelector);
            templateComponentInstance.reloadGrid = () => { this.clear(); this.init(); } 
            let newComponent = templateComponentInstance.getComponent();
            if (this.cuiSelector) {
                CUIManager.buildUIForContainer(cuiElements, newComponent, this.cuiSelector, templateComponentInstance);
            }
            fragment.appendChild(newComponent);
        });

        containerElement.appendChild(fragment);

        const tooltipEls = containerElement.querySelectorAll('[data-tooltip]');
        M.Tooltip.init(tooltipEls);
    }

    clear() {
        const containerElement = document.querySelector(this.containerSelector);
        containerElement.innerHTML = '';
    }

    responseHandler(responseData) { return responseData; }

    loadData() {
        let initQuery = arasQueryBuilder(this.query, skip, pageCount);

        return HttpRequestManager.get(HttpRequestManager.BaseUrl + initQuery).then(
            (result) => {
                const data = this.responseHandler(result);
                skip += data.length;
                
                return data;
            }).catch((err) => {
                console.log(err);
                return [];
        });
    }
}

function arasQueryBuilder(query, skip = 0, top = pageCount) {
    return `/server/odata/${query.itemTypeName}?$expand=${query.expand}&$select=${query.selector}&$skip=${skip}&$top=${top}`;
}