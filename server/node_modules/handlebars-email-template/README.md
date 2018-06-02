# Handlebars Email Template

[![Build Status](https://img.shields.io/travis/code-mattclaffey/handlebars-email-template.svg?branch=master&style=flat-square)](https://travis-ci.org/code-mattclaffey/handlebars-email-template)

> Using handlebars to create your email templates with ease.

## Setup
`npm install handlebars-email-template`

### Folder Structure

```
- data
  data.json
- views
	- partials
		table-row.hbs
	email.hbs
- index.js
```

### Email Template HTML
You can use the [HTML Snippets - Email Template](https://github.com/code-computerlove/HTML-Snippets/tree/master/responsive%20email%20template) as a starting point for your template.

## Usage

```js
var handlebarsEmailTemplate = require('handlebars-email-template');

var options = {
	root: 'views', // This is the root of your templates folder
	src: '_partials', // Partials folder
	dest: 'compiled', // Destination directory
	srcTemplate: 'email', // Src Template
	destTemplate: 'email', // Destination Template Name
	ext: 'hbs',
	data: 'data/data.json' // Path to data file
};

handlebarsEmailTemplate(options);

// Expected output

//- compiled
//	- email.html

```

## Options

- `root` - This is the root of your templates directory
- `src` -  Partials directory
- `dest` - Output directory
- `srcTemplate` - Name of the template eg: `email.hbs`
- `destTemplate` - Name of output file.
- `data` - path to data.
