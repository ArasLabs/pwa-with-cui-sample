import MyInBasketItemComponent from './MyInBasketItemComponent.js';
import GridContentComponent from './GridContentComponent.js';
import HttpRequestManager from '../httpRequestManager.js';
import MyInBasketItem from '../Models/myInBasketItem.js'
import CUIManager from '../Helpers/cuiManager.js'

const pageSelector = "#myInBasketItem";
const containerSelector = "#myInBasketItemRowContainer";
const templateSelector = "#myInBasketItemCardTemplate";
const cuiSelector = '.manage-item-row-buttons-container';
const toolbarSelector = '.manage-items-toolbar-container';
const query = '/server/odata/method.GetActiveInBasketTaskForCurrentU';

export default class MyInBasketItemPage extends GridContentComponent {
    constructor() {
        super(containerSelector, templateSelector, MyInBasketItemComponent, cuiSelector);
        this.pageElement = document.querySelector(pageSelector);
        
        this.renderCUIToolbar();
        this.init();
    }

    init() {
        const renderGridRowsBinded = this.renderGridRows.bind(this);
        this.loadData().then(data => renderGridRowsBinded(data));
    }

    async renderCUIToolbar() {
        let toolbarElements = await CUIManager.getCUIForLocation("PWA.Toolbar");
        CUIManager.buildUIForContainer(toolbarElements, this.pageElement, toolbarSelector, this);
    }

    refresh() {
        // Wipe the current grid
        this.clear();
        // Rebuild it
        this.init();
    }

    loadData() {
        return HttpRequestManager.post(HttpRequestManager.BaseUrl + query)
            .then(this.responseHandler)
            .catch((err) => {
                console.log(err);
                return [];
            });
    }

    responseHandler(responseData) {
        // If/Else here is necessary to handle case where user only has one Task assigned.
        if (responseData.Item instanceof Array) { 
            return responseData.Item.reduce((acc, item) => { 
                acc.push(new MyInBasketItem(item['@aras.id'] 
                    , item.id.Item['@aras.type'] 
                    , item.name 
                    , item.instructions && !item.instructions['@aras.is_null'] ? item.instructions : 'No instructions'
                    , item.assigned_to['@aras.keyed_name'] 
                    , item.status 
                    , item.item["@aras.keyed_name"] 
                    , item.item["@aras.type"]                 
                    , item.item["#text"] 
                    , item.start_date && !item.start_date['@aras.is_null'] ? item.start_date : ''
                    , item.due_date && !item.due_date['@aras.is_null'] ? item.due_date : '')
                ); 
                return acc; 
            }, []) 
        } else if (responseData.Item instanceof Object) { 
            let item = responseData.Item; 
            return [new MyInBasketItem(item['@aras.id'] 
                    , item.id.Item['@aras.type'] 
                    , item.name 
                    , item.instructions 
                    , item.assigned_to['@aras.keyed_name'] 
                    , item.status 
                    , item.item["@aras.keyed_name"] 
                    , item.item["@aras.type"]                 
                    , item.item["#text"] 
                    , item.start_date && !item.start_date['@aras.is_null'] ? item.start_date : ''
                    , item.due_date && !item.due_date['@aras.is_null'] ? item.due_date : '')]; 
        } 
    }

    static wipeAll() {
        // Clear the toolbar
        const toolbar = document.querySelector(toolbarSelector);
        toolbar.innerHTML = "";

        // clear the grid
        const container = document.querySelector(containerSelector);
        container.innerHTML = "";
    }
}