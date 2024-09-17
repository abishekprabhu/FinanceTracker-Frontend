import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeUpdateComponent } from './income-update.component';

describe('IncomeUpdateComponent', () => {
  let component: IncomeUpdateComponent;
  let fixture: ComponentFixture<IncomeUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncomeUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
