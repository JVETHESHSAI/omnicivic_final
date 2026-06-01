import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { MapPin, CommunityBranding } from '../../shared/models/models';

declare const L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  pins: MapPin[] = [];
  loading = true;
  branding: CommunityBranding | null = null;

  statusFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';

  private map: any = null;
  private markers: any[] = [];
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.branding = this.auth.getCurrentUser()?.branding ?? null;
    this.api.getMapPins().subscribe({
      next: pins => {
        this.pins = pins ?? [];
        this.loading = false;
        // If map already exists, redraw pins
        if (this.map) this.draw();
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit() {
    // Wait for the container to have a real height before initializing
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.mapEl?.nativeElement?.offsetHeight > 0) {
          this.resizeObserver?.disconnect();
          this.zone.run(() => this.initMap());
        }
      });
      this.resizeObserver.observe(this.mapEl.nativeElement);

      // Also try immediately in case it's already sized
      setTimeout(() => {
        if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
          this.zone.run(() => this.initMap());
        }
      }, 100);
    });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.map) { try { this.map.remove(); } catch {} }
  }

  private initMap() {
    if (this.map || !this.mapEl || typeof L === 'undefined') return;
    const lat = this.branding?.mapCenterLat ?? 11.0168;
    const lng = this.branding?.mapCenterLng ?? 76.9558;
    const zoom = this.branding?.mapZoom ?? 16;

    this.map = L.map(this.mapEl.nativeElement, { attributionControl: false }).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

    // Inject pin animation CSS
    const style = document.createElement('style');
    style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
    document.head.appendChild(style);

    // Invalidate size after tile layer is added
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);

    this.draw();
  }

  setFilter(f: typeof this.statusFilter) {
    this.statusFilter = f;
    this.draw();
  }

  get visiblePins(): MapPin[] {
    if (this.statusFilter === 'all') return this.pins;
    return this.pins.filter(p => {
      if (this.statusFilter === 'OPEN') return p.status === 'OPEN' || p.status === 'SUBMITTED' || p.status === 'ASSIGNED';
      if (this.statusFilter === 'IN_PROGRESS') return p.status === 'IN_PROGRESS' || p.status === 'PROOF_SUBMITTED';
      if (this.statusFilter === 'RESOLVED') return p.status === 'RESOLVED' || p.status === 'CLOSED';
      return true;
    });
  }

  get counts() {
    return {
      all: this.pins.length,
      OPEN: this.pins.filter(p => p.status === 'OPEN' || p.status === 'SUBMITTED' || p.status === 'ASSIGNED').length,
      IN_PROGRESS: this.pins.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PROOF_SUBMITTED').length,
      RESOLVED: this.pins.filter(p => p.status === 'RESOLVED' || p.status === 'CLOSED').length,
    };
  }

  useMyLocation() {
    if (!navigator.geolocation || !this.map) return;
    navigator.geolocation.getCurrentPosition(pos => {
      this.map.flyTo([pos.coords.latitude, pos.coords.longitude], 18, { duration: 0.6 });
    });
  }

  recenter() {
    if (!this.map) return;
    const lat = this.branding?.mapCenterLat ?? 11.0168;
    const lng = this.branding?.mapCenterLng ?? 76.9558;
    const zoom = this.branding?.mapZoom ?? 16;
    this.map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }

  private draw() {
    if (!this.map) return;
    this.markers.forEach(m => { try { this.map.removeLayer(m); } catch {} });
    this.markers = [];

    this.visiblePins.forEach(p => {
      const color = (p.status === 'OPEN' || p.status === 'SUBMITTED') ? '#B5564A' :
                    (p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS' || p.status === 'PROOF_SUBMITTED') ? '#D4A24C' :
                    '#7B9576';
      const isResolved = p.status === 'RESOLVED' || p.status === 'CLOSED';
      const html = `
        <div style="position:relative;width:16px;height:16px;cursor:pointer;">
          <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2.5px solid #FAF9F5;box-shadow:0 2px 5px rgba(0,0,0,0.35);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
          ${!isResolved ? `<div style="position:absolute;inset:-3px;border-radius:50%;background:${color};opacity:0.45;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
        </div>`;
      const icon = L.divIcon({ html, className: '', iconSize: [16,16], iconAnchor: [8,8] });
      const m = L.marker([p.latitude, p.longitude], { icon })
        .addTo(this.map)
        .bindTooltip(`<strong>${p.categoryName}</strong><br>${p.description.substring(0,60)}${p.description.length>60?'…':''}`, { direction: 'top', offset: [0,-8] });
      m.on('click', () => {
        this.zone.run(() => {
          this.router.navigate(['/complaints'], { queryParams: { id: p.complaintId } });
        });
      });
      this.markers.push(m);
    });
  }
}
