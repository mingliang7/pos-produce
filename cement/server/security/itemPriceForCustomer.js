import {ItemPriceForCustomers} from '../../imports/api/collections/itemPriceForCustomer.js';

// Lib
import './_init.js';

ItemPriceForCustomers.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
ItemPriceForCustomers.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
ItemPriceForCustomers.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
