import {StockLocations} from '../../imports/api/collections/stockLocation.js';

// Lib
import './_init.js';

StockLocations.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
StockLocations.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
StockLocations.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
