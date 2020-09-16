import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../models/app-state.model';

@Pipe({
  name: 'highlightSearchTerms'
})
export class HighlightSearchTermsPipe implements PipeTransform {
  queryMap$: Observable<Map<string, string>>;
  queryMap: Map<string, string>;

  constructor(private _domSanitizer: DomSanitizer, private store: Store<AppState>) {
    this.queryMap$ = this.queryMap$ = this.store.select(state => state.queryMap);
    // this.queryMap$.subscribe(queryMap => {
    //   this.queryMap = queryMap;
    // });
  }

  transform(value: any, fieldName: string): Observable<string> {
    let markedText: string;
    // const fieldValue = value.toString();
    return Observable.create(observer => {
      if(value) {
        this.queryMap$.subscribe((queryMap) => {
          // console.log('Query Map for mark up');
          // console.log(queryMap);
          // console.log('Field value:' + value.changingThisBreaksApplicationSecurity);
          this.queryMap = queryMap;
          markedText = this.markSearchTerms(value.changingThisBreaksApplicationSecurity, fieldName);
          console.log('Marked text: ' + markedText);
          observer.next(this._domSanitizer.bypassSecurityTrustHtml(markedText));
          observer.complete();
        });
      }
      else {
        return '';
      }
    });
  }

  getMarkedText(fieldName: string, fieldValue: string): string {
    let markedText = fieldValue;
    //TODO(cdrake): tokenize queryMap search term unless in quotes
    if(this.queryMap.has(fieldName)) {
      const searchTerm = this.queryMap.get(fieldName).replace(/^['"]|['"]$/g, '');
      // ignore already marked text
      const regexString = `(?!<mark>)(${searchTerm})(?![^<]*?<\/mark>)`;
      const re = new RegExp(regexString, 'gi');

      markedText = fieldValue.toString().replace(re, '<mark>$&</mark>'); 
    }

    return markedText;
  }

  markSearchTerms(fieldValue: string, fieldName: string) : string {
    let markedText = fieldValue;

    if(fieldValue) {
      markedText = this.getMarkedText('any', fieldValue);
      markedText = this.getMarkedText(fieldName, markedText);
    }

    return markedText;
  }
}
