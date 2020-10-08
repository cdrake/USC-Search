import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input} from '@angular/core';
import * as dragon from 'openseadragon'
import { Observable } from 'rxjs';
import { CONTENTdmItem, CONTENTdmItemNodePage, CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';
import { getPageInfoArray, getIIIFUrls } from 'src/app/utils/iiif/contentdm-iiif-utils';

const iiifPrefix = "https://digital.tcl.sc.edu/digital/iiif";
const digitalApiPrefix = 'https://digital.tcl.sc.edu/digital';
const api = '/api/singleitem/collection';
const PAGE_BUFFER_SIZE = 0.05;
@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrls: ['./book-viewer.component.scss']
})
export class BookViewerComponent implements OnInit {

  @ViewChild('viewer') viewer: ElementRef;
  @Input() book$: Observable<CONTENTdmItem>;
  @Input() collection: string;
  pageInfo$: Observable<CONTENTdmItemPageInfo>;
  osd: dragon.Viewer;
  tileSourceUrls: string[];
  pages: CONTENTdmItemNodePage[];
  boundsSet = false;
  secondImageLoaded = false;
  imageIndexMap = new Map<number, dragon.TiledImage>();
  textIndexMap = new Map<number, string>();
  currentPageIndex = 0;
  imagesLoaded = false;
  imageToViewIndex = 0;
  order: Array<number>;
  pageOneText = '';
  pageTwoText = '';

  constructor(private http: HttpClient) { 
    window['angularComponentRef'] = this; 
  }

  public setPageText(pageIndex: number, text: string): void {
    this.textIndexMap.set(pageIndex, text);
    if(pageIndex === this.currentPageIndex) {
      this.pageOneText = text;
    }
    else if(pageIndex === this.currentPageIndex + 1) {
      this.pageTwoText = text;
    }
    this.textIndexMap.set(pageIndex, text);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.book$.subscribe(item => {
      this.pages = getPageInfoArray(item);
      console.log('collection:' + this.collection);
      console.log(item);
      this.tileSourceUrls = getIIIFUrls(item, digitalApiPrefix, iiifPrefix, this.collection);
      this.osd = new dragon.Viewer({
        element: this.viewer.nativeElement,
        // Enable touch rotation on tactile devices
        gestureSettingsTouch: {
            pinchToZoom: true,            
        },
        prefixUrl: "//openseadragon.github.io/openseadragon/images/",
        autoResize: false,
        tileSources: this.tileSourceUrls,
      });      
      console.log('found ' + this.tileSourceUrls.length + ' urls');
    });

     

    setInterval(() => {
      if(this.imagesLoaded) {
        if(this.imageToViewIndex != this.currentPageIndex) {
          // reset text
          this.pageOneText = '';
          this.pageTwoText = '';

          try {
            this.osd.world.removeAll();
            this.osd.world.update();
            // add both images
            const firstImage = this.imageIndexMap.get(this.imageToViewIndex);
            if(firstImage) {
              this.osd.world.addItem(firstImage);
              // add text for page one
              if(this.textIndexMap.has(this.imageToViewIndex)) {
                this.pageOneText = this.textIndexMap.get(this.imageToViewIndex);
              }
              else {
                console.log('text not found');
                // request text
                let i = this.imageToViewIndex                
                this.getPageText(this.imageToViewIndex);
              }

              const secondTiledImage = this.imageIndexMap.get(this.imageToViewIndex + 1);
              if(secondTiledImage) {
                this.osd.world.addItem(secondTiledImage);
                secondTiledImage.setPosition(new dragon.Point(1 + PAGE_BUFFER_SIZE, 0));
                // add text for page two
                if(this.textIndexMap.has(this.imageToViewIndex + 1)) {                  
                  this.pageTwoText = this.textIndexMap.get(this.imageToViewIndex + 1);
                }
                else {
                  this.getPageText(this.imageToViewIndex + 1);
                }
              }
              else {
                console.log('no image found for second index');
              }
              this.adjustBounds(firstImage);
            }
            else {
              console.log('no image found for first index');
            }
            this.currentPageIndex = this.imageToViewIndex;
            console.log('current page is ' + this.currentPageIndex);

          }
          catch(e) {
            console.log(e);
            this.imagesLoaded = false;
          }
        }
      }
      else {
        let itemCount = this.osd.world.getItemCount();
        if(itemCount === this.tileSourceUrls.length) {                 
          
          for(let i = 0; i <  itemCount; i++) {
            const tiledImage = this.osd.world.getItemAt(i);
            this.imageIndexMap.set(i, tiledImage);
            const undefinedImages = Array.from(this.imageIndexMap.values()).filter(u => u === undefined);
            console.log('undefinedImages');
            console.log(undefinedImages);
            console.log('image index map:');
            console.log(this.imageIndexMap);
            if(undefinedImages.length === 0) {
              this.imagesLoaded = true;
              console.log('images loaded');
            }
          }

          itemCount = this.osd.world.getItemCount();
          const tiledImage = this.osd.world.getItemAt(2);
          this.osd.world.removeItem(tiledImage);
          itemCount = this.osd.world.getItemCount();

          const firstTiledImage = this.osd.world.getItemAt(0);
          if(!this.secondImageLoaded) {
            this.secondImageLoaded = true;
          }
          this.adjustBounds(firstTiledImage);
        }
      }
    }, 1000);
  }

  adjustBounds(tiledImage: dragon.TiledImage): void {
    let tileBounds = tiledImage.getBounds().clone();
    let x = tileBounds.x;
    let y = tileBounds.y;
    let width = tileBounds.width;
    let height = tileBounds.height;
    width *= 2;
    width += PAGE_BUFFER_SIZE;
  
    const box = new dragon.Rect(x, y, width, height);
    this.osd.viewport.fitBounds(box, true);
    this.osd.viewport.update();
  }

  prev(): void {
    if(this.imageToViewIndex > 1) {
      this.imageToViewIndex -= 2;
      console.log('prev pressed');
    }
  }

  next(): void {
    if(this.imageToViewIndex < this.tileSourceUrls.length - 2) {
      this.imageToViewIndex += 2;
      console.log('next pressed');
    }
    
  }

  getPageTextObservable(pageIndex: number): Observable<CONTENTdmItemPageInfo> {
    const pageInfoUri = `${digitalApiPrefix}${api}/${this.collection}/id/${this.pages[pageIndex].pageptr}`;
    return this.http.get<CONTENTdmItemPageInfo>(pageInfoUri);      
  }

  getPageText(pageIndex: number): void {
    this.getPageTextObservable(pageIndex).subscribe(page => {
      this.textIndexMap.set(pageIndex, page.text);
      if(this.imageToViewIndex === pageIndex) {
        this.pageOneText = page.text;
      }
      else if(this.imageToViewIndex + 1 === pageIndex){
        this.pageTwoText = page.text;
      }
    });
  }

}
