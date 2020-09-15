import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { DataSource } from '../../models/app-config.model';
import { AppState } from '../../models/app-state.model';
import { CONTENTdmSearchResults, CONTENTdmSearchResult } from '../../models/contentdm-search-results.model';
import { CONTENTdmQueryPageState } from '../../models/contentdm-query-page-state.model';
import {PageEvent} from '@angular/material/paginator';
import { SetPageIndexAndItemCountAction, SetResultsCountAction } from 'src/app/store/actions/contentdm-query-page-state.actions';
import { HttpClient } from '@angular/common/http';
import { buildCONTENTdmBaseQueryFromMap, buildCONTENTdmPagedQuery} from '../../utils/query/contentdm-query.utils';

@Component({
  selector: 'app-data-source-results',
  templateUrl: './data-source-results.component.html',
  styleUrls: ['./data-source-results.component.scss']
})
export class DataSourceResultsComponent implements OnInit {
  @Input() dataSource: DataSource;
  results$: Observable<CONTENTdmSearchResults>;  
  queryMap$: Observable<Map<string, string>>;
  pageStateMap$: Observable<Map<string, CONTENTdmQueryPageState>>;
  resultsCount = 0;
  pageIndex = 0;
  itemsPerPage = 10;
  baseQuery: string;

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(private store: Store<AppState>, private http: HttpClient) { 
    
  }

  ngOnInit(): void {
    console.log(this.dataSource );
    this.pageStateMap$ = this.store.select(state => state.pageState);
    this.updatePageState();
    this.queryMap$ = this.store.select(state => state.queryMap);
    this.queryMap$.subscribe(queryMap => {
      // TODO(cdrake): check type of data source
      this.baseQuery = buildCONTENTdmBaseQueryFromMap(this.dataSource.url, queryMap);
      console.log('base query is:');
      console.log(this.baseQuery);
      this.loadResults();  
    });
  }

  updatePageState(): void {
    this.pageStateMap$.subscribe(pageStateMap => {
      console.log('Page state received');
      console.log(pageStateMap);
      if(pageStateMap.has(this.dataSource.key)) {
        const dataSource = pageStateMap.get(this.dataSource.key);
        this.pageIndex = dataSource.currentPage;
        this.resultsCount = dataSource.resultsCount;
        this.itemsPerPage = dataSource.maxRecords;  
        console.log('page state received for data source. Records found is ' + Number(this.resultsCount));
      }
    });
  }

  loadResults(): void {
    // we use pageIndex + 1 because the service is 1 based instead of zero based.
    const pagedQueryUrl = buildCONTENTdmPagedQuery(this.baseQuery, this.pageIndex + 1, this.itemsPerPage);

    this.results$ = this.http.get<CONTENTdmSearchResults>(pagedQueryUrl);
    this.results$.subscribe(results => {
      // update our total results
      console.log('updating result count');
      // if(results && this.resultsCount == 0) {
        this.store.dispatch(new SetResultsCountAction(this.dataSource.key,
          results.totalResults));        
      // }
      this.updatePageState();
    });
  }

  getResultsPage(event: PageEvent) {
    console.log(event);        
    this.itemsPerPage = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.store.dispatch(new SetPageIndexAndItemCountAction(this.dataSource.key, this.pageIndex, this.itemsPerPage));
    this.loadResults();
  }

  getThumbnailUri(item: CONTENTdmSearchResult): string {
    // TODO(cdrake): check type of data source
    return this.dataSource.url + item.thumbnailUri;
  }

  getDescription(item: CONTENTdmSearchResult): string {    
    const descriptionField = item.metadataFields.find(field => field['field'] === 'descri');

    return (descriptionField) ? this.dataSource.url + descriptionField.value : 'No Description';
  }
  
}
