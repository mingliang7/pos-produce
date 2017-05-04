export const StockParents = new Mongo.Collection('ppos_stockParents');

StockParents.schema = new SimpleSchema({
    name: {
        type: String
    },
    desc:{
        type: String,
        optional: true
    },
    parents: {
        optional: true,
        type: [String],
        autoform: {
            type: 'select'
        }
    },
    branchId: {
        type: String,
        optional: true
    }
});

StockParents.attachSchema(StockParents.schema);