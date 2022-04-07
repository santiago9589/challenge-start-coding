import {DataSource} from "typeorm" // modulo para conectarme a la base de datos
import path  from "path" // modulo para asignarle la ruta de donde tomara los datos con .join y 2 parametros
import dotenv from "dotenv"

dotenv.config()


export const AppDataSource =  // funcion para conectar a la base de datos
    new DataSource({ // configuraciones de la conexion a la base de datos
        type : "mysql",
        host : process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username:process.env.DB_USERNAME,
        password:process.env.DB_PASSWORD,
        database:process.env.DB_DATEBASE,
        entities:[
            path.join(__dirname,"../entity/**/**.ts") // configuracion a la ruta de las indentidades, las cuales las usa typeorm para construir las tablas
        ],
        synchronize: true,
        logging: false, 
    })
    
