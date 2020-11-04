import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Renderer2} from '@angular/core';
import * as dragon from 'openseadragon'
import { Observable } from 'rxjs';
import { CONTENTdmItem, CONTENTdmItemNodePage, CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';
import { getPageInfoArray, getIIIFUrls } from 'src/app/utils/iiif/contentdm-iiif-utils';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/models/app-state.model';
import { SetQueryMap } from 'src/app/store/actions/query-map.actions';

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
  queryMap$: Observable<Map<string, string>>;
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
  value = '';
  queryMap: Map<string, string>;

  

  constructor(private http: HttpClient, private store: Store<AppState>, private renderer: Renderer2) { 
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

  handleNextSearch() {
    const text = this.queryMap.get('text');
    const lowerText = text.toLocaleLowerCase();
    console.log('current page is ' + this.currentPageIndex.toString());
    for(const key of this.textIndexMap.keys()) {

      console.log('page being searched is ' + key.toString());
      if(key <= this.currentPageIndex + 1) {
        console.log('ignoring page');
        continue;
      }
      const pageText = this.textIndexMap.get(key);
      if(pageText && pageText.toLocaleLowerCase().includes(lowerText)) {
        console.log(lowerText + ' found');
        if(key % 2 === 0) {
          this.imageToViewIndex = key;
        }
        else {
          this.imageToViewIndex = key - 1;
        }
        console.log('page index changed to ' + this.imageToViewIndex);
        break;
      }
    }
  }

  handleSearch(text: string): void {
    console.log('search text is ' + text);

    // update text search term
    this.queryMap.set('text', text);
    this.store.dispatch(new SetQueryMap(this.queryMap));

    const lowerText = text.toLocaleLowerCase();
    for(const key of this.textIndexMap.keys()) {
      const pageText = this.textIndexMap.get(key);
      if(pageText && pageText.toLocaleLowerCase().includes(lowerText)) {
        console.log(lowerText + ' found');
        if(key % 2 === 0) {
          this.imageToViewIndex = key;
        }
        else {
          this.imageToViewIndex = key - 1;
        }
        console.log('page index changed to ' + this.imageToViewIndex);
        break;
      }
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.handleSearch(this.value);
      this.value = '';
    }
  }

  addOverlay(): void {
    const div = this.renderer.createElement('div');
    this.renderer.setProperty(div, 'id', 'example-runtime-overlay');
    const text = this.renderer.createText('Hello world!');
    this.renderer.appendChild(div, text);
    
    this.osd.addOverlay(div, new dragon.Rect(0.33, 0.75, 0.2, 0.25));
  }

  removeOverlay(): void {
    this.osd.removeOverlay('example-runtime-overlay');
  }



  ngOnInit(): void {
    this.queryMap$ = this.store.select(state => state.queryMap);
    this.queryMap$.subscribe(queryMap => {
      console.log(queryMap);
      this.queryMap = queryMap;
      this.value = this.queryMap.has('text') ? this.queryMap.get('text') : '';
    });
  }

  ngAfterViewInit(): void {
    this.book$.subscribe(item => {
      this.pages = getPageInfoArray(item);
      
      // get all of the page text so we can search it
      for(let i = 0; i < this.pages.length; i++) {
        this.getPageText(i);
      }

      console.log('collection:' + this.collection);
      console.log(item);
      this.tileSourceUrls = getIIIFUrls(item, digitalApiPrefix, iiifPrefix, this.collection);
      //TODO(cdrake): remove after lazy loading implemented
      this.tileSourceUrls =  this.tileSourceUrls.slice(0, 16);
      this.osd = new dragon.Viewer({
        element: this.viewer.nativeElement,
        preserveViewport: true,
        visibilityRatio: 1,
        // Enable touch rotation on tactile devices
        gestureSettingsTouch: {
            pinchToZoom: true,            
        },
        prefixUrl: "//openseadragon.github.io/openseadragon/images/",
        autoResize: false,
        tileSources: this.tileSourceUrls,
      });

      
      // this.osd.addHandler('open', function() {
      //   const style = 'height: ' 
      //   + window['angularComponentRef'].osd.world.getItemAt(0).source.dimensions.y / window.devicePixelRatio + 'px;width: '        
      //   + window['angularComponentRef'].osd.world.getItemAt(0).source.dimensions.y / window.devicePixelRatio + 'px;'
      //   console.log('style is ' + style);
      //   window['angularComponentRef'].renderer.setAttribute(window['angularComponentRef'].viewer.nativeElement, 'style', style);  
      // });      

      console.log('found ' + this.tileSourceUrls.length + ' urls');
    }); 

    

    setInterval(() => {
      if(this.imagesLoaded) {
        if(this.imageToViewIndex != this.currentPageIndex) {
          // reset text
          this.pageOneText = '';
          this.pageTwoText = '';

          try {
            // add overlay
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

              // set this so that the images will be arranged in the right order
              this.currentPageIndex = -1;
            }
          }

          itemCount = this.osd.world.getItemCount();
          if(itemCount > 2) {
            const tiledImage = this.osd.world.getItemAt(2);
            this.osd.world.removeItem(tiledImage);
            itemCount = this.osd.world.getItemCount();
          }

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
      if(pageIndex === this.pages.length && this.queryMap.has('text')) {
        this.handleSearch(this.queryMap.get('text'));
      }
    });
  }

}
