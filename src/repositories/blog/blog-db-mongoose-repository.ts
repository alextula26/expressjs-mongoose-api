import { BlogModel, PostModel } from '../../repositories/db-mongoose'

import {
  BlogType,
  PostType,
  BlogViewModel,
  PostViewModel,
  QueryBlogModel,
  QueryPostModel,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types'

export class BlogRepository {
  async findAllBlogs({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryBlogModel): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10
    
    const filter: any = {}
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const totalCount = await BlogModel.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const blogs: BlogType[] = await BlogModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean()

    return this._getBlogsViewModelDetail({
      items: blogs,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  }
  async findBlogById(id: string): Promise<BlogViewModel | null> {
    const foundBlog: BlogType | null = await BlogModel.findOne({ id })

    if (!foundBlog) {
      return null
    }

    return this._getBlogViewModel(foundBlog)
  }
  async findPostsByBlogId(blogId: string, {
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10

    const filter: any = { blogId: { $eq: blogId } }
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    if (searchNameTerm) {
      filter.title = { $regex: searchNameTerm, $options: 'i' }
    }

    const totalCount = await PostModel.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const posts: PostType[] = await PostModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean()

    return this._getPostsViewModelDetail({
      items: posts,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  }
  async createdBlog(createdBlog: BlogType): Promise<BlogViewModel> {
    await BlogModel.create(createdBlog)

    return this._getBlogViewModel(createdBlog)
  }
  async createdPostByBlogId(createdPost: PostType): Promise<PostViewModel> {
    await PostModel.create(createdPost)

    return this._getPostViewModel(createdPost)
  }
  async updateBlog({id, name, description, websiteUrl }: BlogType): Promise<boolean> {
    const { matchedCount } = await BlogModel.updateOne({ id }, {
      $set: {
        name,
        description,
        websiteUrl,
      }
    })

    return matchedCount === 1
  }
  async deleteBlogById(id: string): Promise<boolean> {
    const { deletedCount } = await BlogModel.deleteOne({ id })

    return deletedCount === 1
  }
  _getBlogViewModel(dbBlog: BlogType): BlogViewModel {
    return {
      id: dbBlog.id,
      name: dbBlog.name,
      description: dbBlog.description,
      websiteUrl: dbBlog.websiteUrl,
      createdAt: dbBlog.createdAt,
    }
  }
  _getPostViewModel(dbPost: PostType): PostViewModel {
    return {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      createdAt: dbPost.createdAt,
    }
  }
  _getBlogsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<BlogType>): ResponseViewModelDetail<BlogViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        websiteUrl: item.websiteUrl,
        createdAt: item.createdAt,
      })),
    }
  }
  _getPostsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<PostType>): ResponseViewModelDetail<PostViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        shortDescription: item.shortDescription,
        content: item.content,
        blogId: item.blogId,
        blogName: item.blogName,
        createdAt: item.createdAt,
      })),
    }
  }
}