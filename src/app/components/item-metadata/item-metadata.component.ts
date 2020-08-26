import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CONTENTdmItem, CONTENTdmItemField } from 'src/app/models/contentdm-item.model';

@Component({
  selector: 'app-item-metadata',
  templateUrl: './item-metadata.component.html',
  styleUrls: ['./item-metadata.component.scss']
})
export class ItemMetadataComponent implements OnInit {
  @Input() item$: Observable<CONTENTdmItem>;
  constructor() { }

  ngOnInit(): void {
  }
  
  filterFields(fields: CONTENTdmItemField[]): CONTENTdmItemField[] {
    return fields.filter(fieldName => !fieldName.key.startsWith('relat'));
  }

}
