import {UnitConvert} from '../../imports/api/collections/unitConvert';
Meteor.methods({
    getUnitConvert(_id){
        let unitConvert = UnitConvert.findOne(_id);
        console.log(unitConvert);
        return unitConvert;
    }
});