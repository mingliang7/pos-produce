import {Security} from 'meteor/ongoworks:security';
import {Roles} from 'meteor/alanning:roles';

// Setting
Security.defineMethod("PPOS_ifSetting", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['setting'], 'PPOS');
    }
});

// Data Entry
Security.defineMethod("PPOS_ifDataInsert", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-insert'], 'PPOS');
    }
});

Security.defineMethod("PPOS_ifDataUpdate", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-update'], 'PPOS');
    }
});

Security.defineMethod("PPOS_ifDataRemove", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-remove'], 'PPOS');
    }
});

// Report
Security.defineMethod("PPOS_ifReporter", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['reporter'], 'PPOS');
    }
});
