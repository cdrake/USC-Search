import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as dragon from 'openseadragon'
import { Observable } from 'rxjs';
import { CONTENTdmItem, CONTENTdmItemNode, CONTENTdmItemNodePage, CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';

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
  @Output() pageInfoUriChanged = new EventEmitter<string>();
  
  pageInfo$: Observable<CONTENTdmItemPageInfo>;
  pages: CONTENTdmItemNodePage[];
  
  constructor(private http: HttpClient) {
    window['angularComponentRef'] = this;  
  }

  ngOnInit(): void {
  }

  // We have to initialize our OSD after we guarantee that the viewer element has been rendered
  ngAfterViewInit(): void {
    this.image$.subscribe(item => {
      this.pages = this.getPageInfoArray(item);

      console.log('collection:' + this.collection);
      console.log(item);
      const urls = this.getIIIFUrls(item);
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
    });
  }

  pageIndexChanged(pageIndex: number): void {
    if(this.pages.length > 0) {
      const pageInfoUri = `${digitalApiPrefix}${api}/${this.collection}/id/${this.pages[pageIndex].pageptr}`;
      this.pageInfoUriChanged.emit(pageInfoUri);
      this.pageInfo$ = this.http.get<CONTENTdmItemPageInfo>(pageInfoUri);      
    }
  }

  getIIIFUrls(item: CONTENTdmItem): string[] {
    let urls = this.getPageInfoArray(item).filter(url => url.hasOwnProperty('pageptr')).map(url => `${iiifPrefix}/${this.collection}/${url.pageptr}/info.json`);
   
    if(urls.length === 0) {
      return [`${digitalApiPrefix}${item.iiifInfoUri}`];
    }
    // return urls;
    return urls;
  }

  getPageInfoArray(item: CONTENTdmItem): CONTENTdmItemNodePage[] {
    let pages = new Array<CONTENTdmItemNodePage>();
    if('page' in item.objectInfo) {
      if(Array.isArray(item.objectInfo.page)) {
        pages = pages.concat(item.objectInfo.page);
      }
      else {
        pages.push(item.objectInfo.page);
      }
    }
    if('node' in item.objectInfo) {
      for(let key in item.objectInfo) {        
        if(key === 'node') {
          if(Array.isArray(item.objectInfo[key])) {
            pages = pages.concat(this.getPageInfoArrayFromNodeArray(item.objectInfo[key] as CONTENTdmItemNode[]));
          }
          else {
            pages = pages.concat(this.getPageInfoArrayFromNode(item.objectInfo[key] as CONTENTdmItemNode));
          }
        }
      }
    }

    return pages;
  }

  getPageInfoArrayFromNodeArray(nodes: CONTENTdmItemNode[]): CONTENTdmItemNodePage[] {
    let pages = new Array<CONTENTdmItemNodePage>();
    nodes.forEach(childNode => {
      pages = pages.concat(this.getPageInfoArrayFromNode(childNode));
    });
    return pages;
  }

  getPageInfoArrayFromNode(node: CONTENTdmItemNode): CONTENTdmItemNodePage[]  {
    let pages = new Array<CONTENTdmItemNodePage>();
    if(node.hasOwnProperty('page')) {
      if(Array.isArray(node.page)) {
        pages = pages.concat(node.page);
      }
      else {
        pages.push(node.page);
      }      
    }
    if(node.hasOwnProperty('node')) {
      if(Array.isArray(node.node)) {
        pages = pages.concat(this.getPageInfoArrayFromNodeArray(node.node));
      }
      else {
        pages = pages.concat(this.getPageInfoArrayFromNode(node.node));
      }
    }
    return pages;
  }

  getPageTitle(page: CONTENTdmItemPageInfo ): string {
    return page.fields.find(field => field.key === 'title').value;
  }
}
