// 

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-certificate-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Certificate</h2>
    <mat-dialog-content class="certificate-content">
      <ng-container *ngIf="data.certificateUrl; else noCert">
        <img [src]="data.certificateUrl"
             alt="Certificate"
             class="certificate-image">
      </ng-container>
      <ng-template #noCert>
        <p>No certificate available</p>
      </ng-template>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .certificate-content {
      max-height: 75vh;
      overflow: auto;
    }
    .certificate-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: auto;
    }
    p {
      text-align: center;
      color: gray;
    }
  `]
})
export class CertificateDialog {
  constructor(
    public dialogRef: MatDialogRef<CertificateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { certificateUrl: string },
        private sanitizer: DomSanitizer
  ) {
    
  }
}
