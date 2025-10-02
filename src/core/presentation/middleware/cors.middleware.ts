import { env } from "../../../core/infra/config/environments";

export class CorsMiddleware {
  private readonly allowedOrigins: string[];
  private readonly allowedMethods: string[];
  private readonly allowedHeaders: string[];

  constructor() {
    const isProduction = env.NODE_ENV === "production";
    if (isProduction) {
      this.allowedOrigins = ["https://*"];
    } else {
      this.allowedOrigins = ["http://localhost:*"];
    }

    this.allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"];
    this.allowedHeaders = [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ];
  }

  handlePreflightRequest(request: Request): Response {
    const origin = request.headers.get("Origin");

    if (!this.isOriginAllowed(origin)) {
      return new Response("CORS: Origin not allowed", { status: 403 });
    }

    return new Response(null, {
      status: 200,
      headers: this.getCorsHeaders(origin),
    });
  }
  addCorsHeaders(response: Response, origin: string | null): Response {
    if (!this.isOriginAllowed(origin)) {
      return response;
    }

    const headers = new Headers(response.headers);

    // Add CORS headers
    const corsHeaders = this.getCorsHeaders(origin);
    for (const [key, value] of corsHeaders.entries()) {
      headers.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  private getCorsHeaders(origin: string | null): Headers {
    const headers = new Headers();

    if (origin && this.isOriginAllowed(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
    }

    headers.set("Access-Control-Allow-Methods", this.allowedMethods.join(", "));
    headers.set("Access-Control-Allow-Headers", this.allowedHeaders.join(", "));
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Max-Age", "86400"); // 24 hours

    return headers;
  }

  private isOriginAllowed(origin: string | null): boolean {
    if (!origin) {
      return false;
    }

    const isAllowed = this.allowedOrigins.some((allowedOrigin) => {
      return origin.startsWith(allowedOrigin.replace("*", ""));
    });

    return isAllowed;
  }
}
