const express = require('express');
const { scrapeFlights } = require('./scraping-final');
const { scrapeOfertas } = require('./scraping-livelo');

const app = express();
app.use(express.json());

// Endpoint para buscar passagens
function getTimeStamp() {
  var now = new Date();
  return ((now.getDate()) + '/' +
          (now.getMonth() + 1) + '/' +
           now.getFullYear() + " " +
           now.getHours() + ':' +
           ((now.getMinutes() < 10)
               ? ("0" + now.getMinutes())
               : (now.getMinutes())) + ':' +
           ((now.getSeconds() < 10)
               ? ("0" + now.getSeconds())
               : (now.getSeconds())));
}

app.post('/search-flights', async (req, res) => {
  const { client, number, textMessage, origin, destination, departureDate } = req.body;

  // Validação básica dos dados recebidos
  if (!client || !number || !textMessage || !origin || !destination || !departureDate) {
    return res.status(400).json({
      error: 'Os campos client, number, textMessage, origin, destination e departureDate são obrigatórios.',
    });
  }

  // Converter a data para o formato YYYY-MM-DD
  const [day, month, year] = departureDate.split('/');
  const formattedDate = `${year}-${month}-${day}`;

  try {
    const result = await scrapeFlights({ origin, destination, departureDate: formattedDate });

    // Retornar o texto diretamente no campo "results"
    return res.json({
      client,
      number,
      textMessage,
      results: result.result, // Acessa diretamente o texto do retorno
    });
  } catch (error) {
    console.error('Erro durante a execução do endpoint:', error);
    return res.status(500).json({ error: 'Erro durante o scraping. Tente novamente mais tarde.' });
  }
});

// Endpoint para buscar passagens
app.post('/ofertas-livelo', async (req, res) => {
  try {
    const result = await scrapeOfertas();

    // Retornar o texto diretamente no campo "results"
    const origin = "Livelo";
    const timestamp = getTimeStamp();
    const message = "Promoções encontradas";
    return res.json({
      origin,
      message,
      timestamp,
      results: result.result, // Acessa diretamente o texto do retorno
    });
  } catch (error) {
    console.error('Erro durante a execução do endpoint:', error);
    return res.status(500).json({ error: 'Erro durante o scraping. Tente novamente mais tarde.' });
  }
});


// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
