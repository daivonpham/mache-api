import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogPublishStatus } from "src/modules/blog/constants/blog.types";
import { BlogPost } from "src/modules/blog/entities/blog-post.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { ProductReview } from "src/modules/review/entities/product-review.entity";
import { Repository } from "typeorm";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

@Injectable()
export class SitemapService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
  ) {}

  async buildSitemapXml(): Promise<string> {
    const entries = await this.collectEntries();
    const urls = entries.map((entry) => this.renderUrl(entry)).join("");
    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls +
      `</urlset>`
    );
  }

  buildRobotsTxt(): string {
    const siteUrl = this.getSiteUrl();
    return [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      "",
    ].join("\n");
  }

  private async collectEntries(): Promise<SitemapEntry[]> {
    const siteUrl = this.getSiteUrl();
    const pathProduct = this.normalizePath(
      this.configService.get<string>("sitemap.pathProduct", "/products"),
    );
    const pathBlog = this.normalizePath(
      this.configService.get<string>("sitemap.pathBlog", "/tin-tuc"),
    );
    const pathReview = this.normalizePath(
      this.configService.get<string>("sitemap.pathReview", "/review-sp"),
    );
    const staticPaths =
      this.configService.get<string[]>("sitemap.staticPaths") ?? [];

    const entries: SitemapEntry[] = staticPaths.map((path) => ({
      loc: this.joinUrl(siteUrl, path),
      changefreq: path === "/" ? "daily" : "daily",
      priority: path === "/" ? "1.0" : "0.8",
    }));

    const [products, posts, reviews] = await Promise.all([
      this.productRepository.find({
        select: ["slug", "updatedAt"],
        where: { isActive: true },
        order: { updatedAt: "DESC" },
      }),
      this.blogPostRepository.find({
        select: ["slug", "updatedAt"],
        where: {
          isActive: true,
          publishStatus: BlogPublishStatus.PUBLISHED,
        },
        order: { updatedAt: "DESC" },
      }),
      this.productReviewRepository.find({
        select: ["slug", "updatedAt"],
        where: { isActive: true },
        order: { updatedAt: "DESC" },
      }),
    ]);

    for (const product of products) {
      entries.push({
        loc: this.joinUrl(siteUrl, `${pathProduct}/${product.slug}`),
        lastmod: this.toLastmod(product.updatedAt),
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    for (const post of posts) {
      entries.push({
        loc: this.joinUrl(siteUrl, `${pathBlog}/${post.slug}`),
        lastmod: this.toLastmod(post.updatedAt),
        changefreq: "weekly",
        priority: "0.6",
      });
    }

    for (const review of reviews) {
      entries.push({
        loc: this.joinUrl(siteUrl, `${pathReview}/${review.slug}`),
        lastmod: this.toLastmod(review.updatedAt),
        changefreq: "weekly",
        priority: "0.6",
      });
    }

    return entries;
  }

  private getSiteUrl(): string {
    return (
      this.configService.get<string>("siteUrl") ||
      "https://www.thegioivandien.com"
    ).replace(/\/+$/, "");
  }

  private normalizePath(path: string): string {
    const trimmed = path.trim();
    if (!trimmed || trimmed === "/") return "";
    return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
  }

  private joinUrl(siteUrl: string, path: string): string {
    if (!path || path === "/") return `${siteUrl}/`;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${siteUrl}${normalized}`;
  }

  private toLastmod(date?: Date): string | undefined {
    if (!date) return undefined;
    return date.toISOString().slice(0, 10);
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private renderUrl(entry: SitemapEntry): string {
    const parts = [`<loc>${this.escapeXml(entry.loc)}</loc>`];
    if (entry.lastmod) {
      parts.push(`<lastmod>${entry.lastmod}</lastmod>`);
    }
    if (entry.changefreq) {
      parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
    }
    if (entry.priority) {
      parts.push(`<priority>${entry.priority}</priority>`);
    }
    return `<url>${parts.join("")}</url>`;
  }
}
