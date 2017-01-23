import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';

export const AverageInventories = new Mongo.Collection("cement_averageInventories");


// AverageInventories schema
AverageInventories.schema = new SimpleSchema({
    itemId: {
        type: String
    },
    stockLocationId: {
        type: String
    },
    price: {
        type: Number,
        decimal: true
    },
    qty: {
        type: Number,
        decimal:true,
    },
    amount: {
        type: Number,
        decimal: true
    },
    lastAmount: {
        type: Number,
        decimal: true
    },
    averagePrice: {
        type: Number,
        decimal: true
    },
    remainQty: {
        type: Number,
        decimal: true
    },
    branchId: {
        type: String
    },
    type: {
        type: String
    },
    coefficient: {
        type: Number
    },
    refId: {
        type: String
    },
});

Meteor.startup(function () {
    //AverageInventories.itemsSchema.i18n("cement.averageInventory.schema");
    //AverageInventories.schema.i18n("cement.averageInventory.schema");
    AverageInventories.attachSchema(AverageInventories.schema);
});
