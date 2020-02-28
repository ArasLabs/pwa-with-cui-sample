export default class Component {
    constructor(item, containerSelector, templateSelector){
        this.item = item;
        this.container = document.querySelector(containerSelector);
        this.template = document.querySelector(templateSelector);
    }

    render(replace) {
        const templateInstance = this.getComponent();
        if (replace) {
            this.clear();
        }

        this.container.appendChild(templateInstance);

        const tooltipEls = this.container.querySelectorAll('[data-tooltip]');
        M.Tooltip.init(tooltipEls);
    }

    clear() {
        this.container.innerHTML = '';
    }

    getComponent() {
        if('content' in document.createElement('template')) {
            const component = document.importNode(this.template.content, true);
            component.firstElementChild.setAttribute('data-id-binding', this.item.id);

            this._bindEvents(component);
            this._bindProperties(component);
            this._bindAttributes(component);
            this._bindClasses(component);

            return component;
        } else {
            console.error('Your browser does not support templates');
            return '';
        }
    }

    _bindEvents(templateInstance) {
        let elements = templateInstance.querySelectorAll('[data-event-handler]');

        for(let i = 0; i < elements.length; ++i) {
            let element = elements[i];
            const handler = element.dataset.eventHandler;
            const type = element.dataset.eventType;

            if(handler in this) {
                element.addEventListener(type, (e) => {
                                                element.disabled = true;
                                                element.classList.add("disabled");
                                                new Promise(resolve => { 
                                                    this[handler](resolve); 
                                                    }).then(() => {
                                                        element.disabled = false;
                                                        element.classList.remove("disabled");
                                                    }).catch(() => {
                                                        element.disabled = false;
                                                        element.classList.remove("disabled");
                                                    }
                                                );
                                        }
                );

                continue;
            }

            const templateDesc = this.template.cloneNode(false);
            console.error(`The handler with name - '${handler}' is not defined in contex for '${this.constructor.name}', template described as '${templateDesc.outerHTML}'`);
        }
    }

    _bindProperties(templateInstance) {
        var self = this;

        modelPropertyBinding(self.item, templateInstance);
        for(var propertyName in self.item) {
            const propertyNameLocal = propertyName;
            let elements = templateInstance.querySelectorAll(`[data-property-binding='${propertyNameLocal}']`);

            if(elements && elements.length > 0) {
                for(let element of elements) { 
                    bindProperty(self.item, propertyNameLocal, element);
                }
            }
        }
    }

    _bindAttributes(templateInstance) {
        let elements = templateInstance.querySelectorAll(`[data-attribute-binding]`);

        if(elements && elements.length > 0) {                
            for(let element of elements) {
                const propertyName = element.dataset.attributeBinding;
                const attributeName = element.dataset.attributeName;

                if(attributeName && propertyName && this.item.hasOwnProperty(propertyName) && this.item[propertyName]) {                    
                    element.setAttribute(attributeName, this.item[propertyName]);
                }
            }
        }
    }

    _bindClasses(templateInstance) {
        let elements = templateInstance.querySelectorAll(`[data-class-binding]`);

        if (elements && elements.length > 0) {
            for (let element of elements) {
                const propertyName = element.dataset.classBinding;
                const classModifier = element.dataset.classModifier || "";

                if (propertyName && this.item.hasOwnProperty(propertyName) && this.item[propertyName]) {
                    element.setAttribute("class", `${element.getAttribute("class")} ${this.item[propertyName]}${classModifier}`);
                }
            }
        }
    }
}

function modelPropertyBinding(item, componentTemplate) {
    let elements = componentTemplate.querySelectorAll('[data-model-property-binding*="."]');

    if(elements && elements.length > 0) {
        for(let element of elements) {
            const modelPropertyBinding = element.dataset.modelPropertyBinding;
            const navigationPropNames = modelPropertyBinding.split('.');
            let prop = item;
            for(let i = 0; i < navigationPropNames.length - 1; ++i) {
                const propName = navigationPropNames[i];
                if(prop && prop.hasOwnProperty(propName)) {
                    prop = prop[propName]
                } else {
                    console.error(`Property with name ${propName} from navigation modelPropertyBinding: ${modelPropertyBinding} was not found`);
                    return;
                }
            }

            bindProperty(prop, navigationPropNames[navigationPropNames.length - 1], element);
        }
    }
}

function bindProperty(item, propName, element) {
    const tootipAtr = 'data-tooltip';
    const value = item[propName] || '';

    if(element.hasAttribute(tootipAtr)) {
        element.setAttribute(tootipAtr, value);
        if(!value) {
            element.removeAttribute(tootipAtr);
        }
    }

    if ('value' in element) {
        if(element.type === 'checkbox') {
            element.checked = !!+value;
        } else {
            element.value = value;
        }
        element.onchange = () => {
            if(element.type === 'checkbox') {
                item[propName] = element.checked ? "1" : "0";
                return;
            }

            item[propName] = element.value; 
        }
        return;
    }

    element.textContent = value;
}