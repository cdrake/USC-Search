import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CONTENTdmItem } from 'src/app/models/contentdm-item.model';

@Component({
  selector: 'app-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss']
})
export class AudioViewerComponent implements OnInit {
  @Input() audio$: Observable<CONTENTdmItem>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
