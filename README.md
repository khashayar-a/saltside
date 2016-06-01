# Saltside

## Seting up database
After installing mongodb you need to run mongo shell :

`mongo --shell`

Then you need to create database called "saltiside" and create collection called "birds"
```
> use saltside
switched to db saltside
> db.createCollection("birds")
{ "ok" : 1 }
```

## Installing server

`npm install`


## Running server
`npm start`


## Running tests

`npm install -g mocha`

`mocha -R spec tests/spec.js`
