import {Security} from 'meteor/ongoworks:security';
import {Roles} from 'meteor/alanning:roles';

// Setting
Security.defineMethod("Cement_ifSetting", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['setting'], 'Cement');
    }
});

// Data Entry
Security.defineMethod("Cement_ifDataInsert", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-insert'], 'Cement');
    }
});

Security.defineMethod("Cement_ifDataUpdate", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-update'], 'Cement');
    }
});

Security.defineMethod("Cement_ifDataRemove", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-remove'], 'Cement');
    }
});

// Report
Security.defineMethod("Cement_ifReporter", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['reporter'], 'Cement');
    }
});
