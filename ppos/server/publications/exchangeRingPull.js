import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {ExchangeRingPulls} from '../../imports/api/collections/exchangeRingPull.js';

Meteor.publish('ppos.exchangeRingPull', function cementExchangeRingPull(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        if(_.isEmpty(selector)){
            return this.ready();
        }
        return ExchangeRingPulls.find(selector);

    }

    return this.ready();
});

// Reactive Table
// ReactiveTable.publish("ppos.reactiveTable.exchangeRingPull", ExchangeRingPulls);