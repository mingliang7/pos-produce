//
import {Meteor} from 'meteor/meteor';
//collections
import {RequirePassword} from '../../imports/api/collections/requirePassword';

Meteor.publish('cement.requirePassword', function cementrequirePassword(selector) {
    if(this.userId) {
        Meteor._sleepForMs(200);
        let requirePasswords = RequirePassword.find(selector);
        return requirePasswords;
    }
    return this.ready();
});