import { parse } from 'csv-parse';
import fs from 'node:fs';

const csvPath = new URL('./tasks.csv', import.meta.url);
console.log('Caminho do arquivo CSV:', csvPath.pathname);

const stream = fs.createReadStream(csvPath);
stream.on('error', (err) => {
    console.error('Erro ao abrir o arquivo CSV:', err.message);
});

const csvParse = parse({
    delimiter: ';',
    skipEmptyLines: true,
    fromLine: 2
});

async function run() {
    const linesParse = stream.pipe(csvParse);

    for await (const line of linesParse) {
        console.log('Linha lida:', line);
        const [title, description] = line;

        if (!title || !description) {
            console.error('Dados inválidos:', line);
            continue;
        }

        console.log('Enviando tasks:', { title, description });

        await fetch('http://localhost:4444/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description
            })
        });

        // Uncomment this line to see the import working in slow motion (open the db.json)
        // await wait(1000)
    }

    console.log('Importação finalizada!');
}

run().catch(err => console.error('Erro ao processar CSV:', err));

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
