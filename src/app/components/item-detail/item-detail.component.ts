import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { AppConfig, DataSource } from '../../models/app-config.model';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CONTENTdmItem } from '../../models/contentdm-item.model';
import { HttpClient } from '@angular/common/http';
import { getPageInfoArray } from '../../utils/iiif/contentdm-iiif-utils';

const formats = ['video', 'audio', 'image'];

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss']
})
export class ItemDetailComponent implements OnInit {
  collection: string;
  id: string;
  key: string;
  page: number;  
  dataSource: DataSource;  
  appConfig$:Observable<AppConfig>;
  item$: Observable<CONTENTdmItem>;
  
  constructor(private route: ActivatedRoute, private http: HttpClient) { 
    this.appConfig$ = AppConfigService.settings$;    
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.collection = params['collection'];
      this.id = params['id'];
      this.key = params['key'];
      this.page = params['page'];
      this.appConfig$.subscribe(appConfig => {
        this.dataSource = appConfig.dataSources.find(key => key.key === this.key);
        console.log('data source loaded');
        console.log(this.dataSource);
        const itemUrl = `${this.dataSource.url}/${this.dataSource.itemPrefix}/${this.collection}/id/${this.id}`;
        console.log('item url is ' + itemUrl);
        this.item$ = this.http.get<CONTENTdmItem>(itemUrl);
        this.item$.subscribe(item => {console.log(item)});
      })  
      
  });
  }

  getFieldValue(item: CONTENTdmItem, fieldName: string): string {
    let formatField = item.fields.find(field => field['key'] === fieldName);
    return formatField ? formatField.value : '';
  }

  //TODO(cdrake): if not a format we recognize, check url for clue
  getFormat(item: CONTENTdmItem): string {
    let formatField = item.fields.find(field => field['key'] === 'format');
    if(!formatField) {
        formatField = item.fields.find(field => field['key'] === 'formaa');
    }
    let formatValue = (formatField) ? formatField.value.toLowerCase() : 'unknown';

    // check if this is a book


    formatValue = formatValue.substr(0, 5);
    if(!(formatValue in formats) && item.url) {
      switch(item.url.slice(-3)) {
        case 'mp3':
          formatValue = 'audio';
          break;
        case 'wmv':
          formatValue = 'video';
          break;
      }
    }

    if(formatValue === 'image') {
      const pageArray = getPageInfoArray(item);
      if(Array.isArray(pageArray) && pageArray.length > 1) {
        formatValue = 'book';
      }
    }
    // console.log('format: ' + format)
    return formatValue;
  }

  getTileSourceUrls(item: CONTENTdmItem): string[] {
    let tileSourceUrls = [];
    
    return tileSourceUrls;
  }

  

}
