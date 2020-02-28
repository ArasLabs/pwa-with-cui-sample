import ModalBinder from './modalBinder.js';

const nameSelector = '#name';
const removeItemModalSelector = '#removeItemModal';

export default class RemoveItemModalBinder extends ModalBinder {
    static get ModalElement() {
        return document.querySelector(removeItemModalSelector);
    }

    constructor(item) {
        super(item, RemoveItemModalBinder.ModalElement);
    }

    init(item) {
        this.nameElement = RemoveItemModalBinder.ModalElement.querySelector(nameSelector);
        this.nameElement.innerText = item.name;
    }

    close() {
        super.close();
        this.nameElement.innerText = '';
    }
}

RemoveItemModalBinder.bindEvents(RemoveItemModalBinder.ModalElement);