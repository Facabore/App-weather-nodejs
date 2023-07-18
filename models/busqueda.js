import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: "./config/.env" }).parsed;
const TOKEN = process.env.TOKEN_ACCESS_MAPBOX;
const file = "./db/historial.json";
export class Busquedas {
  historial = [];
  constructor() {
    // Read the DB if exists path = "../db/historial.json"
    this.readDB();
  }

  get paramsMapbox() {
    return {
      access_token: TOKEN,
      limit: 5,
      language: "es",
    };
  }
  get paramsOpenWeather() {
    return {
      appid: process.env.TOKEN_ACCESS_OPENWEATHER,
      units: "metric",
      lang: "es",
    };
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(" ");
    });
  }

  async ciudad(lugar = "") {
    console.log("Se busca: ", lugar);
    try {
      // Petición HTTP
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (err) {
      console.log("Error", err);
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/3.0/onecall?`,
        params: { ...this.paramsOpenWeather, lat, lon },
      });

      const resp = await instance.get();
      return {
        temp: resp.data.current.temp,
        min: resp.data.daily[0].temp.min,
        max: resp.data.daily[0].temp.max,
        feels_like: resp.data.current.feels_like,
        description: resp.data.current.weather[0].description,
      };
    } catch (err) {
      console.log("Error", err);
      return [];
    }
  }
  async agregarHistorial(lugar = "") {
    // Prevent duplicate
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    // Limit the history to 6
    this.historial = this.historial.splice(0, 5);
    // Add the new place
    this.historial.unshift(lugar.toLocaleLowerCase());
    await this.guardarDB();
  }

  async guardarDB() {
    // Save the DB
    let payload = {
      historial: this.historial,
    };
    fs.writeFileSync(file, JSON.stringify(payload));
  }

  async readDB() {
    // Read the DB
    if (!fs.existsSync(file)) return;
    const info = fs.readFileSync(file, { encoding: "utf-8" });
    const data = JSON.parse(info);
    console.log(data);
    this.historial = data.historial;
  }
}
