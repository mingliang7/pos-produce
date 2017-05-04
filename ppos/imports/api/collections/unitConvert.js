import {itemInfo} from '../../../common/methods/item-info.js';
import {Units} from '../../api/collections/units'
export const UnitConvert = new Mongo.Collection('ppos_unitConvert');
UnitConvert.schema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item',
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.item'
            }
        }
    },
    coefficient: {
        type: String,
        autoform: {
            type: 'select',
            options(){
                return [
                    {label: 'Addition(+)', value: 'addition'},
                    {label: 'Subtract(-)', value: 'subtract'},
                    {label: 'Multiply(*)', value: 'multiply'},
                    {label: 'Divide(/)', value: 'divide'},
                ]
            }
        }
    },
    convertAmount: {
        type: Number,
        decimal: true
    },
    convertUnit: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                label: {
                    class: 'label label-success'
                },
                uniPlaceholder: 'Select One'
            },
            options() {
                let list = []
                try {
                    Meteor.subscribe('ppos.unit', {}, {sort: {_id: 1}})
                } catch (e) {
                }
                let units = Units.find() || 0;
                if (units.count() > 0) {
                    units.forEach((unit) => {
                        list.push({label: `${unit._id}: ${unit.name}`, value: unit._id});
                    })
                }
                return list
            }
        }
    }
});


UnitConvert.attachSchema(UnitConvert.schema);
