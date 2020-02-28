import ModalBinder from './modalBinder.js';
import Component from '../Components/component.js';

const showItemModalSelector = '#showItemModal';
const modalContentSelector = `${showItemModalSelector} .modal-content`;

export default class ShowItemModalBinder extends ModalBinder {
    static get ModalElement() {
        return document.querySelector(showItemModalSelector);
    }

    constructor(item, templateSelector) {
        super(item, ShowItemModalBinder.ModalElement);
        
        this.showItemViewModel = new Component(item, modalContentSelector, templateSelector);
        this.showItemViewModel.render(true);
    }

    close() {
        super.close();
        this.showItemViewModel.clear();
    }
}

ShowItemModalBinder.bindEvents(ShowItemModalBinder.ModalElement);