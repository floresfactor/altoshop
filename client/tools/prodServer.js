const express = require('express');
const path = require('path');
const app = express();
const chalk = require('chalk');

const baseDir = process.env.NODE_ENV  == 'production' ? '/dist' : '/staging'; 
    
app.use(express.static(path.join(__dirname, '..' + baseDir )));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..'+ baseDir +'/index.html')));

app.listen(process.env.port || 3000, (err) => {
    if(err) {
        console.log(chalk.red('ERROR: '));
        console.log(chalk.bgYellow(err));
    } else {
        console.log(chalk.green('React app listening on port ' + (process.env.port || 3000)));
        console.log(chalk.green('Serving ' + process.env.NODE_ENV + ' from ' + baseDir ));
    }
});