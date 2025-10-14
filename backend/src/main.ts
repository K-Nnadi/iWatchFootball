import {AppModule} from "./app.module";
import {GenericBootstrap} from "@iWatchFootball/base-tools/bootstrap/generic.bootstrap";
import {config} from "dotenv";
import {GlobalAuthGuard} from "./auth/guards/global-auth.guard";
import {SecurityInterceptor} from "./auth/interceptors/security.interceptor";

config();
const port = Number(process.env.PORT) || 8080

void GenericBootstrap(AppModule, port, {
    enableAuth: true,
    GlobalAuthGuard,
    SecurityInterceptor
});
