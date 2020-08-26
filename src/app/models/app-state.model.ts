import { CONTENTdmQueryPageState } from '../models/contentdm-query-page-state.model';

export interface AppState {
    readonly pageState: Map<string, CONTENTdmQueryPageState>;
    readonly queryMap: Map<string, string>;
}