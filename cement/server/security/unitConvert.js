import {UnitConvert} from '../../imports/api/collections/unitConvert.js';

// Lib
import './_init.js';

UnitConvert.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
UnitConvert.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
UnitConvert.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
