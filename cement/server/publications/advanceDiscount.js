import {AdvanceDiscount} from '../../imports/api/collections/advanceDiscount';
Meteor.publish('cement.advanceDiscount', function cementAdvanceDiscount(selector) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let data = AdvanceDiscount.find(selector);

        return data;
    }

    return this.ready();
});
