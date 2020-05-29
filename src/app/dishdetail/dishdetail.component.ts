import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentForm, Comment } from '../shared/comment'

import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  errMess:string;
  dish: Dish;
  tempdish: CommentForm;
  tempComment:Comment;
  dishIds: string[];
  prev: string;
  next: string;

  commentForm : FormGroup;
  comment: CommentForm;

  @ViewChild('fform') commentFormDirective;


  formErrors = {
    'comment': '',
    'author': '',
  };

  validationMessages = {
    'comment': {
      'required':      'Comment is required.'
    },
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id);}, errmes => this.errMess = <any>errmes);
  }

  createForm(){
    this.commentForm = this.fb.group({
      rating: 5,
      comment: ['', [Validators.required] ],
      author: ['', [Validators.required, Validators.minLength(2)] ]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: CommentForm) {
    if (!this.commentForm) { return; }
    if(data){
      if(data.comment){
      console.log("Dataaa");
      console.log(data);
      this.tempdish = data;
      }
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {

    this.comment = this.commentForm.value;
    console.log("Submit\n");
    console.log(this.comment);
    // this.commentForm.reset({
    //   rating : 5,
    //   comment : 'Deepak',
    //   author : ''
    // });
    let d = new Date();
    console.log(d.toISOString());
    this.tempComment = new Comment();
    this.tempComment.author = this.comment.author;
    this.tempComment.comment = this.comment.comment;
    this.tempComment.rating = this.comment.rating;
    this.tempComment.date = d.toISOString();
    this.tempdish = undefined;
    console.log(this.tempComment);
    this.dish.comments.push(this.tempComment);
    this.commentFormDirective.resetForm({
      rating : 5,
      comment : '',
      author : ''
    });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

}
