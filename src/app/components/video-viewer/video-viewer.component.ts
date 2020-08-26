import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Observable } from 'rxjs';
import { CONTENTdmItem } from 'src/app/models/contentdm-item.model';

@Component({
  selector: 'app-video-viewer',
  templateUrl: './video-viewer.component.html',
  styleUrls: ['./video-viewer.component.scss']
})
export class VideoViewerComponent implements OnInit {
  @Input() video$: Observable<CONTENTdmItem>;
  @ViewChild('video') video: ElementRef;
  @ViewChild(MatSlideToggle) autoplay: MatSlideToggle;

  thumbnailUrls: string[];
  videoUrls: string[];

  constructor() { 
    
  }

  ngOnInit(): void {
    this.video$.subscribe(video => {
      this.thumbnailUrls = this.getThumbnailUrls(video);
      this.videoUrls = this.getVideoUrls(video);
    });
  }

  getFieldSplit(fieldName: string, item: CONTENTdmItem) {
    return item.fields.find(rel => rel.key === fieldName)?.value.split(';');
  }

  getThumbnailUrls(item: CONTENTdmItem ): string[] {
    return this.getFieldSplit('relata', item);
  }

  getVideoUrls(item: CONTENTdmItem): string[] {
    return this.getFieldSplit('relate', item);
  }

  getVideoUrl(thumbnailUrl: string): string {
    const index = this.thumbnailUrls.indexOf(thumbnailUrl);
    return this.videoUrls[index];
  }

  changeVideo(event: Event, thumbnailUrl: string): void {
    this.video.nativeElement.src = this.getVideoUrl(thumbnailUrl);
    this.video.nativeElement.setAttribute('autoplay', true);
  }

  onVideoEnded(event: Event): void {
    
    console.log('video ended');
    if(this.autoplay.checked) {
      console.log('playing next video');
      this.video.nativeElement.setAttribute('autoplay', true);
      let index = this.videoUrls.indexOf(this.video.nativeElement.src);
      if(index === this.videoUrls.length - 1) {
        index = 0;
      }
      else {
        index++;
      }
      this.video.nativeElement.src = this.videoUrls[index];
    }
    else {
      this.video.nativeElement.setAttribute('autoplay', false);
    }
  }
}
