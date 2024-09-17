import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../Service/Category/category.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  categories: CategoryDTO[] =[];

  constructor (private categoryService: CategoryService,
    private message : NzMessageService,
    private fb : FormBuilder,
    private router : Router
  ){}

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(15), Validators.minLength(3), Validators.pattern(/^[a-zA-Z ]*$/)]]
  })

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories():void{
    this.categoryService.getAllCategories().subscribe(
      {
        next:(res) => {console.log(res);
          this.categories = res;},
        error:(err) => this.message.error(`Error Fetching Categories ${err.message}`,{nzDuration:5000})
      }
    )
  }

  addCategory():void{
    this.categoryService.createCategory(this.categoryForm.value).subscribe(
      {
        next:(v)=> {
          this.message.success("New Category Added.",{nzDuration:5000}); 
          this.getCategories();
      },
        error:(err)=> this.message.error(`Something went Wrong ${err.message}`,{nzDuration:5000})
      }
    )
  }

  updateCategory(categoryId:number){
    console.log(categoryId);
    this.router.navigateByUrl(`/user/category/${categoryId}/edit`);

  }

  deleteCategory(categoryId:number):void{
    this.categoryService.DeleteCategory(categoryId).subscribe(
      {
        next:(v) => this.message.success("Category Successfully Deleted",{nzDuration:4000}),
        error:(err) => this.message.error(`Error While deleting ${err.message}`,{nzDuration:5000})
      }
    )
  }

}
