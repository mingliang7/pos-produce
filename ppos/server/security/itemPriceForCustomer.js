import {ItemPriceForCustomers} from '../../imports/api/collections/itemPriceForCustomer.js';

// Lib
import './_init.js';

ItemPriceForCustomers.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ItemPriceForCustomers.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ItemPriceForCustomers.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
