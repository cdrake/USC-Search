import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/models/app-state.model';
import { SetQueryMap } from 'src/app/store/actions/query-map.actions';

const FIELD_DELIMITER = ';';
const FIELD_ASSIGNMENT_OPERATOR = ':';

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
    let fieldMap: Map<string, string> = new Map();
    const fields = text.split(FIELD_DELIMITER);
    if(fields.length === 1) {
      fieldMap.set('any', text);
    }
    else {
      for(const field of fields) {
        const fieldParts = field.split(FIELD_ASSIGNMENT_OPERATOR);        
        console.log('field parts');
        console.log(fieldParts);
        const fieldName = fieldParts[0].trim().toLowerCase();
        const fieldValue = fieldParts.slice(1).join(':');
        if(fieldName && fieldValue) {
          fieldMap.set(fieldName, fieldValue);
        }
      }
    }
    console.log('Field map:');
    console.log(fieldMap);

    // let queryMap: Map<string, string> = new Map([["any", text]]);
    this.store.dispatch(new SetQueryMap(fieldMap));
    this.router.navigateByUrl('/results');
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.handleUserMessage(this.value);
      this.value = '';
    }
  }
}
