import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import mime from 'mime';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

http.createServer(function (req, res) {
    if (req.url === '/1') {
        res.write('Strona glowna');
        res.end();
    }
    else if (req.url === '/2') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'To jest dokument JSON' }));
    }
    else if (req.url === '/3') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body>HTML w kodzie</body></html>');
    }
    else if (req.url === '/4') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Blad serwera');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
    else if (req.url.startsWith('/get_params')) {
        const queryObject = url.parse(req.url, true).query;
        console.log('Otrzymane parametry:', queryObject);
        const timestamp = Date.now();
        const filePath = path.join(__dirname, `params_${timestamp}.json`);

        fs.writeFile(filePath, JSON.stringify(queryObject, null, 2), (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Nie udało się zapisać danych' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: 'ok' }));
        });
    }
    else {
        const filePath = path.join(__dirname, 'assets', req.url);

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Plik nie znaleziony', status: 404 }));
            } else {
                const mimeType = mime.getType(filePath);  
                res.writeHead(200, { 'Content-Type': mimeType });
                fs.createReadStream(filePath).pipe(res);  
            }
        });
    }
}).listen(8080);
