// import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatDialog } from '@angular/material/dialog';
// import { CertificateDialog } from './certificate-dialog.component';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatButtonModule } from '@angular/material/button'
// import { CommonModule } from '@angular/common';



// @Component({
//   selector: 'app-consultant-details-dialog',
//   imports: [ MatChipsModule,
//     MatButtonModule, CommonModule],
//   templateUrl: './consultant-details-dialog.html',
//   styleUrl: './consultant-details-dialog.css'
// })
// export class ConsultantDetailsDialog {
//    constructor(
//     @Inject(MAT_DIALOG_DATA) public consultant: any,
//     private dialog: MatDialog
//   ) {}

//    viewCertificate(): void {
//     // Open certificate in new dialog
//     this.dialog.open(CertificateDialog, {
//        data: {
//       certificateUrl: this.consultant.certificateUrl 
//     },
//       width: '80%',
      
//       height: '90vw'
//     });
//   }

// }


import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CertificateDialog } from './certificate-dialog.component';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-consultant-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './consultant-details-dialog.html',
  styleUrls: ['./consultant-details-dialog.css']
})
export class ConsultantDetailsDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public consultant: any,
    private dialog: MatDialog
  ) {}

  viewCertificate(): void {
    this.dialog.open(CertificateDialog, {
      data: {
        certificateUrl: this.consultant.certificateUrl
      },
      width: '90%',
      maxWidth: '100vw',
      maxHeight: '90vh',
      panelClass: 'certificate-dialog-panel'
    });
  }
}
