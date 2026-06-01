import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Category, CommunityBranding } from '../../../shared/models/models';

declare const L: any;

@Component({
  selector: 'app-submit-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './submit-complaint.component.html',
  styleUrls: ['./submit-complaint.component.scss']
})
export class SubmitComplaintComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;
  @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;
  private readonly allowedRadiusMeters = 200;

  form: FormGroup;
  categories: Category[] = [];
  photos: string[] = [];
  branding: CommunityBranding | null = null;

  loading = false;
  errorMsg = '';
  locationError = '';
  successMsg = '';
  showCameraModal = false;
  cameraError = '';
  cameraStarting = false;

  private map: any = null;
  private pin: any = null;
  private resizeObserver: ResizeObserver | null = null;
  private cameraStream: MediaStream | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private zone: NgZone
  ) {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required]
    });
  }

  get themeColor(): string {
    return this.branding?.themeColor || '#7B9576';
  }

  ngOnInit() {
    this.branding = this.auth.getCurrentUser()?.branding ?? null;
    this.api.getCategories().subscribe(c => this.categories = (c ?? []).filter(x => x.active));
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.mapEl?.nativeElement?.offsetHeight > 0) {
          this.resizeObserver?.disconnect();
          this.zone.run(() => this.initMap());
        }
      });
      this.resizeObserver.observe(this.mapEl.nativeElement);
      setTimeout(() => {
        if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
          this.zone.run(() => this.initMap());
        }
      }, 150);
    });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.stopCamera();
    if (this.map) { try { this.map.remove(); } catch {} }
  }

  private initMap() {
    if (this.map || !this.mapEl || typeof L === 'undefined') return;
    const lat = this.branding?.mapCenterLat ?? 11.0168;
    const lng = this.branding?.mapCenterLng ?? 76.9558;
    const zoom = this.branding?.mapZoom ?? 16;

    this.map = L.map(this.mapEl.nativeElement, { attributionControl: false }).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
    this.map.on('click', (e: any) => this.zone.run(() => this.placePin(e.latlng.lat, e.latlng.lng)));

    const style = document.createElement('style');
    style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
    document.head.appendChild(style);

    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
    this.placePin(lat, lng);
  }

  private placePin(lat: number, lng: number) {
    if (!this.map) return;
    this.form.patchValue({ latitude: lat, longitude: lng });
    this.locationError = this.validatePinnedLocation(lat, lng);
    if (!this.locationError && this.errorMsg === 'This location is outside your community area. Please choose a point inside your location.') {
      this.errorMsg = '';
    }
    const html = `
      <div style="position:relative;width:18px;height:18px;">
        <div style="position:absolute;inset:0;background:#B5564A;border-radius:50%;border:3px solid #FAF9F5;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:grab;"></div>
        <div style="position:absolute;inset:-3px;border-radius:50%;background:#B5564A;opacity:0.35;animation:pin-pulse 1.8s ease-out infinite;"></div>
      </div>`;
    const icon = L.divIcon({ html, className: '', iconSize: [18,18], iconAnchor: [9,9] });
    if (this.pin) this.map.removeLayer(this.pin);
    this.pin = L.marker([lat, lng], { icon, draggable: true }).addTo(this.map);
    this.pin.on('dragend', (e: any) => this.zone.run(() => {
      const ll = e.target.getLatLng();
      this.form.patchValue({ latitude: ll.lat, longitude: ll.lng });
      this.locationError = this.validatePinnedLocation(ll.lat, ll.lng);
      if (!this.locationError && this.errorMsg === 'This location is outside your community area. Please choose a point inside your location.') {
        this.errorMsg = '';
      }
    }));
  }

  useMyLocation() {
    if (!navigator.geolocation) { this.errorMsg = 'Your browser does not support geolocation.'; return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.placePin(pos.coords.latitude, pos.coords.longitude);
        this.map?.flyTo([pos.coords.latitude, pos.coords.longitude], 18, { duration: 0.6 });
      },
      () => { this.errorMsg = 'Could not get your location. Please pin manually.'; }
    );
  }

  recenter() {
    const lat = this.branding?.mapCenterLat ?? 11.0168;
    const lng = this.branding?.mapCenterLng ?? 76.9558;
    const zoom = this.branding?.mapZoom ?? 16;
    this.map?.flyTo([lat, lng], zoom, { duration: 0.6 });
    this.placePin(lat, lng);
  }

  onFiles(e: any) {
    const files = Array.from(e.target.files ?? []) as File[];
    files.slice(0, 5 - this.photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base = result.split(',')[1];
        if (base) this.photos.push(base);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(i: number) { this.photos.splice(i, 1); }
  photoSrc(p: string): string { return 'data:image/jpeg;base64,' + p; }

  openCamera() {
    this.cameraError = '';
    this.showCameraModal = true;
    this.cameraStarting = true;
    setTimeout(() => void this.startCamera(), 0);
  }

  closeCamera() {
    this.showCameraModal = false;
    this.cameraError = '';
    this.stopCamera();
  }

  capturePhotoFromCamera() {
    const video = this.cameraVideo?.nativeElement;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      this.cameraError = 'Camera preview is not ready yet. Please try again.';
      return;
    }
    if (this.photos.length >= 5) {
      this.cameraError = 'You can upload up to 5 photos.';
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.cameraError = 'Could not capture the photo. Please try again.';
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', 0.88);
    const base = result.split(',')[1];
    if (!base) {
      this.cameraError = 'Could not capture the photo. Please try again.';
      return;
    }
    this.photos.push(base);
    this.errorMsg = '';
    this.closeCamera();
  }

  categoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('road') || n.includes('street')) return '🛣️';
    if (n.includes('light') || n.includes('electric')) return '💡';
    if (n.includes('water') || n.includes('plumb')) return '🚿';
    if (n.includes('lift') || n.includes('elevator')) return '🛗';
    if (n.includes('garden') || n.includes('landscape') || n.includes('green')) return '🌿';
    if (n.includes('security') || n.includes('guard')) return '🔒';
    if (n.includes('parking')) return '🅿️';
    if (n.includes('clean') || n.includes('waste') || n.includes('trash')) return '🗑️';
    if (n.includes('paint') || n.includes('wall')) return '🎨';
    if (n.includes('pest') || n.includes('insect')) return '🐛';
    if (n.includes('gym') || n.includes('sports')) return '🏋️';
    if (n.includes('play') || n.includes('child')) return '🛝';
    return '🔧';
  }

  submit() {
    if (this.form.invalid) return;
    const lat = this.form.get('latitude')?.value;
    const lng = this.form.get('longitude')?.value;
    this.locationError = this.validatePinnedLocation(lat, lng);
    if (this.locationError) {
      this.errorMsg = this.locationError;
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const payload = { ...this.form.value, mediaBase64List: this.photos };
    this.api.submitComplaint(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.duplicate) {
          this.errorMsg = res.message + ' You can upvote that existing complaint instead.';
          return;
        }
        this.successMsg = 'Your complaint has been submitted and is now open for review. Redirecting…';
        setTimeout(() => this.router.navigate(['/dashboard']), 1800);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Could not submit. Please try again.';
      }
    });
  }

  private validatePinnedLocation(lat: number | null, lng: number | null): string {
    if (lat == null || lng == null || !this.branding) return '';

    if (this.branding.mapBoundary) {
      const polygon = this.extractPolygonPoints(this.branding.mapBoundary);
      if (polygon.length > 0 && !this.pointInPolygon(lng, lat, polygon)) {
        return 'This location is outside your community area. Please choose a point inside your location.';
      }
    } else if (this.branding.mapCenterLat != null && this.branding.mapCenterLng != null) {
      const distance = this.haversineMeters(lat, lng, this.branding.mapCenterLat, this.branding.mapCenterLng);
      if (distance > this.allowedRadiusMeters) {
        return 'This location is outside your community area. Please choose a point inside your location.';
      }
    }

    return '';
  }

  private extractPolygonPoints(boundaryJson: string): number[][] {
    try {
      const root = JSON.parse(boundaryJson);
      const geometry = root?.type === 'Feature' ? root.geometry
        : root?.type === 'FeatureCollection' ? root?.features?.[0]?.geometry
        : root;
      if (geometry?.type !== 'Polygon' || !Array.isArray(geometry.coordinates?.[0])) {
        return [];
      }
      return geometry.coordinates[0]
        .filter((point: any) => Array.isArray(point) && point.length >= 2)
        .map((point: any) => [Number(point[0]), Number(point[1])]);
    } catch {
      return [];
    }
  }

  private pointInPolygon(x: number, y: number, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersects = ((yi > y) !== (yj > y))
        && (x < ((xj - xi) * (y - yi)) / (((yj - yi) || 1e-12)) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  private haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371000 * 2 * Math.asin(Math.sqrt(a));
  }

  private toRadians(value: number): number {
    return value * Math.PI / 180;
  }

  private async startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraStarting = false;
      this.cameraError = 'Camera access is not supported on this device or browser.';
      return;
    }

    this.stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }
        },
        audio: false
      });

      if (!this.showCameraModal) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      this.cameraStream = stream;
      const video = this.cameraVideo?.nativeElement;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      this.cameraStarting = false;
    } catch {
      this.cameraStarting = false;
      this.cameraError = 'Camera access was blocked. You can still upload a photo from your device.';
    }
  }

  private stopCamera() {
    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = null;
    const video = this.cameraVideo?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    this.cameraStarting = false;
  }
}
