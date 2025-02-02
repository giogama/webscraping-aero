const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
// const stealth = StealthPlugin();

// // By passing the problem : Maximum call stack size exceeded
// stealth.enabledEvasions.delete('iframe.contentWindow');
// stealth.enabledEvasions.delete('media.codecs');
// stealth.enabledEvasions.delete('navigator.hardwareConcurrency');
// stealth.enabledEvasions.delete('navigator.languages');
// stealth.enabledEvasions.delete('navigator.permissions');
// stealth.enabledEvasions.delete('navigator.plugins');
// stealth.enabledEvasions.delete('navigator.webdriver');
// stealth.enabledEvasions.delete('user-agent-override');
// stealth.enabledEvasions.delete('webgl.vendor');

// puppeteer.use(stealth);


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeOfertas = async ({ origin, destination, departureDate }) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.evaluateOnNewDocument(() => {
        delete Function.prototype.toString
    })

    console.log('Acessando o site...');
    await page.goto('https://livelo.com.br', { waitUntil: 'networkidle2' });

    console.log('Simulando comportamento humano...');
    await page.mouse.move(100, 100);
    await delay(6000);

    console.log('Aguardando a página carregar');
    await page.waitForSelector('img#img-brand');

    console.log('Capturando os dots');
    const dotsSelector = `div#owl-dots--default > button[aria-label*="Slide"]`;
    const dots = await page.$$(dotsSelector);
    let i = 0;
    for (const element of dots) {
      //const text = await page.evaluate((el) => el.innerHTML, element);
      //console.log(text);

      //document.querySelectorAll("div[class*='bannerTitles'] > h2")
      i++;
      console.log(`Clicando no dot: ${i}`);
      await element.click();
      await delay(500);
    }
    await delay(2000);

    console.log("Capturando todas as ofertas dos Banners");
    const ofertas = await page.evaluate(() => {
      const elements = document.querySelectorAll("div[class*='bannerTitles'] > h2");
      let result = [];

      if (elements)
      {
        let id = 0;
        elements.forEach(el => {
          id++;
          const titulo = el.innerHTML;
          const item = { id, titulo, subtitulo: ""};
          result.push(item);
        });
      }

      return result; // will return undefined if the element is not found
    });
    //console.log(ofertas);
    

    //Mock retorno
    // console.log('Fazendo o Mock do retorno');
    // const messages = ['Extra 5 pontos', 'Amazon 3 pontos', 'Carrefour 10 pontos'];
    // const infos = messages.map((m) => `${m.trim()}`);

    delay(20000);

    return { result: ofertas };

  } catch (error) {
    console.error('Erro durante o scraping:', error);
    throw error;
  } finally {
    console.log('Fechando o navegador...');
    await browser.close();
  }
};

module.exports = { scrapeOfertas };
