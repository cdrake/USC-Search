import { Query } from '@angular/core';
import {QueryAction, QueryMapActionTypes} from '../actions/query-map.actions'

export function queryMapReducer(state: Map<string, string> = new Map<string, string>(), action: QueryAction) {
    switch(action.type) {        
        case QueryMapActionTypes.SET_QUERY_MAP:
            return action.queryMap;
        case QueryMapActionTypes.CLEAR_QUERY_MAP:
            state.clear();
            return state;
        default:
            return state;
    }
}