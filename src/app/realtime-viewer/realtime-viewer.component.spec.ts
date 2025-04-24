import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeViewerComponent } from './realtime-viewer.component';

describe('RealtimeViewerComponent', () => {
  let component: RealtimeViewerComponent;
  let fixture: ComponentFixture<RealtimeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
