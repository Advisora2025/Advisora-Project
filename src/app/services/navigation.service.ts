import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare const bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {
    // Listen for navigation events to clean up modals
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cleanupAfterNavigation();
      });
  }

  navigateWithCleanup(url: string | string[]): void {
    this.closeAllModals();
    
    // Small delay to ensure modal cleanup before navigation
    setTimeout(() => {
      if (Array.isArray(url)) {
        this.router.navigate(url);
      } else {
        this.router.navigateByUrl(url);
      }
    }, 100);
  }

  closeAllModals(): void {
    try {
      // Hide all Bootstrap modals
      const modals = document.querySelectorAll('.modal.show');
      modals.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      });

      // Remove any remaining modal backdrops
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      // Clean up body classes
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    } catch (error) {
      console.warn('Error cleaning up modals:', error);
    }
  }

  private cleanupAfterNavigation(): void {
    // Ensure any remaining overlays are removed
    setTimeout(() => {
      this.closeAllModals();
    }, 0);
  }

  // Force change detection by triggering a zone update
  forceUiUpdate(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }
}
