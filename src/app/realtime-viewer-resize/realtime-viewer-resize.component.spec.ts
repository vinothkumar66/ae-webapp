import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeViewerResizeComponent } from './realtime-viewer-resize.component';

describe('RealtimeViewerResizeComponent', () => {
  let component: RealtimeViewerResizeComponent;
  let fixture: ComponentFixture<RealtimeViewerResizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeViewerResizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeViewerResizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
