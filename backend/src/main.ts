import {AppModule} from "./app.module";
import {GenericBootstrap} from "@iWatchFootball/base-tools/bootstrap/generic.bootstrap";
import {config} from "dotenv";

config();
// console.log(process.env.NODE_ENV);
void GenericBootstrap(AppModule, 3000);
