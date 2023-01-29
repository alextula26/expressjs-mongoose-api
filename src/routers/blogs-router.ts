import { Router } from 'express'
import { blogsController } from '../composition-roots'
import {
  authBasicMiddleware,
  nameBlogValidation,
  descriptionBlogValidation,
  websiteUrlBlogValidation,
  titlePostValidation,
  shortPostDescriptionValidation,
  contentPostValidation,
  inputValidationMiddleware,
} from '../middlewares'

export const blogsRouter = Router()

const middlewares = [
  authBasicMiddleware,
  nameBlogValidation,
  descriptionBlogValidation,
  websiteUrlBlogValidation,
  inputValidationMiddleware
]

const middlewaresPost = [
  authBasicMiddleware,
  titlePostValidation,
  shortPostDescriptionValidation,
  contentPostValidation,
  inputValidationMiddleware
]

blogsRouter
  .get('/', blogsController.getBlogs.bind(blogsController))
  .get('/:id', blogsController.getBlog.bind(blogsController))
  .get('/:blogId/posts', blogsController.getPostsByBlogId.bind(blogsController))
  .post('/', middlewares, blogsController.createBlog.bind(blogsController))
  .post('/:blogId/posts', middlewaresPost, blogsController.createPostByBlogId.bind(blogsController))  
  .put('/:id', middlewares, blogsController.updateBlog.bind(blogsController))
  .delete('/:id', authBasicMiddleware, blogsController.deleteBlog.bind(blogsController))
