import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentSetting {
  id: number;
  upiId: string;
  upiQrCodeUrl: string;
  callNumber: string;
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  updatedAt: string;
}

export interface UpdatePaymentSettingDto {
  upiId: string;
  callNumber: string;
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  callNumberSignal = signal<string>('+91 6380891094');
  upiIdSignal = signal<string>('9952378965@upi');
  upiQrCodeUrlSignal = signal<string>('assets/images/upi-qr.png');

  cleanPhoneSignal = computed(() => {
    const raw = this.callNumberSignal().replace(/\D/g, '');
    if (raw.length === 10) return `91${raw}`;
    if (raw.startsWith('91') && raw.length === 12) return raw;
    return raw || '916380891094';
  });

  displayPhoneSignal = computed(() => {
    const raw = this.callNumberSignal().trim();
    if (raw.includes(' ')) return raw;
    const digits = raw.replace(/\D/g, '');
    const tenDigits = digits.startsWith('91') && digits.length === 12 ? digits.substring(2) : digits;
    if (tenDigits.length === 10) {
      return `+91 ${tenDigits.substring(0, 5)} ${tenDigits.substring(5)}`;
    }
    return raw || '+91 6380891094';
  });

  constructor() {
    this.refreshSettings();
  }

  private updateState(setting: PaymentSetting): void {
    if (setting) {
      if (setting.callNumber) this.callNumberSignal.set(setting.callNumber);
      if (setting.upiId) this.upiIdSignal.set(setting.upiId);
      if (setting.upiQrCodeUrl) this.upiQrCodeUrlSignal.set(setting.upiQrCodeUrl);
    }
  }

  refreshSettings(): void {
    this.getPublicPaymentSettings().subscribe({
      next: (setting) => this.updateState(setting),
      error: () => {}
    });
  }

  // Get public payment settings
  getPublicPaymentSettings(): Observable<PaymentSetting> {
    return this.http.get<PaymentSetting>(`${this.apiUrl}/settings/payment`).pipe(
      tap(setting => this.updateState(setting))
    );
  }

  // Admin: Get payment settings
  getAdminPaymentSettings(): Observable<PaymentSetting> {
    return this.http.get<PaymentSetting>(`${this.apiUrl}/admin/settings/payment`).pipe(
      tap(setting => this.updateState(setting))
    );
  }

  // Admin: Update payment settings
  updatePaymentSettings(dto: UpdatePaymentSettingDto): Observable<PaymentSetting> {
    return this.http.put<PaymentSetting>(`${this.apiUrl}/admin/settings/payment`, dto).pipe(
      tap(setting => this.updateState(setting))
    );
  }

  // Admin: Upload QR Code Image
  uploadQrCode(file: File): Observable<{ qrCodeUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ qrCodeUrl: string; message: string }>(`${this.apiUrl}/admin/settings/payment/qr-code`, formData).pipe(
      tap(res => {
        if (res?.qrCodeUrl) this.upiQrCodeUrlSignal.set(res.qrCodeUrl);
      })
    );
  }

  // Admin: Change Password
  changePassword(dto: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/admin/settings/change-password`, dto);
  }
}
