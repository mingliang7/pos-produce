import {Terms} from '../../imports/api/collections/terms.js';

// Lib
import './_init.js';

Terms.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Terms.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Terms.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
