import { Component, Input, OnInit, ViewChild, ElementRef} from '@angular/core';
import { Observable } from 'rxjs';
import { CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';
import { HighlightSearchTermsPipe } from 'src/app/pipes/highlight-search-terms.pipe';

@Component({
  selector: 'app-page-info',
  templateUrl: './page-info.component.html',
  styleUrls: ['./page-info.component.scss']
})
export class PageInfoComponent implements OnInit {
  @Input() pageInfoUri: string;
  @ViewChild('pageText', {static: false}) pageText: ElementRef;

  pageInfo$: Observable<CONTENTdmItemPageInfo>;
  
  constructor(private highlight: HighlightSearchTermsPipe) { }
  
  ngOnInit(): void {
  }

  setPageText(text) {
    this.pageText.nativeElement.innerHTML = this.highlight.transform(text, 'text');
  }
}
