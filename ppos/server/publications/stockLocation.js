import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {StockLocations} from '../../imports/api/collections/stockLocation.js';

Meteor.publish('ppos.stockLocation', function cementStockLocation(selector, options) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});
    if (this.userId) {
        let data = StockLocations.find(selector);
        console.log(data);
        return data;
    }
    return this.ready();
});

// Reactive Table