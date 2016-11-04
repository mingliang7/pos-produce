import {Terms} from '../../imports/api/collections/terms.js';

// Lib
import './_init.js';

Terms.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Terms.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Terms.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
