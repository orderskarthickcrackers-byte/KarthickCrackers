import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.html',
  styleUrl: './faq.scss'
})
export class Faq implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateTitle('Frequently Asked Questions (FAQ) | Karthick Crackers');
    this.seoService.updateMetaDescription('Find answers to common questions about buying Sivakasi crackers online, our price list, delivery, minimum order value, and payment methods.');
    this.seoService.updateCanonical('https://www.karthickcrackers.in/faq');

    this.seoService.addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the minimum order value?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The minimum order value for purchasing fireworks online from Karthick Crackers is ₹2,500.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do you offer Cash on Delivery (COD)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, we do not offer Cash on Delivery. Due to the nature of the product, we strictly accept UPI payments and bank transfers only.'
          }
        },
        {
          '@type': 'Question',
          name: 'Where do you deliver?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We deliver Sivakasi fireworks all over Tamil Nadu and major cities across India using verified and safe transport services.'
          }
        },
        {
          '@type': 'Question',
          name: 'Are your crackers authentic Sivakasi products?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, 100%. We source and manufacture our products directly in Sivakasi, ensuring premium quality and safety.'
          }
        }
      ]
    }, 'faq-schema');
  }
}
