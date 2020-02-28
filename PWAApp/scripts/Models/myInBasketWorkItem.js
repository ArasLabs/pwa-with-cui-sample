export default class MyInBasketWorkItem {
    constructor(id, item_number, title, status, reason, priority, description, start_date, due_date) {
        this.id = id;
        this.item_number = item_number;
        this.title = title;
        this.status = status;
        this.reason = reason;
        this.priority = priority;
        this.description = description;
        this.start_date = start_date;
        this.due_date = due_date;
    }
}