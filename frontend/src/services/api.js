import axios from "axios";


const api = axios.create({

    // Em desenvolvimento, o Vite encaminha /api para o FastAPI. Usar uma URL
    // relativa evita que "localhost" aponte para a máquina errada quando o
    // frontend é acessado por outro hostname ou endereço IP.
    baseURL: import.meta.env.VITE_API_URL || "/api"

});


export default api;
