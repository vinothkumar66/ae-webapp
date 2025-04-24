import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticControlComponent } from './analytic-control.component';

describe('AnalyticControlComponent', () => {
  let component: AnalyticControlComponent;
  let fixture: ComponentFixture<AnalyticControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
