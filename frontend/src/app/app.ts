import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { FloatingContactComponent } from './components/floating-contact/floating-contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    FloatingContactComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Karthick Crackers';
  isAdminRoute = signal<boolean>(false);

  constructor(private router: Router) {
    this.checkAdminRoute(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkAdminRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkAdminRoute(url: string): void {
    this.isAdminRoute.set(url.startsWith('/admin'));
  }
}

