import {LendingStocks} from '../../imports/api/collections/lendingStock.js';

// Lib
import './_init.js';

LendingStocks.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
LendingStocks.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
LendingStocks.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
