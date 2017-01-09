import {AdvanceDiscount} from '../../imports/api/collections/advanceDiscount';
Meteor.publish('cement.advanceDiscount', function cementAdvanceDiscount(selector) {
    if (this.userId) {
        let data = AdvanceDiscount.find(selector);
        return data;
    }
    return this.ready();
});
