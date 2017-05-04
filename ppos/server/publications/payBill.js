import {Meteor} from 'meteor/meteor';
//collection
import {PayBills} from '../../imports/api/collections/payBill';
import  {GroupBill} from '../../imports/api/collections/groupBill';
Meteor.publish('ppos.payBills', function cementPayBills(selector) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
    }).validate({selector});

    if (this.userId) {
        let data = PayBills.find(selector);
        return data;

    }
    return this.ready();
});

Meteor.publish('ppos.activeGroupBills', function cementActiveGroupBills(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        // options: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        let data = GroupBill.find(selector);
        return data;
    }
    return this.ready();
});