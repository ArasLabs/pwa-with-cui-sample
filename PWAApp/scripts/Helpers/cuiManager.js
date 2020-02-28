
import HttpRequestManager from '../httpRequestManager.js';
import CommandBarItem from '../Models/commandBarItem.js';
import CommandBarSection from '../Models/commandBarSection.js';
import CommandBarSectionItem from '../Models/commandBarSectionItem.js';

// We're using a method instead of a straight REST call because the REST API isn't flexible enough to easily handle the CommandBarItem PolyItem
const commandBarSectionQueryByLocation = '/server/odata/method.labs_GetCUIforLocation';

// We were previously planning on doing queries for each type of CUI element, but this
// isn't necessary since we can get non-poly properties by just including them in the select of our query

export default class CUIManager {
    constructor() {
    }

    // Build the UI elements
    static buildUIForContainer(cmdBarSection, container, cuiSelector, objectContext) {
        const cuiContainer = container.querySelector(cuiSelector);
        let items = cmdBarSection.commandBarSectionItems;
        
        items.forEach((cmdBarItem) => {
            let builtButton = this.buildButton(cmdBarItem, objectContext);
            cuiContainer.appendChild(builtButton);
        });
    }

    static buildButton(cmdBarItem, objectContext) {
        const cmdBarButton = cmdBarItem.relatedItem.Item;
        const cmdBarDetails = JSON.parse(cmdBarButton.additional_data);
        const fragment = document.createDocumentFragment();

        // build the button
        const button = document.createElement('span');
        const icon = document.createElement('i');
        icon.setAttribute("class", "material-icons");
        icon.innerText = cmdBarDetails.icon;
        button.appendChild(icon);

        if (cmdBarButton.label && cmdBarButton.label["#text"] && cmdBarButton.label["#text"] !== "") {
            icon.setAttribute("class", `${icon.getAttribute("class")} left`);
            const buttonLabel = document.createTextNode(cmdBarButton.label["#text"]);
            button.appendChild(buttonLabel);
        }

        // set up the events
        var inArgs = {
            context: objectContext
        };

        // init event
        if (cmdBarButton.on_init_handler && cmdBarButton.on_init_handler.Item && cmdBarButton.on_init_handler.Item.method_type === 'JavaScript') {
            var initHandler = new Function("inArgs", cmdBarButton.on_init_handler.Item.method_code);
            var res = initHandler(inArgs);
            // Let's assume this returns a true/false value. If true, enable the button. If false, disable it.
            if (!res) {
                button.setAttribute("disabled", "");
            }
        }

        // click event
        if (cmdBarButton.on_click_handler && cmdBarButton.on_click_handler.Item && cmdBarButton.on_click_handler.Item.method_type === 'JavaScript') {
            var clickHandler = new Function("e", "inArgs", cmdBarButton.on_click_handler.Item.method_code);
            button.addEventListener('click', function(e) {
                clickHandler(e, inArgs);
            });
        }

        if (cmdBarDetails.attributes && cmdBarDetails.attributes.length > 0) {
            cmdBarDetails.attributes.forEach((att) => {
                button.setAttribute(att.name, att.value);
            });
        }

        fragment.appendChild(button);

        return fragment;
    }

    // Get the CUI Items for this user at a specific location
    static getCUIForLocation(location) {
        return HttpRequestManager.post(HttpRequestManager.BaseUrl + commandBarSectionQueryByLocation, {
            location: location
        }).then((result) => {
            if (!result || !result.Item) {
                console.log(`CommandBarSection with location ${this.location} was not found.`);
                return;
            }

            // We're expecting only one entry per location. This might change in the future if we expect ItemTypes to define their own CUI sections.
            const item = result.Item;
            let commandBarSectionItems = [];

            if (item.Relationships) {
                if (item.Relationships.Item instanceof Array) {
                    item.Relationships.Item.forEach(cbsItem => {
                        commandBarSectionItems.push(new CommandBarSectionItem(cbsItem.id
                            , cbsItem.related_id['@aras.type']
                            , cbsItem.related_id.name
                            , cbsItem.sort_order
                            , cbsItem.action
                            , (cbsItem.alternate ? cbsItem.alternate.name : '')
                            , cbsItem.related_id
                        ));
                    });
                } else if (item.Relationships.Item instanceof Object) {
                    let cbsItem = item.Relationships.Item;
                    commandBarSectionItems.push(new CommandBarSectionItem(cbsItem.id
                        , cbsItem.related_id['@aras.type']
                        , cbsItem.related_id.name
                        , cbsItem.sort_order
                        , cbsItem.action
                        , (cbsItem.alternate ? cbsItem.alternate.name : '')
                        , cbsItem.related_id
                    ));
                }
            }

            return new CommandBarSection(item['@aras.id']
                , item.name
                , item.location.name
                , item.classification
                , commandBarSectionItems
            );
        });
    }
}