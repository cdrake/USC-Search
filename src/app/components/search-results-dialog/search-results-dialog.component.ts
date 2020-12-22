import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-search-results-dialog',
  templateUrl: './search-results-dialog.component.html',
  styleUrls: ['./search-results-dialog.component.scss']
})
export class SearchResultsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SearchResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  
}
