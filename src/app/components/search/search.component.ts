import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/models/app-state.model';
import { SetQueryMap } from 'src/app/store/actions/query-map.actions';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  value = 'Simkins';

  constructor(private router: Router, private store: Store<AppState>) { }

  ngOnInit(): void {
  }

  handleUserMessage(text: string) {    
    console.log('new query map set');
    let queryMap: Map<string, string> = new Map([["any", text]]);
    this.store.dispatch(new SetQueryMap(queryMap));
    this.router.navigateByUrl('/results');
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.handleUserMessage(this.value);
      this.value = '';
    }
  }
}
