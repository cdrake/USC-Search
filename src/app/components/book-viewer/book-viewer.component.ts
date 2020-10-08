import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input} from '@angular/core';
import * as dragon from 'openseadragon'

const PAGE_BUFFER_SIZE = 0.05;
@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrls: ['./book-viewer.component.scss']
})
export class BookViewerComponent implements OnInit {

  @ViewChild('viewer') viewer: ElementRef;
  @Input() tileSourceUrls: string[];
  osd: dragon.Viewer;
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

  constructor() { 
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

    console.log('text is');
    console.log(this.textIndexMap);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log('found ' + this.tileSourceUrls.length + ' urls');
    this.order = new Array<number>(this.tileSourceUrls.length);
    // const tileSources = this.tileSourceUrls.map(tileSourceUrl => new dragon.IIIFTileSource({'url': tileSourceUrl}));

    this.osd = new dragon.Viewer({
      element: this.viewer.nativeElement,
      // degrees: 90,
      showRotationControl: true,
      // Enable touch rotation on tactile devices
      gestureSettingsTouch: {
          pinchToZoom: true,            
      },
      prefixUrl: "//openseadragon.github.io/openseadragon/images/",
      autoResize: false,
      tileSources: this.tileSourceUrls,
    });

    setInterval(() => {
      if(this.imagesLoaded) {
        // console.log('images loaded');
        

        if(this.imageToViewIndex != this.currentPageIndex) {
          //console.log('loading new images');
          // reset text
          this.pageOneText = '';
          this.pageTwoText = '';

          try {
            this.osd.world.removeAll();
            this.osd.world.update();
            // add both images
            const firstImage = this.imageIndexMap.get(this.imageToViewIndex);
            console.log(firstImage);
            if(firstImage) {
              console.log('adding new image');
              this.osd.world.addItem(firstImage);
              
              // add text for page one
              if(this.textIndexMap.has(this.imageToViewIndex)) {
                this.pageOneText = this.textIndexMap.get(this.imageToViewIndex);
                console.log('setting text for page');
              }
              else {
                console.log('text not found');
              }

              const secondTiledImage = this.imageIndexMap.get(this.imageToViewIndex + 1);
              if(secondTiledImage) {
                this.osd.world.addItem(secondTiledImage);
                secondTiledImage.setPosition(new dragon.Point(1 + PAGE_BUFFER_SIZE, 0));
                // add text for page two
                if(this.textIndexMap.has(this.imageToViewIndex + 1)) {
                  this.pageTwoText = this.textIndexMap.get(this.imageToViewIndex + 1);
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
        //this.osd.world.setItemIndex()
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
            console.log(firstTiledImage);
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
    this.imageToViewIndex -= 2;
    console.log('prev pressed');
  }

  next(): void {
    this.imageToViewIndex += 2;
    console.log('next pressed');
    
  }

}
