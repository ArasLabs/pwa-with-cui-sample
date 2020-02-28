export default class User {
    static get Id() {
        return this._id;
    }

    static set Id(id) {
        this._id = id;
    }

    static get Name() {
        return this._name;
    }

    static set Name(name) {
        this._name = name;
    }

    static get IdentityName() {
        return this._identityName;
    }

    static set IdentityName(identityName) {
        this._identityName = identityName;
    }
    
    static get IdentityId() {
        return this._identityId;
    }

    static set IdentityId(identityId) {
        this._identityId = identityId;
    }

    static init(id, name, identityId, identityName) {
        this._id = id;
        this._name = name;
        this._identityId = identityId;
        this._identityName = identityName;
    }

    static clear() {
        this.id = "";
        this._name = "";
        this._identityName = "";
        this._identityId = "";
    }
}

User._id = "";
User._name = "";
User._identityName = "";
User._identityId = "";