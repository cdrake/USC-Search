import { Action } from '@ngrx/store';
import {CONTENTdmQueryPageState} from '../../models/contentdm-query-page-state.model';

export enum CONTENTdmQueryPageActionTypes {
    SET_QUERY_PAGE = '[CONTENTdm Query Page State] Set Query Page',
    CLEAR_QUERY_PAGE = '[CONTENTdm Query Page State] Clear Query Page',
    SET_RESULTS_COUNT = '[CONTENTdm Query Page State] Set results count for Query Page',
    SET_PAGE_INDEX_AND_ITEM_COUNT = '[CONTENTdm Query Page State] Set page index and max item count for Query Page',
    LOAD_QUERY_PAGE_STATE = '[CONTENTdm Query Page State] Load page state',
}

export class SetQueryPageStateAction implements Action {
    readonly type = CONTENTdmQueryPageActionTypes.SET_QUERY_PAGE
    constructor(public key: string, public queryPageState: CONTENTdmQueryPageState) {}
}

export class SetResultsCountAction implements Action {
    readonly type = CONTENTdmQueryPageActionTypes.SET_RESULTS_COUNT
    constructor(public key: string, public resultsCount: number) {}
}

export class SetPageIndexAndItemCountAction implements Action {
    readonly type = CONTENTdmQueryPageActionTypes.SET_PAGE_INDEX_AND_ITEM_COUNT
    constructor(public key: string, public pageIndex: number, public itemsPerPageCount: number) {}
}


export class ClearQueryPageStateAction implements Action {
    readonly type = CONTENTdmQueryPageActionTypes.CLEAR_QUERY_PAGE
    constructor(public key: string){}
}

export class LoadQueryPageStateAction implements Action {
    readonly type = CONTENTdmQueryPageActionTypes.LOAD_QUERY_PAGE_STATE
    constructor(public key: string){}
}

export type QueryPageAction = SetQueryPageStateAction | ClearQueryPageStateAction | SetResultsCountAction | SetPageIndexAndItemCountAction | LoadQueryPageStateAction;