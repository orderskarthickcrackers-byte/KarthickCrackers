import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  updateTitle(title: string): void {
    this.titleService.setTitle(title);
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
  }

  updateMetaDescription(desc: string): void {
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ name: 'twitter:description', content: desc });
  }

  updateCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.doc.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
    this.metaService.updateTag({ property: 'og:url', content: url });
  }

  updateOpenGraphImage(imageUrl: string): void {
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  setNoIndex(): void {
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  addJsonLd(schema: any, schemaId: string = 'dynamic-jsonld'): void {
    this.removeJsonLd(schemaId);
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = schemaId;
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  removeJsonLd(schemaId: string = 'dynamic-jsonld'): void {
    const existingScript = this.doc.getElementById(schemaId);
    if (existingScript) {
      existingScript.remove();
    }
  }
}
