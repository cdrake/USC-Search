import { Action } from '@ngrx/store'

export enum QueryMapActionTypes {
    SET_QUERY_MAP = '[Query Map] Set Query Map',
    CLEAR_QUERY_MAP = '[Query Map] Clear Query Map',    
}

export class SetQueryMap implements Action {
    readonly type = QueryMapActionTypes.SET_QUERY_MAP

    constructor(public queryMap: Map<string, string>){}    
}

export class ClearQueryMap implements Action {
    readonly type = QueryMapActionTypes.CLEAR_QUERY_MAP

    constructor() {}
}


export type QueryAction =  SetQueryMap |  ClearQueryMap
   
