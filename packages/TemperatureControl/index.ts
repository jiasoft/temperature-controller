import temperatureController from  './TemperatureControl.vue'
import { App } from "vue";
temperatureController.install = (app: App) => {
  app.component(temperatureController.name, temperatureController);
}
export default temperatureController