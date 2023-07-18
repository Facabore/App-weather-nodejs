import { inq } from "./helpers/index.js";
import { Busquedas } from "./models/busqueda.js";

const main = async () => {
  const busquedas = new Busquedas();
  let opc;
  do {
    opc = await inq.preguntas();
    switch (opc) {
      case "1":
        // Buscar ciudad por nombre
        console.log("Busca una ciudad");
        const place = await inq.leerInput("Ciudad: ");
        // Buscar los lugares
        const  places = await busquedas.ciudad(place);
        // Seleccionar el lugar
        const id = await inq.listarLugares(places);
        if (id === "0") continue;
        const lugarSel = places.find( l => l.id === id);
        //Guardar en DB
        busquedas.agregarHistorial(lugarSel.nombre);
        // Clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
        // Mostrar resultados
        console.log("\nInformación de la ciudad\n".green);
        console.log(`Ciudad: ` + lugarSel.nombre.green);
        console.log(`Latitud: ` + lugarSel.lat);
        console.log(`Longitud: ` + lugarSel.lng);
        console.log(`Temperatura: ` + clima.temp);
        console.log(`Mínima: ` + clima.min);
        console.log(`Máxima: ` + clima.max);
        console.log(`Se siente como: ` + clima.feels_like);
        console.log(`Actualmente el clima es: ` + clima.description.green)
        break;
      case "2":
        console.log("Historial de búsquedas");
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;

    }
    await inq.pausa();
  } while (opc !== "0");
};

main();
