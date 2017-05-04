import {Categories} from '../../imports/api/collections/category.js';

// Lib
import './_init.js';

Categories.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Categories.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Categories.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
