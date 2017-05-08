import {PrivateMode} from '../../imports/api/collections/privateMode';
import {ProductCycleSetup} from '../../imports/api/collections/productCycleSetup';
Meteor.startup(function () {
    if (PrivateMode.find().count() == 0) {
        PrivateMode.insert({
            enabled: true
        });
    }
    if(ProductCycleSetup.find().count()==0) {
        ProductCycleSetup.insert({name: 'Cycle 1', cycleOrder: '1'});
    }
});