import {Order} from '../../imports/api/collections/order';
import {TSSOPayment} from '../../imports/api/collections/tsSoPayment';
Meteor.publish('cement.activeTsSo', function cementActiveTsSo(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        // options: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        let data = Order.find(selector);
        return data;
    }
    return this.ready();
});

Meteor.publish('cement.tsSoPayment', function cementTsSoPayment(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        // options: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        let data = TSSOPayment.find(selector);
        return data;
    }
    return this.ready();
});
