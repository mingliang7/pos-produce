import {QuantityRangeMapping} from '../../imports/api/collections/quantityRangeMapping.js';

// Lib
import './_init.js';

QuantityRangeMapping.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
QuantityRangeMapping.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
QuantityRangeMapping.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
