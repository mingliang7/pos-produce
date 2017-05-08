export const ProductCycleSetup = new Mongo.Collection('ppos_productCycleSetup');
export const productCycleItemInSchema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item',
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                create: true,
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.item',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        return {scheme: {$exists: false}};
                    }
                }
            }
        }
    },
    qty: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    }
});
export const productCycleItemOutSchema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item',
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                create: true,
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.item',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        return {scheme: {$exists: false}};
                    }
                }
            }
        }
    },
    qty: {
        type: Number,
        optional: true,
        decimal: true,
        defaultValue: 0
    }
});
ProductCycleSetup.schema = new SimpleSchema({
    name: {
        type: String,
        unique: true
    },
    cycleOrder: {
        type: String,
        unique: true
    },
    desc: {
        type: String,
        optional: true
    }
});

ProductCycleSetup.attachSchema(ProductCycleSetup.schema);