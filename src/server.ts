import app from "./app";
import { AppDataSource } from "./infrastructure/database/data-source";

const PORT = process.env.PORT || 3333;

AppDataSource.initialize()
    .then(() => {
        console.log("Banco conectado!");
        app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
    })
    .catch((err) => console.error("Erro ao conectar no banco:", err));