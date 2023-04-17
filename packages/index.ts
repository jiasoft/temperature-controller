import temperatureController from "./TemperatureControl";

import { App } from "vue";

const install = (app: App) => {
  app.component(temperatureController.name, temperatureController);
  // app.use(zButton)
}

export { temperatureController }
export default { install }