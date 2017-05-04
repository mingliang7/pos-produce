export const Truck = new Mongo.Collection('ppos_truck');

Truck_schema = new SimpleSchema({
    name: {
        type: String,
    },
    number: {
        unique: true,
        type: String
    },
    branchId: {
        type: String
    },
    des: {
        type: String,
        optional: true
    }
});

Truck.attachSchema(Truck_schema);