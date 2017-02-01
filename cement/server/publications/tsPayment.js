import {Invoices} from '../../imports/api/collections/invoice';
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
