import Component from './component.js';
import GridContentComponent from  './gridContentComponent.js';
import ShowItemModalBinder from '../Binders/showItemModalBinder.js';
import WorkflowActivityCompletionModalBinder from '../Binders/workflowActivityCompletionModalBinder.js';
import HttpRequestManager from '../httpRequestManager.js';

import MyInBasketWorkItem from '../Models/myInBasketWorkItem.js';
import Activity from '../Models/activity.js';
import ActivityAssignment from '../Models/activityAssignment.js';
import ActivityTask from '../Models/activityTask.js';
import ActivityTaskValue from '../Models/activityTaskValue.js';
import ActivityVariable from '../Models/activityVariable.js';
import WorkflowProcessPath from '../Models/workflowProcessPath.js';


const showMyInBasketItemTemplateSelector = "#showMyInBasketItemTemplate";
const workItemDetailsContainerSelector = "#workItemDetailsContainer";
const workItemDetailsTemplataSelector = "#workItemDetailsTemplate";

const workflowActivityCompletionTemplateSelector = "#workflowActivityCompletionTemplate";
const activityTaskRowContainerSelector = "#activityTasksRowContainer";
const activityTaskRowTemplateSelector = "#activityTaskRowTemplate";


const getActivityQuery = (activityAssignmentId) => '/server/odata/Activity'
                                        + `?$filter=[Activity Assignment]/id eq '${activityAssignmentId}'`
                                        + '&$expand=Activity Assignment($expand=Activity Task Value($select=id,task,completed_by))'
                                        +           ',Activity Task($select=id,sequence,is_required,description),Activity Variable,Workflow Process Path($select=id,name)'
                                        + '&$select=id,name';


const completeQuery = '/server/odata/method.EvaluateActivity';

export default class myInBasketItemComponent extends Component{
    constructor(item, containerSelector, templateSelector) {
        super(item, containerSelector, templateSelector);
    }

    showItem(resolve) {
        let self = this;
        const showItemModalBinder = new ShowItemModalBinder(self.item, showMyInBasketItemTemplateSelector);

        // Only run this if the work item isn't already loaded
        loadWorkItem(self.item.workItemType, self.item.workItemId).then((res) => {
            res.start_date = self.item.start_date;
            res.due_date = self.item.due_date;
            self.item.workItem = res;

            const workItemViewModel = new Component(res, workItemDetailsContainerSelector, workItemDetailsTemplataSelector);
            workItemViewModel.render(true);

            showItemModalBinder.show().then(
                (item) => { },
                (item) => {
                    workItemViewModel.clear();
                    showItemModalBinder.close();
                }
            );
            // resolve();
        }).catch((err) => {
            console.error(self.constructor.name, err);
            // resolve();
        });
    }

    voteItem(resolve) {
        let self = this;
        const element = this.container.querySelector(`[data-id-binding='${self.item.id}']`)

        loadActivityItem(self.item.id, self.item.activity).then((res) => {
            self.item.activityItem = res;

            const workflowActivityCompletionModalBinder = new WorkflowActivityCompletionModalBinder(self.item, workflowActivityCompletionTemplateSelector);        
            const activityTaskItemGrid = new GridContentComponent(activityTaskRowContainerSelector, activityTaskRowTemplateSelector, Component);
            activityTaskItemGrid.renderGridRows(res.activityTask);

            M.updateTextFields();
            workflowActivityCompletionModalBinder.show().then(
                (item) => {
                    if(item.status !== 'Active') {
                        M.toast({ html: 'The activity must be in an active state.'});
                        return;
                    }

                    const activityItem = item.activityItem;
                    const activityAssignment = activityItem.activityAssignment;
        
                    const activityPaths = [];
                    let activityTaskSelectElement = workflowActivityCompletionModalBinder.instance.el.querySelector('#activityTask');
                    if(activityTaskSelectElement && activityTaskSelectElement.options[activityTaskSelectElement.selectedIndex].value) {            
                        activityPaths.push({ '@id' : activityTaskSelectElement.options[activityTaskSelectElement.selectedIndex].value });
                    }
            
                    const activityTasks = activityItem.activityTask.reduce((acc, item) => {
                        acc.push({ '@id' : item.id,  '@completed': item.is_completed });
                        return acc;
                    }, []);
                  
                    HttpRequestManager.post(HttpRequestManager.BaseUrl + completeQuery, {
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
                        Complete : '1'
                    }).then(x => {
                        self.reloadGrid();
                        activityTaskItemGrid.clear();
                        workflowActivityCompletionModalBinder.close();
                    }).catch(err => {                        
                        console.error('Error by voting item:', err);                        
                        M.toast({ html: `Error by voting item: ${err}`});
                    });
                 },
                (item) => {
                    activityTaskItemGrid.clear();
                    workflowActivityCompletionModalBinder.close();
                }
            );
            // resolve();
        }).catch((err) => {
            console.error(self.constructor.name, err);
            // resolve();
        });
    }

    reloadGrid() {}
}

function loadWorkItem(workItemType, workItemID) {
    return HttpRequestManager.get(HttpRequestManager.BaseUrl + `/server/odata/${workItemType}('${workItemID}')`).then(
        (result) => {
            return new MyInBasketWorkItem(result.id
                , result.item_number
                , result.title || ''
                , result.state  || ''
                , result.reason || ''
                , result.priority || ''
                , result.description
                , ''
                , '' )
        }
    );
}

function loadActivityItem(workItemID, activity) {
    return HttpRequestManager.get(HttpRequestManager.BaseUrl + getActivityQuery(workItemID)).then(
        (result) => {
            if(!result || !result.value || result.value.length === 0) {
                console.log('Error by loading "Workflow Activity Completion" data.');
                throw 'Error by loading "Workflow Activity Completion" data.';
            }

            const item = result.value[0]
                , activityAssignment = []
                , activityTask = []
                , activityVariable = []
                , workflowProcessPath = [];

            if(item['Activity Assignment'] && item['Activity Assignment'].length > 0) {
                item['Activity Assignment'].forEach(activityAssignmentItem => {
                        if(activityAssignmentItem && activityAssignmentItem['Activity Task Value'].length > 0) {
                        let activityTaskValue = [];
                        activityAssignmentItem['Activity Task Value'].forEach(activityTaskValueItem => {
                            activityTaskValue.push(new ActivityTaskValue(activityTaskValueItem.id
                                , activityTaskValueItem['task@aras.keyed_name']
                                , activityTaskValueItem['completed_by@aras.keyed_name'] || ''
                            ));
                        });

                        activityAssignment.push(new ActivityAssignment(activityAssignmentItem.id
                                , activityAssignmentItem.comments || ''
                                , activityTaskValue
                            )
                        );
                    }
                });
            }

            if(item['Activity Task'] && item['Activity Task'].length > 0) {
                item['Activity Task'].forEach(activityTaskItem => {
                    activityTask.push(new ActivityTask(activityTaskItem.id
                            , activityTaskItem.sequence
                            , activityTaskItem.is_required
                            , activityTaskItem.description
                            , activityAssignment[0].activityTasksValues.some(x => x.task === activityTaskItem.id && x.completed_by) ? "1" : "0"
                        )
                    );
                });
            }

            if(item['Activity Variable'] && item['Activity Variable'].length > 0) {
                item['Activity Variable'].forEach(activityVariableItem => {
                    activityVariable.push(new ActivityVariable(activityVariableItem.id
                        )
                    );
                });
            }

            if(item['Workflow Process Path'] && item['Workflow Process Path'].length > 0) {
                item['Workflow Process Path'].forEach(workflowProcessPathItem => {
                    workflowProcessPath.push(new WorkflowProcessPath(workflowProcessPathItem.id
                            , workflowProcessPathItem.name
                        )
                    );
                });
            }

            return new Activity(item.id
                , activity
                , item.name
                , activityAssignment && activityAssignment.length > 0 ? activityAssignment[0] : null
                , activityTask
                , activityVariable
                , workflowProcessPath
            );
        }
    );
}