import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
const port = 3000;

app.use(express.json());

interface LiteratureEntry {
    name: string;
    year: number;
}

async function scrapeLiteratureList(url: string): Promise<LiteratureEntry[]> {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const literatureList: LiteratureEntry[] = [];

        const tbody = $('tbody');
        tbody.find('tr').each((index, element) => {
            const tds = $(element).find('td');

            if (tds.length >= 2) {
                const name = tds.eq(0).text().trim();
                const year = parseInt(tds.eq(1).text().trim());

                if (name && !isNaN(year)) {
                    literatureList.push({ name, year });
                }
            }
        });

        return literatureList;
    } catch (error) {
        throw new Error('An error occurred while scraping the page.');
    }
}

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.post('/generate', async (req, res) => {
    const url = req.body.url;
    const literatureList = await scrapeLiteratureList(url);

    const generatedCode = `
        const literatureList = ${JSON.stringify(literatureList, null, 4)};
        console.log(literatureList);
    `;

    res.send(generatedCode);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});