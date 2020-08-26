import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';

@Component({
  selector: 'app-page-info',
  templateUrl: './page-info.component.html',
  styleUrls: ['./page-info.component.scss']
})
export class PageInfoComponent implements OnInit {
  @Input() pageInfoUri: string;
  pageInfo$: Observable<CONTENTdmItemPageInfo>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
