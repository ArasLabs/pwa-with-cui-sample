export default class CommandBarSection {
    constructor(id, name, location, classification, commandBarSectionItems) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.classification = classification;
        this.commandBarSectionItems = commandBarSectionItems || [];
    }
}