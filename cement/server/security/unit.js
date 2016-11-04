import {Units} from '../../imports/api/collections/units.js';

// Lib
import './_init.js';

Units.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Units.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Units.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
