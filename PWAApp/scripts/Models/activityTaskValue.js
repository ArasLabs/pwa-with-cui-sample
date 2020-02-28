export default class ActivityTaskValue {
    constructor(id, task, completed_by) {
        this.id = id;
        this.task = task;
        this.completed_by = completed_by;
    }
}