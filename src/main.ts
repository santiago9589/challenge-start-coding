import { startServer } from './sever';
import {AppDataSource} from"./config/typeorm"


async function main() {
    AppDataSource.initialize().then(() => {
        console.log("conectado con exito")
    })
    .catch((error) => console.log(error))
    const port: number = Number(process.env.PORT);
    const app = await startServer();
    app.listen(port);
    console.log("App running on port", port);

    
}

main();