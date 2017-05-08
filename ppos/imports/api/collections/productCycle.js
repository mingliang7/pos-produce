export const ProductCycle = new Mongo.Collection('ppos_productCycle');
import {ProductCycleSetup} from '../collections/productCycleSetup'
ProductCycle.schema = new SimpleSchema({
    name: {
        type: String,
    },
    cycleType: {
        type: String,
        autoform: {
            type: 'select',
            options(){
                let list = [];
                ProductCycleSetup.find({}).forEach(function (doc) {
                    list.push({label: doc.name, value: doc._id});
                });
                return list;
            }
        }
    },
    itemIn: {
        type: [Object]
    },
    'itemIn.$.itemId': {
        type: String
    },
    'itemIn.$.qty': {
        type: Number,
        decimal: true
    },
    itemOut: {
        type: [Object]
    },
    'itemOut.$.itemId': {
        type: String
    },
    'itemOut.$.qty': {
        type: Number,
        decimal: true
    },
    branchId: {
        type: String,
        optional: true
    }
});

ProductCycle.attachSchema(ProductCycle.schema);