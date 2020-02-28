import ModalBinder from './modalBinder.js';
import Component from '../Components/component.js';

const addNewItemModalSelector = '#addNewItemModal';
const modalContentSelector = `${addNewItemModalSelector} .modal-content`;

export default class AddNewItemModalBinder extends ModalBinder {
    static get ModalElement() {
        return document.querySelector(addNewItemModalSelector);
    }

    constructor(item, templateSelector) {
        super(item, AddNewItemModalBinder.ModalElement);
        
        const addNewItemViewModel = new Component(AddNewItemModalBinder.Item, modalContentSelector, templateSelector);
        addNewItemViewModel.render(true);
    }
}

AddNewItemModalBinder.bindEvents(AddNewItemModalBinder.ModalElement);