import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {LendingStocks} from '../../imports/api/collections/lendingStock.js';

Meteor.publish('ppos.lendingStock', function cementLendingStock(selector, options) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let data = LendingStocks.find(selector, options);
        return data;
    }

    return this.ready();
});
Meteor.publish('ppos.activeLendingStock', function activeLendingStocks(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        Meteor._sleepForMs(200);
        let data = LendingStocks.find(selector);
        console.log(data.fetch());
        return data;
    }
    return this.ready();
});