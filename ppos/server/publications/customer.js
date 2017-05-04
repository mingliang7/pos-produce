import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {Customers} from '../../imports/api/collections/customer.js';

Meteor.publish('ppos.customer', function cementCustomer(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        if(_.isEmpty(selector)){
            return this.ready();
        }
        let data = Customers.find(selector);
        return data;

    }

    return this.ready();
});

// Reactive Table
// ReactiveTable.publish("ppos.reactiveTable.customer", Customers);