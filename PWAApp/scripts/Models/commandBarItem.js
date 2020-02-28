//TODO: factory for creating special CommandBarItem(CommandBarButton, CommandBarMenuButton, etc)

export default class CommandBarItem {
    constructor(id, type, name, on_init_handler, on_click_handler) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.on_init_handler = on_init_handler;
        this.on_click_handler = on_click_handler;
    }
}