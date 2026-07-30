import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const defaultFrontendOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://kanelitastore.com",
  "https://www.kanelitastore.com",
];

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

function getFrontendOrigins(configService: ConfigService) {
  const configuredOrigins =
    configService.get<string>("FRONTEND_ORIGINS") ??
    configService.get<string>("FRONTEND_ORIGIN") ??
    "";

  return Array.from(
    new Set([
      ...defaultFrontendOrigins,
      ...configuredOrigins
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean),
    ]),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendOrigins = getFrontendOrigins(configService);

  app.enableCors({
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (!origin || frontendOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();
