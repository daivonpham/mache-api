import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BlogPostService } from "./blog-post.service";

@Injectable()
export class BlogPostSchedulerService {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts(): Promise<void> {
    await this.blogPostService.publishDueScheduledPosts();
  }
}
