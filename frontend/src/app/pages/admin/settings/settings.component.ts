import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { PaymentSettingsService, PaymentSetting, UpdatePaymentSettingDto, ChangePasswordDto } from '../../../services/payment-settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './settings.component.html'
})
export class AdminSettingsComponent implements OnInit {
  paymentSetting: PaymentSetting | null = null;
  loading = false;
  saving = false;
  uploadingQr = false;
  changingPassword = false;
  
  successMessage = '';
  errorMessage = '';

  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  adminOfficialEmail = 'karthickkumar2014000@gmail.com';

  formData: UpdatePaymentSettingDto = {
    upiId: '9952378965@upi',
    callNumber: '+91 6380891094',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  };

  passwordData: ChangePasswordDto = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  selectedFile: File | null = null;
  qrPreviewUrl: string = 'assets/images/upi-qr.png';

  private settingsService = inject(PaymentSettingsService);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.settingsService.getAdminPaymentSettings().pipe(
      catchError(() => this.settingsService.getPublicPaymentSettings()),
      catchError(() => of(null))
    ).subscribe({
      next: (data) => {
        if (data) {
          this.paymentSetting = data;
          this.formData = {
            upiId: data.upiId || '9952378965@upi',
            callNumber: data.callNumber || '+91 6380891094',
            accountHolder: data.accountHolder || '',
            bankName: data.bankName || '',
            accountNumber: data.accountNumber || '',
            ifscCode: data.ifscCode || ''
          };
          if (data.upiQrCodeUrl) {
            this.qrPreviewUrl = data.upiQrCodeUrl;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.warn('Using default payment settings due to fetch error:', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.qrPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadQrCode(): void {
    if (!this.selectedFile) return;

    this.uploadingQr = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.settingsService.uploadQrCode(this.selectedFile).subscribe({
      next: (res) => {
        this.uploadingQr = false;
        this.successMessage = 'UPI QR Code image updated successfully!';
        if (res.qrCodeUrl) {
          this.qrPreviewUrl = res.qrCodeUrl;
          if (this.paymentSetting) {
            this.paymentSetting.upiQrCodeUrl = res.qrCodeUrl;
          }
        }
        this.selectedFile = null;
      },
      error: (err) => {
        this.uploadingQr = false;
        console.error('Failed to upload QR image:', err);
        this.errorMessage = err?.error?.message || 'Failed to upload QR Code image.';
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.settingsService.updatePaymentSettings(this.formData).subscribe({
      next: (updated) => {
        this.saving = false;
        this.paymentSetting = updated;
        this.successMessage = 'Payment Settings updated successfully!';
      },
      error: (err) => {
        this.saving = false;
        console.error('Failed to save settings:', err);
        this.errorMessage = err?.error?.message || 'Failed to save payment settings.';
      }
    });
  }

  changePassword(): void {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      this.passwordErrorMessage = 'Please enter both current password and new password.';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmNewPassword) {
      this.passwordErrorMessage = 'New password and Confirm password do not match.';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.passwordErrorMessage = 'New password must be at least 6 characters long.';
      return;
    }

    this.changingPassword = true;
    this.settingsService.changePassword(this.passwordData).subscribe({
      next: (res) => {
        this.changingPassword = false;
        this.passwordSuccessMessage = res.message || 'Admin password updated successfully!';
        this.passwordData = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
      },
      error: (err) => {
        this.changingPassword = false;
        console.error('Failed to change password:', err);
        this.passwordErrorMessage = err?.error?.message || 'Failed to change admin password. Check current password.';
      }
    });
  }
}
