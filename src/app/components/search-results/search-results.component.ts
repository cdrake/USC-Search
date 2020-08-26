import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { DataSource } from '../../models/app-config.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/models/app-state.model';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  dataSources: DataSource[];
  queryMap$: Observable<Map<string, string>>;

  constructor(private router: Router, private store: Store<AppState>) {
    AppConfigService.settings$.subscribe( () => {
        this.dataSources = AppConfigService.settings.dataSources;
      }
    );
   }

  ngOnInit(): void {
    // Navigate back to search if no query map
    this.queryMap$ = this.store.select(state => state.queryMap);
    this.queryMap$.subscribe(queryMap => {
      console.log(queryMap);
      if(queryMap.size == 0) {
        this.router.navigateByUrl('');
      }
    });
  }

}
