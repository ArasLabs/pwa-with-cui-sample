export default class Activity {
    constructor(id, workItemName, activity, activityAssignment, activityTask, activityVariable, workflowProcessPath) {
        this.id = id;
        this.workItemName = workItemName;
        this.activity = activity;
        this.activityAssignment = activityAssignment;
        this.activityTask = activityTask;
        this.activityVariable = activityVariable;
        this.workflowProcessPath = workflowProcessPath;
    }
}