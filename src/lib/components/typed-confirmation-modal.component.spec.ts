import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypedConfirmationModalComponent } from './typed-confirmation-modal.component';

describe('TypedConfirmationModalComponent', () => {
  let component: TypedConfirmationModalComponent;
  let fixture: ComponentFixture<TypedConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypedConfirmationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypedConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
