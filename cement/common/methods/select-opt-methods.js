import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';
import {Branch} from '../../../core/imports/api/collections/branch.js'
// Collection
import {Customers} from '../../imports/api/collections/customer.js';
import {Item} from '../../imports/api/collections/item.js';
import {Order} from '../../imports/api/collections/order.js';
import {Reps} from '../../imports/api/collections/rep.js';
import {StockLocations} from '../../imports/api/collections/stockLocation.js';
import {Vendors} from '../../imports/api/collections/vendor';
import {PaymentGroups} from '../../imports/api/collections/paymentGroup';
import {Terms} from '../../imports/api/collections/terms';
import {Truck} from '../../imports/api/collections/truck';
import {Invoices} from '../../imports/api/collections/invoice';
export let SelectOptMethods = {};

SelectOptMethods.stockLocation = new ValidatedMethod({
    name: 'cement.selectOptMethods.stockLocation',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}, branchId: params.branchId};
            } else {
                selector.branchId = params.branchId;
            }
            let data = StockLocations.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});
SelectOptMethods.stockLocationMapping = new ValidatedMethod({
    name: 'cement.selectOptMethods.stockLocationMapping',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            if (params.stockLocations) {
                selector._id = params.stockLocations;
            }
            if (params.branchId) {
                selector.branchId = params.branchId;
            }
            if (searchText && params.branchId) {
                selector['$or'] = [
                    {_id: {$regex: searchText, $options: 'i'}},
                    {name: {$regex: searchText, $options: 'i'}}
                ]
            }

            let data = StockLocations.find(selector, {limit: 20});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});
SelectOptMethods.lookupInvoice = new ValidatedMethod({
    name: 'cement.selectOptMethods.lookupInvoice',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            selector.refBillId = {$exists: false};
            if (params.branchId) {
                selector.branchId = params.branchId;
            }
            if (searchText) {
                selector['$or'] = [
                    {_id: {$regex: searchText, $options: 'i'}},
                    {'_customer.name': {$regex: searchText, $options: 'i'}},
                    {'voucherId': {$regex: searchText, $options: 'i'}}
                ]
            }
            let data = Invoices.find(selector, {limit: 50, sort: {voucherId: -1}});
            data.forEach((invoice) => {
                list.push({
                    label: `INV: ${invoice.voucherId || invoice._id} | ${invoice._customer.name} | $${numeral(invoice.total).format('0,0.00')}`,
                    value: invoice._id
                });
            });
            return list;
        }
    }
});
SelectOptMethods.rep = new ValidatedMethod({
    name: 'cement.selectOptMethods.rep',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();
            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Reps.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.customer = new ValidatedMethod({
    name: 'cement.selectOptMethods.customer',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [];
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            let selector = {};
            if (!_.isEmpty(params)) {
                selector = params;
            }
            if (searchText) {
                selector.$or = [
                    {_id: {$regex: searchText, $options: 'i'}},
                    {name: {$regex: searchText, $options: 'i'}}
                ];
            } else if (values.length) {
                selector._id = {$in: values};
            }
            let data = Customers.find(selector, {limit: 10});
            data.forEach(function (value) {
                let termOrGroup = value._term ? ` (Term ${value._term.name})` : ` (Group ${value._paymentGroup.name})`;
                // let label = value._id + ' : ' + value.name + termOrGroup;
                let label = value.name
                list.push({label: label, value: value._id});
            });
            return list;
        }
    }
});

SelectOptMethods.saleOrder = new ValidatedMethod({
    name: 'cement.selectOptMethods.saleOrder',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();
            let list = [];
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            let selector = {};
            if (!_.isEmpty(params)) {
                selector = params;
                if (searchText) {
                    selector.$or = [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {voucherId: {$regex: searchText, $options: 'i'}}
                    ];
                } else if (values.length) {
                    selector._id = {$in: values};
                }
                let data = Order.find(selector, {limit: 20});
                data.forEach(function (value) {
                    list.push(
                        {
                            label: `${value._id} | ${value.voucherId || ''} | $${numeral(value.total).format('0,0.00')}`,
                            value: value._id
                        }
                    );
                });
            }
            return list;
        }
    }
});
SelectOptMethods.truck = new ValidatedMethod({
    name: 'cement.selectOptMethods.truck',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [];
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            let selector = {};
            if (!_.isEmpty(params)) {
                selector = params;
            }
            if (searchText) {
                selector.$or = [
                    {number: {$regex: searchText, $options: 'i'}},
                    {name: {$regex: searchText, $options: 'i'}}
                ];
            } else if (values.length) {
                selector._id = {$in: values};
            }
            let data = Truck.find(selector, {limit: 10});
            data.forEach(function (value) {
                list.push({label: value.name + ' | N: ' + value.number, value: value._id});
            });
            return list;
        }
    }
});
SelectOptMethods.vendor = new ValidatedMethod({
    name: 'cement.selectOptMethods.vendor',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            if (params.paymentType) {
                selector.paymentType = params.paymentType;
            }
            if (searchText && params.branchId) {

                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Vendors.find(selector, {limit: 10});
            data.forEach(function (value) {
                let termOrGroup = value._term ? ` (Term ${value._term.name})` : ` (Group ${value._paymentGroup.name})`;
                let label = value._id + ' : ' + value.name + termOrGroup;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.item = new ValidatedMethod({
    name: 'cement.selectOptMethods.item',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            if (_.isEmpty(params.scheme)) {
                selector = {}
            } else {
                selector.scheme = params.scheme;

            }
            if (searchText) {
                selector.$or =
                    [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ]
            } else if (values.length) {
                selector._id = {$in: values}
            }
            let data = Item.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.order = new ValidatedMethod({
    name: 'cement.selectOptMethods.order',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;

            if (searchText) {
                selector = {
                    _id: {$regex: searchText, $options: 'i'},
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Order.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' | Date: ' + moment(value.orderDate).format('DD/MM/YYYY');
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.user = new ValidatedMethod({
    name: 'cement.selectOptMethods.user',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {username: {$regex: searchText, $options: 'i'}}
                    ],
                    username: {$ne: 'super'}
                };
            } else if (values.length) {
                selector = {_id: {$in: values}, username: {$ne: 'super'}};
            }

            let data = Meteor.users.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value.username;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});
SelectOptMethods.branch = new ValidatedMethod({
    name: 'cement.selectOptMethods.branch',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            let data = Branch.find(selector, {limit: 100});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.enName;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});
SelectOptMethods.transferMoneybranch = new ValidatedMethod({
    name: 'cement.selectOptMethods.transferMoneyBranch',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            let data = Branch.find(params, {limit: 100});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.enName;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.branchListExcludeCurrent = new ValidatedMethod({
    name: 'cement.selectOptMethods.branchListExcludeCurrent',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};
            if (params.branchId) {
                selector._id = {$ne: params.branchId};
            }
            let data = Branch.find(selector, {limit: 100});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.enName;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});


SelectOptMethods.paymentGroup = new ValidatedMethod({
    name: 'cement.selectOptMethods.paymentGroup',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ]
                };
            } else if (values.length) {
                selector = {_id: {$in: values}, name: {$ne: 'super'}};
            }

            let data = PaymentGroups.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.term = new ValidatedMethod({
    name: 'cement.selectOptMethods.term',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ]
                };
            } else if (values.length) {
                selector = {_id: {$in: values}, name: {$ne: 'super'}};
            }

            let data = Terms.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptMethods.settingUser = new ValidatedMethod({
    name: 'cement.selectOptMethods.settingUser',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {username: {$regex: searchText, $options: 'i'}}
                    ],
                    username: {$ne: 'super'}
                };
            } else if (values.length) {
                selector = {_id: {$in: values}, username: {$ne: 'super'}};
            } else {
                selector = {username: {$ne: 'super'}};
            }
            let data = Meteor.users.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value.username;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});