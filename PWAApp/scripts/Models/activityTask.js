export default class ActivityTask {
    constructor(id, sequence, is_required, description, is_completed) {
        this.id = id;
        this.sequence = sequence;
        this.is_required = is_required;
        this.description = description;
        this.is_completed = is_completed;
    }
}