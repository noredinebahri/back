const { spawn } = require('child_process');
const path = require('path');

function generateResponse(prompt) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [path.join(__dirname, 'gpt_integration.py'), prompt]);

        pythonProcess.stdout.on('data', (data) => {
            resolve(data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(`Erreur : ${data}`);
        });
    });
}

module.exports = { generateResponse };
