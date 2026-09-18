import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-proto-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proto-bar.component.html'
})
export class ProtoBarComponent {
  isMobile = false;

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  setDevice(mobile: boolean): void {
    this.isMobile = mobile;
    const frameOuter = document.getElementById('frame-outer');
    if (frameOuter) {
      if (mobile) {
        frameOuter.classList.add('is-mobile');
      } else {
        frameOuter.classList.remove('is-mobile');
      }
    }
  }
}
