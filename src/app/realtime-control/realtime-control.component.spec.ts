import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeControlComponent } from './realtime-control.component';

describe('RealtimeControlComponent', () => {
  let component: RealtimeControlComponent;
  let fixture: ComponentFixture<RealtimeControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
