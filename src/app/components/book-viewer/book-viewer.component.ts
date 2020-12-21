import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Renderer2} from '@angular/core';
import * as dragon from 'openseadragon'
import { Observable } from 'rxjs';
import { CONTENTdmItem, CONTENTdmItemNodePage, CONTENTdmItemPageInfo } from 'src/app/models/contentdm-item.model';
import { getPageInfoArray, getIIIFUrls } from 'src/app/utils/iiif/contentdm-iiif-utils';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/models/app-state.model';
import { SetQueryMap } from 'src/app/store/actions/query-map.actions';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

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
  textRequestedForPages: Array<boolean>;
  currentPageIndex = 0;
  imagesLoaded = false;
  pageToViewIndex = 0;
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

  handleTextSearch(text: string, startingPageIndex: number) {
    const currentSearchTerm = this.queryMap.get('text');
    if(currentSearchTerm != text) {
      // update text search term
      this.queryMap.set('text', text);
      this.store.dispatch(new SetQueryMap(this.queryMap));
    }

    const lowerText = text.toLocaleLowerCase();
    for(const key of this.textIndexMap.keys()) {
      console.log('page being searched is ' + key.toString());
      if(key < startingPageIndex) {
        console.log('ignoring page ' + key);
        continue;
      }
      const pageText = this.textIndexMap.get(key);
      if(pageText && pageText.toLocaleLowerCase().includes(lowerText)) {
        console.log(lowerText + ' found');        
        if(key % 2 === 0 && key != 0) {
          this.pageToViewIndex = key - 1;
        }
        else {
          this.pageToViewIndex = key;
        }
        if(this.pageToViewIndex != this.currentPageIndex) {
          this.changePage(this.pageToViewIndex);
          console.log('page index changed to ' + this.pageToViewIndex);
        }
        break;
      }
    }

  }

  handleNextSearch() {
    const text = this.queryMap.get('text');
    this.handleTextSearch(text, this.currentPageIndex + 2);
  }

  handleSearch(text: string): void {
    this.handleTextSearch(text, this.currentPageIndex);
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

  loadImage(tileSourceIndex: number): void {
    console.log('load image called for image: ' + tileSourceIndex);
    if(this.tileSourceUrls.length > tileSourceIndex) {
      console.log('loading tiled image');
      if(!this.imageIndexMap.has(tileSourceIndex)) {
        console.log('requesting new tiled image');
        this.osd.addTiledImage({tileSource: this.tileSourceUrls[tileSourceIndex]});      
      }
      else {
        console.log('adding image from cache');
        this.osd.world.addItem(this.imageIndexMap.get(tileSourceIndex));
      }
    }    
  }

  
  adjustCanvas(): void {
    const itemCount = this.osd.world.getItemCount();
    if(itemCount > 0) {
      const firstImage = this.osd.world.getItemAt(0);

      // Expand the canvas for two images
      this.adjustBounds(firstImage);

      if(itemCount > 1) {
        const secondImage = this.osd.world.getItemAt(1); 
        if(secondImage) {
          secondImage.setHeight(firstImage.getBounds().height);
          secondImage.setPosition(new dragon.Point(1 + PAGE_BUFFER_SIZE, 0));
        }
      }
      else {
        console.log('moving image to center of page');        
        firstImage.setPosition(new dragon.Point(.5, 0)); 
        
      }
      
      this.osd.viewport.update();
    }

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
      this.textRequestedForPages = new Array(this.tileSourceUrls.length);
      // load the first  two urls
      
      // this.tileSourceUrls =  this.tileSourceUrls.slice(0, 2);
      this.osd = new dragon.Viewer({
        element: this.viewer.nativeElement,
        showRotationControl: true,
        preserveViewport: true,
        visibilityRatio: 1,
        // Enable touch rotation on tactile devices
        gestureSettingsTouch: {
            pinchToZoom: true,            
        },
        prefixUrl: "//openseadragon.github.io/openseadragon/images/",
        autoResize: false,
        // tileSources: this.tileSourceUrls[0]
      });

      // Add handler to cache images as we load them to prevent re-requesting 
      // images from the server.
      this.osd.world.addHandler('add-item', function(event) {
        const component = window['angularComponentRef'] as BookViewerComponent;
        const world: dragon.World = event.eventSource; //component.osd.world;

        // handle if we are loading the cover image
        const imageIndex = component.pageToViewIndex > 0 ? component.pageToViewIndex : 0;

        if(world.getItemCount() == 1) {
          if(!component.imageIndexMap.has(imageIndex)) {
            console.log('caching first image');
            component.imageIndexMap.set(imageIndex, event.item);
          }
        }
        else if(world.getItemCount() == 2) {
          if(!component.imageIndexMap.has(imageIndex + 1)) {
            console.log('caching second image');
            component.imageIndexMap.set(imageIndex + 1, event.item);
          }
        }

        if(world.getItemCount() == 2  
        || imageIndex == 0
        || imageIndex == component.tileSourceUrls.length - 1) {
          console.log('adjusting canvas');
          component.adjustCanvas();
          component.currentPageIndex = component.pageToViewIndex;
        }        
      });

      // Load the cover image
      this.loadImage(0);
    }); 
  }

  changePage(newPageIndex: number): void {
    console.log('page changed');

    // remove all images
    this.osd.world.removeAll();
    this.osd.world.update();

    this.loadImage(newPageIndex);

    // load the cover image by itself
    if(newPageIndex > 0) {
      this.loadImage(newPageIndex + 1);

      if(this.textIndexMap.has(newPageIndex + 1)) {                  
        this.pageTwoText = this.textIndexMap.get(newPageIndex + 1);
      }
      else {
        this.getPageText(newPageIndex + 1);
      }
    }

    if(this.textIndexMap.has(newPageIndex)) {
      this.pageOneText = this.textIndexMap.get(newPageIndex);
    }
    else {
      this.getPageText(newPageIndex);
    }
    
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
    if(this.pageToViewIndex > 0) {
      this.pageToViewIndex = this.pageToViewIndex > 1 ? this.pageToViewIndex - 2 : 0;
      this.changePage(this.pageToViewIndex);
      
    } 
    console.log('prev pressed');
  }

  next(): void {
    if(this.pageToViewIndex < this.tileSourceUrls.length - 2) {
      this.pageToViewIndex = this.pageToViewIndex > 0 ? this.pageToViewIndex + 2 : 1;      
      this.changePage(this.pageToViewIndex);      
    }
    console.log('next pressed');    
  }

  getPageTextObservable(pageIndex: number): Observable<CONTENTdmItemPageInfo> {
    const pageInfoUri = `${digitalApiPrefix}${api}/${this.collection}/id/${this.pages[pageIndex].pageptr}`;
    return this.http.get<CONTENTdmItemPageInfo>(pageInfoUri);      
  }

  getPageText(pageIndex: number): void {
    this.getPageTextObservable(pageIndex).subscribe(page => {
      this.textIndexMap.set(pageIndex, page.text);
      if(this.pageToViewIndex === pageIndex) {
        this.pageOneText = page.text;
      }
      else if(this.pageToViewIndex + 1 === pageIndex){
        this.pageTwoText = page.text;
      }
      if(pageIndex === this.pages.length && this.queryMap.has('text')) {
        this.handleSearch(this.queryMap.get('text'));
      }
    });
  }

}
