import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as dragon from 'openseadragon'
import { Observable } from 'rxjs';
import { CONTENTdmItem, CONTENTdmItemNodePage, CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';
import { HighlightSearchTermsPipe } from 'src/app/pipes/highlight-search-terms.pipe';
import { LinkifyPipe } from 'src/app/pipes/linkify.pipe';
import { getIIIFUrls, getPageInfoArray } from '../../utils/iiif/contentdm-iiif-utils';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

const iiifPrefix = "https://digital.tcl.sc.edu/digital/iiif";
const digitalApiPrefix = 'https://digital.tcl.sc.edu/digital';
const api = '/api/singleitem/collection';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
  @Input() image$: Observable<CONTENTdmItem>;
  @Input() collection: string;  
  @ViewChild('viewer') viewer: ElementRef;
  // @ViewChild('pageText', {static: false}) pageText: ElementRef;
  @Output() pageInfoUriChanged = new EventEmitter<string>();
  
  pageInfo$: Observable<CONTENTdmItemPageInfo>;
  pages: CONTENTdmItemNodePage[];
  pageText: string;

  constructor(private http: HttpClient, private highlight: HighlightSearchTermsPipe, private linkify: LinkifyPipe, private domSanitizer: DomSanitizer) {
    window['angularComponentRef'] = this;  
  }

  ngOnInit(): void {
  }

  // We have to initialize our OSD after we guarantee that the viewer element has been rendered
  ngAfterViewInit(): void {
    this.image$.subscribe(item => {
      this.pages = getPageInfoArray(item);

      console.log('collection:' + this.collection);
      console.log(item);
      const urls = getIIIFUrls(item, digitalApiPrefix, iiifPrefix, this.collection);
      console.log(urls);
      const osd = new dragon.Viewer({
        element: this.viewer.nativeElement,
        showRotationControl: true,
        // Enable touch rotation on tactile devices
        gestureSettingsTouch: {
            pinchToZoom: true,            
        },
        prefixUrl: "//openseadragon.github.io/openseadragon/images/",
        showNavigator:true,
        sequenceMode: true,
        tileSources: urls
      });
      osd.addHandler('page', function(event) {
        console.log('Now on page', event.page);
        window['angularComponentRef'].pageIndexChanged(event.page);
      });
      if(this.pages.length > 0) {
        this.pageIndexChanged(0);
      }
      else {
        console.log('no pages found');        
        // if(item.objectInfo.) {
        //   console.log('text field');
        //   console.log(textField);
        //   this.pageText.nativeElement.innerHTML = this.highlight.transform(textField.value, 'text');
        // }
        // else {
        //   console.log('no text field found');
        //   console.log(item);
        // }
        // if(item.objectInfo.hasOwnProperty('text')) {
          this.pageText = item['text'];
        //}
        console.log(this.pageText);
      }

    });
  }

  pageIndexChanged(pageIndex: number): void {
    if(this.pages.length > 0) {
      const pageInfoUri = `${digitalApiPrefix}${api}/${this.collection}/id/${this.pages[pageIndex].pageptr}`;
      this.pageInfoUriChanged.emit(pageInfoUri);
      this.pageInfo$ = this.http.get<CONTENTdmItemPageInfo>(pageInfoUri);  
      console.log("page info requested " + pageInfoUri);
    }
  }

  getPageTitle(page: CONTENTdmItemPageInfo ): string {
    return page.fields.find(field => field.key === 'title').value;
  }
}
