// sessionchat.ts
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ required for *ngIf

@Component({
  selector: 'app-sessionchat',
  standalone: true,
  imports: [CommonModule], // ✅ enable *ngIf
  templateUrl: './sessionchat.html',
})
export class Sessionchat implements OnInit {
  sanitizedMeetLink!: SafeResourceUrl; // ✅ match HTML

  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('sessionId') || 'MindVista-TEST123';
    const fullURL = `https://meet.jit.si/MindVista-${sessionId}`;
    this.sanitizedMeetLink = this.sanitizer.bypassSecurityTrustResourceUrl(fullURL);
  }
}
