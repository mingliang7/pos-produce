import {Invoices} from '../../imports/api/collections/invoice';
import {TSPayment} from '../../imports/api/collections/tsPayment';
Meteor.publish('cement.activeTsInvoices', function cementActiveTsInvoices(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        // options: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        let data = Invoices.find(selector);
        return data;
    }
    return this.ready();
});

Meteor.publish('cement.tsPayment', function cementTsPayment(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        // options: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        let data = TSPayment.find(selector);
        return data;
    }
    return this.ready();
});
