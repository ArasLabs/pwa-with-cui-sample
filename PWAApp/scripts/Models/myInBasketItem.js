export default class MyInBasketItem {
    constructor(id, type, activity, instructions, assigned_to, status, workItemNumber, workItemType, workItemId, start_date, due_date) {
        this.id = id;
        this.type = type;
        this.activity = activity;
        this.instructions = instructions;
        this.assigned_to = assigned_to;
        this.status = status;
        this.workItemNumber = workItemNumber;
        this.workItemType = workItemType;
        this.workItemId = workItemId;
        this.short_start_date = formatDate(start_date, true);
        this.short_due_date = formatDate(due_date, true);
        this.start_date = formatDate(start_date, false);
        this.due_date = formatDate(due_date, false);
        this.due_status = "green";
        this.days_til_due = "";
        let days_until_due = daysFromToday(due_date);
        this.setDueValues(days_until_due);

        this.workItem = {};
        this.activityItem = null;
    }
    
    setDueValues(days_until_due) {
        if (days_until_due === 0) {
            // Due today
            this.days_til_due = "DUE TODAY";
            this.due_status = "orange";
        } else if (days_until_due < 0) {
            // Overdue
            this.days_til_due = `${days_until_due * -1} DAYS OVERDUE`;
            this.due_status = "red";
        } else {
            // Due in the future
            this.days_til_due = "";
            this.due_status = "green";
        }
    }
}

function formatDate(date, justTheDate) {
    // Check for blank date
    if (date === '') {
        return '';
    }
    let dt = new Date(date);
    if (justTheDate) {
        return dt.toLocaleDateString();
    } else {
        return dt.toLocaleString();
    }
}

function daysFromToday(date) {
    // Check for blank date
    if (date === '') {
        return '';
    }
    
    const msInDay = (1000 * 3600 * 24);

    let todays_date = new Date();
    let dt = new Date(date);
    let ms_diff = dt - todays_date;
    let day_diff = Math.round(ms_diff / msInDay);
    return day_diff;
}