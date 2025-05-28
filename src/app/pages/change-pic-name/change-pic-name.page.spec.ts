import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePicNamePage } from './change-pic-name.page';

describe('ChangePicNamePage', () => {
  let component: ChangePicNamePage;
  let fixture: ComponentFixture<ChangePicNamePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePicNamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
