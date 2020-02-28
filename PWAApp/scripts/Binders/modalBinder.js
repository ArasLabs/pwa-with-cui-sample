export default class ModalBinder { 
    static resolveFunc() {};
    static rejectFunc() {};
    static catchFunc() {};

    static get Item() {
        return ModalBinder._item;
    }

    static set Item(item) {
        ModalBinder._item = item;
    }

    constructor(item, modalElement) {
        ModalBinder.Item = item;
        this.instance = M.Modal.getInstance(modalElement);

        this.init(item);
    }

    show() {
        this.instance.open();

        return  {
            then: (resolve, reject) =>
            {
                ModalBinder.resolveFunc = resolve;
                ModalBinder.rejectFunc = reject;

                return {
                    catch: (catchFunc) => {
                        ModalBinder.catchFunc = catchFunc;
                    }
                }
            }
        };
    }

    close() {
        ModalBinder.Item = null;
        this.instance.close();
    }

    init(item) { return item; }

    static bindEvents(modalElement) {
        const okButtonElement = modalElement.querySelectorAll('.acceptBtn');
        okButtonElement.forEach(
            (element) => element.addEventListener('click',
                (e) => {
                    element.disabled = true;
                    element.classList.add("disabled");
                    try {
                        ModalBinder.resolveFunc(ModalBinder.Item);
                    } catch(err)
                    {
                        ModalBinder.catchFunc(err);
                    } finally {
                        element.disabled = false;
                        element.classList.remove("disabled");
                    }
                }
            )
        );
        
        const closeButtonElement = modalElement.querySelectorAll('.cancelBtn');
        closeButtonElement.forEach(
            (element) => element.addEventListener('click',
                (e) => {
                    element.disabled = true;
                    element.classList.add("disabled");
                    try {
                        ModalBinder.rejectFunc(ModalBinder.Item);
                    } catch(err)
                    {
                        ModalBinder.catchFunc(err);
                    } finally {
                        element.disabled = false;
                        element.classList.remove("disabled");
                    }
                }
            )
        );
    }
}

ModalBinder._item = null;