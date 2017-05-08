import {ProductCycleSetup} from '../../imports/api/collections/productCycleSetup';

Meteor.publish('productCycleSetupPub', function () {
    if(this.userId){
        return ProductCycleSetup.find({});
    }
});
