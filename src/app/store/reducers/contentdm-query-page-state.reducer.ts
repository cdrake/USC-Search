import {CONTENTdmQueryPageState} from '../../models/contentdm-query-page-state.model';
import { CONTENTdmQueryPageActionTypes, QueryPageAction } from '../actions/contentdm-query-page-state.actions';

const initialState = {
    currentPage: 0,
    maxRecords: 10,
    resultsCount: 0
}

const initialMapState = new Map<string, CONTENTdmQueryPageState>();


export function contentDMQueryPageStateReducer(queryPageStateMap: Map<string, CONTENTdmQueryPageState> = initialMapState, action: QueryPageAction) {
    switch(action.type) { 
        case CONTENTdmQueryPageActionTypes.SET_QUERY_PAGE:
            queryPageStateMap.set(action.key, action.queryPageState);
            return queryPageStateMap;
        case CONTENTdmQueryPageActionTypes.CLEAR_QUERY_PAGE:
            console.log('queryPageState cleared');
            queryPageStateMap.set(action.key, initialState);
            return queryPageStateMap;
        case CONTENTdmQueryPageActionTypes.SET_RESULTS_COUNT:
            if(queryPageStateMap.has(action.key)) {
                queryPageStateMap.set(action.key, {...queryPageStateMap.get(action.key), resultsCount: action.resultsCount});
            }
            else {
                queryPageStateMap.set(action.key, {...initialState, resultsCount: action.resultsCount});
            }
            console.log('count updated for ' + action.key);
            return queryPageStateMap;            
        case CONTENTdmQueryPageActionTypes.SET_PAGE_INDEX_AND_ITEM_COUNT:
            if(queryPageStateMap.has(action.key)) {
                queryPageStateMap.set(action.key, {...queryPageStateMap.get(action.key), 
                    currentPage: action.pageIndex, maxRecords: action.itemsPerPageCount});
            }
            else {
                queryPageStateMap.set(action.key, {...initialState, currentPage: action.pageIndex, maxRecords: action.itemsPerPageCount});                
            }
            return queryPageStateMap;                    
        default:
            return queryPageStateMap;
    }
}