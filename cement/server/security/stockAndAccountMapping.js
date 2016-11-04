import {StockAndAccountMapping} from '../../imports/api/collections/stockAndAccountMapping.js';

// Lib
import './_init.js';

StockAndAccountMapping.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
StockAndAccountMapping.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
StockAndAccountMapping.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
