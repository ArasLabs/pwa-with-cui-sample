import ModalBinder from './modalBinder.js';
import Component from '../Components/component.js';

const updateItemModalElement = '#updateItemModal';
const modalContentSelector = `${updateItemModalElement} .modal-content`;

export default class UpdateItemModalBinder extends ModalBinder {
    static get ModalElement() {
        return document.querySelector(updateItemModalElement);
    }

    constructor(item, templateSelector) {
        super(item, UpdateItemModalBinder.ModalElement);

        this.updateItemViewModel = new Component(item, modalContentSelector, templateSelector);
        this.updateItemViewModel.render(true);
    }

    close() {
        super.close();
        this.updateItemViewModel.clear();
    }
}

UpdateItemModalBinder.bindEvents(UpdateItemModalBinder.ModalElement);