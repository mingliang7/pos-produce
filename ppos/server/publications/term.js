import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {Terms} from '../../imports/api/collections/terms.js';

Meteor.publish('ppos.term', function cementTerm(selector, options) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let data = Terms.find(selector, options);

        return data;
    }

    return this.ready();
});

