import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {Vendors} from '../../imports/api/collections/vendor.js';

Meteor.publish('cement.vendor', function cementVendor(selector, options) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let data = Vendors.find(selector, options);

        return data;
    }

    return this.ready();
});
