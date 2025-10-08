import {AppModule} from "./app.module";
import {GenericBootstrap} from "@iWatchFootball/base-tools/bootstrap/generic.bootstrap";
import {config} from "dotenv";

config();
const port = Number(process.env.PORT) || 3000
void GenericBootstrap(AppModule, port);
