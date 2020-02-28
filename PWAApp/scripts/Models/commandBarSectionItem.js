export default class CommandBarSectionItem {
    constructor(id, itemType, name, sort_order, action, alternate, relatedItem) {
        this.id = id;
        this.itemType = itemType;
        this.name = name;
        this.sort_order = sort_order;
        this.action = action;
        this.alternate = alternate;
        this.relatedItem = relatedItem;
    }
}