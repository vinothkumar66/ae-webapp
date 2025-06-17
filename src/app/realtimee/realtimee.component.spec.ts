import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeeComponent } from './realtimee.component';

describe('RealtimeeComponent', () => {
  let component: RealtimeeComponent;
  let fixture: ComponentFixture<RealtimeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
