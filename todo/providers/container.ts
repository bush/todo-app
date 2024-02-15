import Container from "../../common/ioc/container";
import configProvider from "./config";
import expressProvider from "./express";
import middlewareProvider from "./middleware";
import databaseProvider from "./database";
import todoProvider from "./todo";
import appProvider from "./app";
import { AppContainer } from "./interface";

export default function () {
  let container = new Container();
  configProvider(container);
  expressProvider(container);
  middlewareProvider(container);
  databaseProvider(container);
  todoProvider(container);
  appProvider(container);
  return container as AppContainer;
}