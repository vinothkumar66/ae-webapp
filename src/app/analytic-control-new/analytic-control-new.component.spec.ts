import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticControlNewComponent } from './analytic-control-new.component';

describe('AnalyticControlNewComponent', () => {
  let component: AnalyticControlNewComponent;
  let fixture: ComponentFixture<AnalyticControlNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticControlNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticControlNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
