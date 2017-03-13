import {Closing} from '../../imports/api/collections/closing.js';

// Lib
import './_init.js';

Closing.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Closing.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Closing.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
