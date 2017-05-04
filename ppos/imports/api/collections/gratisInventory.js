import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';

export const GratisInventories = new Mongo.Collection("ppos_gratisInventories");


// GratisInventories schema
GratisInventories.schema = new SimpleSchema({
    itemId: {
        type: String
    },
    stockLocationId: {
        type: String
    },
    qty: {
        type: Number
    },
    branchId: {
        type: String
    }
});

Meteor.startup(function () {
    //GratisInventories.itemsSchema.i18n("cement.gratisInventory.schema");
    //GratisInventories.schema.i18n("cement.gratisInventory.schema");
    GratisInventories.attachSchema(GratisInventories.schema);
});
