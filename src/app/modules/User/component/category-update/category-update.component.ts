import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CategoryService } from '../../Service/Category/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';

@Component({
  selector: 'app-category-update',
  templateUrl: './category-update.component.html',
  styleUrl: './category-update.component.css',
})
export class CategoryUpdateComponent implements OnInit {
  user = StorageService.getUser();
  updateForm = this.fb.group({
    name: new FormControl('', [Validators.required]),
    userId: this.user.id,
  });

  id!: number;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private message: NzMessageService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // First set the id from the route
    this.user;
    this.id = +this.activateRoute.snapshot.paramMap.get('categoryId')!;
    console.log('Extracted ID from URL: ', this.id);
    if (this.id) {
      this.getCategoryById();
    } else {
      this.message.error('Invalid Category ID.', { nzDuration: 5000 });
    }
  }

  getCategoryById() {
    console.log('id' + this.id);
    this.categoryService.getCategoryById(this.id).subscribe({
      next: (v) => {
        this.updateForm.patchValue(v);
        console.log(v);
      },
      error: (err) =>
        this.message.error(`Something Went Wrong ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  onSubmit() {
    console.log('update form :', this.updateForm.value, 'id', this.id);
    this.categoryService
      .updateCategory(this.id, this.updateForm.value)
      .subscribe({
        next: (v) => {
          console.log(v);
          this.message.success('Category Updated Successfull.', {
            nzDuration: 5000,
          });
          this.router.navigateByUrl('/user/category');
        },
        error: (err) => {
          this.message.error(`Error While editing Category.${err.message}`, {
            nzDuration: 5000,
          });
        },
      });
  }
}
