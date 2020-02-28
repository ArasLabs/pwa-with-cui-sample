import ModalBinder from './modalBinder.js';
import Component from '../Components/component.js';
import HttpRequestManager from '../httpRequestManager.js';

const WorkflowActivityCompletionModalSelector = '#workflowActivityCompletionModal';
const SaveChangesBtnSelector = '.saveChangesBtn';
const ModalContentSelector = `${WorkflowActivityCompletionModalSelector} .modal-content`;
const query = '/server/odata/method.EvaluateActivity';

export default class WorkflowActivityCompletionModalBinder extends ModalBinder {
    static get ModalElement() {
        return document.querySelector(WorkflowActivityCompletionModalSelector);
    }

    constructor(item, templateSelector) {
        super(item, WorkflowActivityCompletionModalBinder.ModalElement);
        
        this.showItemViewModel = new Component(item, ModalContentSelector, templateSelector);
        this.showItemViewModel.render(true);

        let activityTaskSelectElement = this.instance.el.querySelector('#activityTask');
        activityTaskSelectElement.innerHTML = '';
        activityTaskSelectElement.append(new Option('', ''));

        const wpp = WorkflowActivityCompletionModalBinder.Item.activityItem.workflowProcessPath;
        if (wpp && wpp.length > 0) {
            wpp.forEach((x) => activityTaskSelectElement.append(new Option(x.name, x.id)));
        }

        M.FormSelect.init(activityTaskSelectElement);
    }

    static bindEvents(modalElement) {
        ModalBinder.bindEvents(modalElement);
        const self = this;

        const saveChangesBtn = modalElement.querySelector(SaveChangesBtnSelector);
        saveChangesBtn.addEventListener('click', (e) => {
            if(self.Item.status !== 'Active') {
                M.toast({ html: 'The activity must be in an active state.'});
                return;
            }

            saveChangesBtn.disabled = true;
            saveChangesBtn.classList.add("disabled");
            const activityItem = self.Item.activityItem;
            const activityAssignment = activityItem.activityAssignment;

            const activityPaths = [];
            let activityTaskSelectElement = modalElement.querySelector('#activityTask');
            if(activityTaskSelectElement && activityTaskSelectElement.options[activityTaskSelectElement.selectedIndex].value) {            
                activityPaths.push({ '@id' : activityTaskSelectElement.options[activityTaskSelectElement.selectedIndex].value });
            } else {
                activityPaths.push({ '@id': activityItem.workflowProcessPath[0].id });
            }
    
            const activityTasks = activityItem.activityTask.reduce((acc, item) => {
                acc.push({ '@id' : item.id,  '@completed': item.is_completed });
                return acc;
            }, []);


            const dataObject = {
                Activity : activityItem.id,
                ActivityAssignment : activityAssignment.id,
                Paths : {
                    Path: activityPaths
                },
                Tasks: {
                  Task: activityTasks
                },
                Variables: null,
                Authentication: null,
                Comments : activityAssignment.comments,
                Complete : "0"
            }

            HttpRequestManager.post(HttpRequestManager.BaseUrl + query, dataObject)
                .then(res => {
                    saveChangesBtn.disabled = false;
                    saveChangesBtn.classList.remove("disabled");
                })
                .catch((err) => {
                    console.log(err);
                    saveChangesBtn.disabled = false;
                    saveChangesBtn.classList.remove("disabled");
                });
        });
    }

    close() {
        super.close();
        this.showItemViewModel.clear();
    }
}

WorkflowActivityCompletionModalBinder.bindEvents(WorkflowActivityCompletionModalBinder.ModalElement);